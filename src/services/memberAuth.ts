import { MemberProfile, MemberCredential, CardStatus } from '../types';
import { db, auth, getSecondaryAdminAuth } from './firebase';
import {
  signInWithEmailAndPassword,
  updatePassword as fbUpdatePassword,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

// Session storage key
const MEMBER_SESSION_KEY = 'aipeu_active_member_session';
const LOGIN_RATE_LIMIT_KEY = 'aipeu_login_attempts';

export interface MemberSession {
  memberId: string;
  membershipId: string;
  uid?: string;
  name: string;
  cadre: string;
  office: string;
  division: string;
  status: 'Active' | 'Pending' | 'Expired';
  mustChangePassword?: boolean;
  passwordStatus?: 'Default' | 'Updated';
  token: string;
  loginAt: string;
  expiresAt: number;
}

// Fast timeout wrapper so Auth/Firestore calls never hang on slow mobile connections
function withTimeout<T>(promise: Promise<T>, ms = 2200): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ================= PASSWORD HASHING (PBKDF2 SHA-256) =================
// Uses browser standard Web Crypto API (100,000 iterations, random salt)
// Never stores passwords in plaintext.

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const saltBytes = new Uint8Array(
    salt.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [0]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string, salt: string, storedHash: string): Promise<boolean> {
  try {
    const computedHash = await hashPassword(password, salt);
    return computedHash === storedHash;
  } catch {
    return false;
  }
}

// ================= UNGUESSABLE CARD TOKEN GENERATOR =================
export function generateUnguessableToken(): string {
  const randomBytes = new Uint8Array(18);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ================= MOBILE NUMBER NORMALIZER =================
export function normalizeMobileNumber(raw: string): string {
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.length === 10) return cleaned;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.slice(2);
  if (cleaned.length === 11 && cleaned.startsWith('0')) return cleaned.slice(1);
  return cleaned;
}

// ================= ABUSE & RATE LIMITING PROTECTION =================
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}

function getRateLimitRecord(identifier: string): RateLimitRecord {
  try {
    const data = JSON.parse(sessionStorage.getItem(LOGIN_RATE_LIMIT_KEY) || '{}');
    return data[identifier] || { attempts: 0, lockedUntil: 0 };
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function recordFailedAttempt(identifier: string): void {
  try {
    const data = JSON.parse(sessionStorage.getItem(LOGIN_RATE_LIMIT_KEY) || '{}');
    const record = data[identifier] || { attempts: 0, lockedUntil: 0 };
    record.attempts += 1;
    if (record.attempts >= 5) {
      record.lockedUntil = Date.now() + 15 * 60 * 1000;
    }
    data[identifier] = record;
    sessionStorage.setItem(LOGIN_RATE_LIMIT_KEY, JSON.stringify(data));
  } catch {}
}

function clearRateLimitRecord(identifier: string): void {
  try {
    const data = JSON.parse(sessionStorage.getItem(LOGIN_RATE_LIMIT_KEY) || '{}');
    delete data[identifier];
    sessionStorage.setItem(LOGIN_RATE_LIMIT_KEY, JSON.stringify(data));
  } catch {}
}

// ================= SECURE MEMBER LOGIN FLOW =================
export interface LoginResult {
  success: boolean;
  message?: string;
  member?: MemberProfile;
  session?: MemberSession;
  isLocked?: boolean;
}

export async function loginMember(identifierInput: string, passwordInput: string): Promise<LoginResult> {
  const cleanId = (identifierInput || '').trim();
  const cleanPass = (passwordInput || '').trim();

  if (!cleanId) {
    return {
      success: false,
      message: 'Please enter your registered 10-digit Mobile Number or Membership ID.',
    };
  }

  if (!cleanPass) {
    return {
      success: false,
      message: 'Please enter your password.',
    };
  }

  // Check rate limit lock
  const normalizedKey = cleanId.toLowerCase();
  const rateLimit = getRateLimitRecord(normalizedKey);
  if (rateLimit.lockedUntil && Date.now() < rateLimit.lockedUntil) {
    const minutesLeft = Math.ceil((rateLimit.lockedUntil - Date.now()) / (60 * 1000));
    return {
      success: false,
      isLocked: true,
      message: `Too many failed attempts. Login is temporarily locked for security. Please try again in ${minutesLeft} minute(s) or contact the Divisional Secretary.`,
    };
  }

  try {
    const {
      getCachedMembers,
      saveCachedMembers,
      getCachedCredentials,
      saveCachedCredential,
      INITIAL_SAMPLE_MEMBERS,
      getDeletedMemberIds,
    } = await import('./memberService');

    const normalizedMobile = normalizeMobileNumber(cleanId);
    let upperId = cleanId.toUpperCase();

    if (/^\d{4}$/.test(cleanId)) {
      upperId = `AIPEU-DKL-${cleanId}`;
    } else if (/^DKL-\d{4}$/i.test(cleanId)) {
      upperId = `AIPEU-${upperId}`;
    }

    const cleanEmail = cleanId.toLowerCase();
    const deletedSet = getDeletedMemberIds();

    // 1. Check local cached members first (contains instant Admin Portal additions & edits)
    const cachedList = getCachedMembers();
    let localDoc = cachedList.find(
      (m) =>
        !deletedSet.has(m.id) &&
        !deletedSet.has(m.membershipId.toUpperCase()) &&
        (m.membershipId.toUpperCase() === upperId ||
          (normalizedMobile.length === 10 && normalizeMobileNumber(m.mobile) === normalizedMobile) ||
          (cleanEmail.includes('@') && (m.email || '').toLowerCase() === cleanEmail))
    );

    // 2. Also query Firestore with fast timeout
    let firestoreDoc: MemberProfile | null = null;
    const membersCol = collection(db, 'members');

    try {
      const qById = query(membersCol, where('membershipId', '==', upperId), limit(1));
      const snapById = await withTimeout(getDocs(qById), 2000);
      if (!snapById.empty) {
        const d = snapById.docs[0];
        firestoreDoc = { id: d.id, ...d.data() } as MemberProfile;
      }
    } catch {}

    if (!firestoreDoc && normalizedMobile.length === 10) {
      try {
        const qByMobile = query(membersCol, where('mobile', '==', normalizedMobile), limit(1));
        const snapByMobile = await withTimeout(getDocs(qByMobile), 2000);
        if (!snapByMobile.empty) {
          const d = snapByMobile.docs[0];
          firestoreDoc = { id: d.id, ...d.data() } as MemberProfile;
        }
      } catch {}
    }

    // Choose whichever record is more recent between localDoc and firestoreDoc
    let memberDoc: MemberProfile | null = null;
    if (localDoc && firestoreDoc) {
      memberDoc =
        (localDoc.updatedAt || '') >= (firestoreDoc.updatedAt || '') ? localDoc : firestoreDoc;
    } else {
      memberDoc = localDoc || firestoreDoc || null;
    }

    // 3. Fallback to initial sample members if neither had it and not deleted
    if (!memberDoc) {
      const sampleMatch = INITIAL_SAMPLE_MEMBERS.find(
        (m) =>
          !deletedSet.has(m.id) &&
          !deletedSet.has(m.membershipId.toUpperCase()) &&
          (m.membershipId.toUpperCase() === upperId ||
            (normalizedMobile.length === 10 && normalizeMobileNumber(m.mobile) === normalizedMobile))
      );
      if (sampleMatch) {
        memberDoc = { ...sampleMatch };
      }
    }

    if (!memberDoc || deletedSet.has(memberDoc.id) || deletedSet.has(memberDoc.membershipId.toUpperCase())) {
      recordFailedAttempt(normalizedKey);
      return {
        success: false,
        message: 'Account not found. No member is registered with this Mobile Number or Membership ID.',
      };
    }

    // Check account status: only active accounts can log in
    if (memberDoc.status !== 'Active') {
      return {
        success: false,
        message:
          memberDoc.status === 'Pending'
            ? 'Your membership account is pending verification and approval by the Divisional Secretary.'
            : 'Your member account has been deactivated or expired. Please contact the Divisional Office to reactivate.',
      };
    }

    // ================= PASSWORD VERIFICATION =================
    let isPasswordValid = false;
    let authUserUid = memberDoc.uid || '';

    // Check cached credentials & Firestore memberCredentials
    const cachedCreds = getCachedCredentials();
    const localCred: MemberCredential | undefined =
      cachedCreds[memberDoc.membershipId.toUpperCase()] || cachedCreds[memberDoc.mobile];

    let firestoreCred: MemberCredential | null = null;
    try {
      const credDocRef = doc(db, 'memberCredentials', memberDoc.membershipId);
      const credSnap = await withTimeout(getDoc(credDocRef), 2000);
      if (credSnap.exists()) {
        firestoreCred = credSnap.data() as MemberCredential;
      }
    } catch {}

    // Pick newest credential record
    let credData: MemberCredential | null = null;
    if (localCred && firestoreCred) {
      credData =
        (localCred.updatedAt || '') >= (firestoreCred.updatedAt || '') ? localCred : firestoreCred;
    } else {
      credData = localCred || firestoreCred || null;
    }

    const mobileAuthEmail =
      credData?.authEmail ||
      (memberDoc.authEpoch && memberDoc.authEpoch > 1
        ? `${memberDoc.mobile || normalizedMobile}_v${memberDoc.authEpoch}@member.aipeudhenkanal.org`
        : `${memberDoc.mobile || normalizedMobile}@member.aipeudhenkanal.org`);

    // 1. Check PBKDF2 hash first (fast, offline-capable, and reflects immediate admin password resets)
    if (credData && credData.passwordHash && credData.salt) {
      isPasswordValid = await verifyPassword(cleanPass, credData.salt, credData.passwordHash);
    }

    // 2. Also verify or sign in with Firebase Authentication
    try {
      const userCredential = await withTimeout(
        signInWithEmailAndPassword(auth, mobileAuthEmail, cleanPass),
        2200
      );
      if (userCredential.user) {
        isPasswordValid = true;
        authUserUid = userCredential.user.uid;
      }
    } catch {
      // If Firebase Auth wasn't provisioned yet or timed out, rely on verified PBKDF2 hash
    }

    // 3. Fallback for default password 'Member@1234' on initial seed accounts without custom credentials
    if (
      !isPasswordValid &&
      cleanPass === 'Member@1234' &&
      (!credData || credData.passwordStatus === 'Default') &&
      memberDoc.passwordStatus !== 'Updated'
    ) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      recordFailedAttempt(normalizedKey);
      return {
        success: false,
        message: 'Incorrect password. Please verify and try again.',
      };
    }

    // Clear rate limits upon successful login
    clearRateLimitRecord(normalizedKey);

    const nowIso = new Date().toISOString();
    const mustChangePassword =
      credData?.mustChangePassword ??
      memberDoc.mustChangePassword ??
      (credData?.passwordStatus !== 'Updated' && memberDoc.passwordStatus !== 'Updated');
    const passwordStatus = mustChangePassword ? 'Default' : 'Updated';

    // Update member record locally & in Firestore with lastLogin
    memberDoc.lastLogin = nowIso;
    if (authUserUid) memberDoc.uid = authUserUid;
    memberDoc.mustChangePassword = mustChangePassword;
    memberDoc.passwordStatus = passwordStatus;
    memberDoc.updatedAt = nowIso;

    // Update cached members list
    const updatedList = [
      memberDoc,
      ...cachedList.filter(
        (m) => m.id !== memberDoc!.id && m.membershipId !== memberDoc!.membershipId
      ),
    ];
    saveCachedMembers(updatedList);

    if (credData) {
      credData.lastLogin = nowIso;
      credData.updatedAt = nowIso;
      saveCachedCredential(credData);
    }

    // Non-blocking background sync to Firestore & Firebase Auth
    (async () => {
      try {
        if (!authUserUid) {
          const secAuth = getSecondaryAdminAuth();
          const created = await withTimeout(
            createUserWithEmailAndPassword(secAuth, mobileAuthEmail, cleanPass),
            2000
          );
          authUserUid = created.user.uid;
          await fbSignOut(secAuth);
        }
      } catch {}

      try {
        await withTimeout(
          Promise.all([
            setDoc(
              doc(db, 'members', memberDoc!.id),
              {
                lastLogin: nowIso,
                uid: authUserUid || memberDoc!.uid || '',
                updatedAt: nowIso,
              },
              { merge: true }
            ),
            setDoc(
              doc(db, 'memberCredentials', memberDoc!.membershipId),
              {
                uid: authUserUid || memberDoc!.uid || '',
                authEmail: mobileAuthEmail,
                lastLogin: nowIso,
                updatedAt: nowIso,
              },
              { merge: true }
            ),
          ]),
          2200
        );
      } catch {}
    })();

    // Create secure member session (8 hours validity)
    const sessionToken = generateUnguessableToken();
    const session: MemberSession = {
      memberId: memberDoc.id,
      membershipId: memberDoc.membershipId,
      uid: authUserUid || memberDoc.uid,
      name: memberDoc.name,
      cadre: memberDoc.cadre,
      office: memberDoc.office,
      division: memberDoc.division || 'Dhenkanal',
      status: memberDoc.status,
      mustChangePassword,
      passwordStatus,
      token: sessionToken,
      loginAt: nowIso,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    };

    sessionStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(session));
    try {
      localStorage.setItem('aipeu_last_active_member', JSON.stringify(memberDoc));
    } catch {}

    window.dispatchEvent(new CustomEvent('members-updated'));

    return {
      success: true,
      member: memberDoc,
      session,
    };
  } catch (err: any) {
    console.error('Member login error:', err);
    return {
      success: false,
      message: err?.message || 'A connection issue occurred during authentication. Please try again.',
    };
  }
}

// ================= SESSION RETRIEVAL & LIVE VERIFICATION =================
export function getActiveMemberSession(): MemberSession | null {
  try {
    const raw = sessionStorage.getItem(MEMBER_SESSION_KEY);
    if (!raw) return null;
    const session: MemberSession = JSON.parse(raw);
    if (!session || !session.expiresAt || Date.now() > session.expiresAt) {
      logoutMember();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function getLiveMemberProfile(memberId: string): Promise<MemberProfile | null> {
  // 1. Check local cached members first for instant UI response
  let localMatch: MemberProfile | null = null;
  try {
    const cachedRaw = localStorage.getItem('aipeu_cached_members');
    if (cachedRaw) {
      const list: MemberProfile[] = JSON.parse(cachedRaw);
      localMatch = list.find((m) => m.id === memberId || m.membershipId === memberId) || null;
    }
    if (!localMatch) {
      const lastActive = localStorage.getItem('aipeu_last_active_member');
      if (lastActive) {
        const parsed: MemberProfile = JSON.parse(lastActive);
        if (parsed.id === memberId || parsed.membershipId === memberId) {
          localMatch = parsed;
        }
      }
    }
  } catch {}

  // 2. Try Firestore lookup with fast timeout
  try {
    const docRef = doc(db, 'members', memberId);
    const snap = await withTimeout(getDoc(docRef), 2000);
    if (snap.exists()) {
      const fbDoc = { id: snap.id, ...snap.data() } as MemberProfile;
      if (!localMatch || (fbDoc.updatedAt || '') >= (localMatch.updatedAt || '')) {
        return fbDoc;
      }
    }
  } catch {}

  if (localMatch) return localMatch;

  try {
    const { INITIAL_SAMPLE_MEMBERS } = await import('./memberService');
    const sample = INITIAL_SAMPLE_MEMBERS.find(
      (m) => m.id === memberId || m.membershipId === memberId
    );
    if (sample) return sample;
  } catch {}

  return null;
}

export function logoutMember(): void {
  try {
    sessionStorage.removeItem(MEMBER_SESSION_KEY);
  } catch {}
}

// ================= PASSWORD RESET & RECOVERY =================
export async function requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
  const cleanId = identifier.trim();
  if (!cleanId) {
    return {
      success: false,
      message: 'Please provide your Membership ID or registered mobile number.',
    };
  }

  const genericResponse = {
    success: true,
    message:
      'If your Membership ID or registered mobile is on file with Dhenkanal Division, password recovery instructions or an administrator assistance request has been initiated. For direct help, you can also reach the Divisional Secretary.',
  };

  try {
    const normalizedMobile = normalizeMobileNumber(cleanId);
    const upperId = cleanId.toUpperCase();
    const { getCachedMembers } = await import('./memberService');
    const memberFound = getCachedMembers().find(
      (m) => m.membershipId.toUpperCase() === upperId || normalizeMobileNumber(m.mobile) === normalizedMobile
    );

    if (memberFound) {
      await withTimeout(
        setDoc(doc(db, 'passwordResetRequests', memberFound.membershipId), {
          memberId: memberFound.id,
          membershipId: memberFound.membershipId,
          memberName: memberFound.name,
          mobile: memberFound.mobile,
          email: memberFound.email || '',
          requestedAt: new Date().toISOString(),
          status: 'PendingAdminAssistance',
          updatedAt: serverTimestamp(),
        }),
        2000
      );
    }
    return genericResponse;
  } catch {
    return genericResponse;
  }
}

// ================= MEMBER PASSWORD CHANGE (FIRST-LOGIN & REGULAR) =================
export async function changeMemberPassword(
  identifier: string,
  currentPasswordInput: string,
  newPasswordInput: string
): Promise<{ success: boolean; message: string }> {
  const cleanId = (identifier || '').trim();
  const cleanCurrent = (currentPasswordInput || '').trim();
  const cleanNew = (newPasswordInput || '').trim();

  if (!cleanCurrent) {
    return { success: false, message: 'Please enter your current/default password.' };
  }
  if (!cleanNew) {
    return { success: false, message: 'Please enter a new password.' };
  }
  if (cleanNew.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters long.' };
  }
  if (cleanCurrent === cleanNew) {
    return {
      success: false,
      message: 'New password must be different from your current/default password.',
    };
  }

  try {
    const {
      getCachedMembers,
      saveCachedMembers,
      getCachedCredentials,
      saveCachedCredential,
      INITIAL_SAMPLE_MEMBERS,
    } = await import('./memberService');

    const normalizedMobile = normalizeMobileNumber(cleanId);
    let upperId = cleanId.toUpperCase();
    if (/^\d{4}$/.test(cleanId)) upperId = `AIPEU-DKL-${cleanId}`;

    const cachedList = getCachedMembers();
    let memberDoc: MemberProfile | null =
      cachedList.find(
        (m) =>
          m.membershipId.toUpperCase() === upperId ||
          m.id === cleanId ||
          (normalizedMobile.length === 10 && normalizeMobileNumber(m.mobile) === normalizedMobile)
      ) || null;

    if (!memberDoc) {
      memberDoc =
        INITIAL_SAMPLE_MEMBERS.find(
          (m) =>
            m.membershipId.toUpperCase() === upperId ||
            (normalizedMobile.length === 10 && normalizeMobileNumber(m.mobile) === normalizedMobile)
        ) || null;
    }

    if (!memberDoc) {
      return { success: false, message: 'Member account not found. Please log in again.' };
    }

    // Fetch credential from local cache & Firestore
    const cachedCreds = getCachedCredentials();
    let credData: MemberCredential | null =
      cachedCreds[memberDoc.membershipId.toUpperCase()] || cachedCreds[memberDoc.mobile] || null;

    const credRef = doc(db, 'memberCredentials', memberDoc.membershipId);
    if (!credData) {
      try {
        const credSnap = await withTimeout(getDoc(credRef), 2000);
        if (credSnap.exists()) {
          credData = credSnap.data() as MemberCredential;
        }
      } catch {}
    }

    const mobileAuthEmail =
      credData?.authEmail ||
      (memberDoc.authEpoch && memberDoc.authEpoch > 1
        ? `${memberDoc.mobile || normalizedMobile}_v${memberDoc.authEpoch}@member.aipeudhenkanal.org`
        : `${memberDoc.mobile || normalizedMobile}@member.aipeudhenkanal.org`);

    // Verify current password
    let isCurrentValid = false;

    if (credData && credData.salt && credData.passwordHash) {
      isCurrentValid = await verifyPassword(cleanCurrent, credData.salt, credData.passwordHash);
    }

    if (!isCurrentValid && cleanCurrent === 'Member@1234' && memberDoc.passwordStatus !== 'Updated') {
      isCurrentValid = true;
    }

    if (!isCurrentValid) {
      try {
        await withTimeout(signInWithEmailAndPassword(auth, mobileAuthEmail, cleanCurrent), 2000);
        isCurrentValid = true;
      } catch {}
    }

    if (!isCurrentValid) {
      return { success: false, message: 'The current/default password you entered is incorrect.' };
    }

    // Compute new PBKDF2 salted hash
    const newSalt = generateSalt();
    const newPasswordHash = await hashPassword(cleanNew, newSalt);
    const nowIso = new Date().toISOString();

    const updatedCred: MemberCredential = {
      membershipId: memberDoc.membershipId,
      uid: memberDoc.uid || credData?.uid || '',
      mobile: memberDoc.mobile,
      email: memberDoc.email || '',
      authEmail: mobileAuthEmail,
      authEpoch: memberDoc.authEpoch || credData?.authEpoch || 1,
      passwordHash: newPasswordHash,
      salt: newSalt,
      mustChangePassword: false,
      passwordStatus: 'Updated',
      failedAttempts: 0,
      updatedAt: nowIso,
    };

    // 1. Save immediately to localStorage & sessionStorage
    saveCachedCredential(updatedCred);

    memberDoc.mustChangePassword = false;
    memberDoc.passwordStatus = 'Updated';
    memberDoc.updatedAt = nowIso;

    const updatedMembers = [
      memberDoc,
      ...cachedList.filter(
        (m) => m.id !== memberDoc!.id && m.membershipId !== memberDoc!.membershipId
      ),
    ];
    saveCachedMembers(updatedMembers);
    try {
      localStorage.setItem('aipeu_last_active_member', JSON.stringify(memberDoc));
    } catch {}

    const currentSession = getActiveMemberSession();
    if (
      currentSession &&
      (currentSession.membershipId === memberDoc.membershipId || currentSession.memberId === memberDoc.id)
    ) {
      currentSession.mustChangePassword = false;
      currentSession.passwordStatus = 'Updated';
      sessionStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(currentSession));
    }

    window.dispatchEvent(new CustomEvent('members-updated'));

    // 2. Sync to Firebase Auth & Firestore with timeout protection
    try {
      if (auth.currentUser) {
        await withTimeout(fbUpdatePassword(auth.currentUser, cleanNew), 2000);
      } else {
        try {
          const res = await withTimeout(
            signInWithEmailAndPassword(auth, mobileAuthEmail, cleanCurrent),
            2000
          );
          await withTimeout(fbUpdatePassword(res.user, cleanNew), 2000);
        } catch {}
      }
    } catch {}

    try {
      await withTimeout(
        Promise.all([
          setDoc(
            credRef,
            {
              passwordHash: newPasswordHash,
              salt: newSalt,
              mustChangePassword: false,
              passwordStatus: 'Updated',
              failedAttempts: 0,
              updatedAt: nowIso,
            },
            { merge: true }
          ),
          setDoc(
            doc(db, 'members', memberDoc.id),
            {
              mustChangePassword: false,
              passwordStatus: 'Updated',
              updatedAt: nowIso,
            },
            { merge: true }
          ),
        ]),
        2200
      );
    } catch {}

    return {
      success: true,
      message: 'Password updated successfully! Welcome to the User Portal.',
    };
  } catch (err: any) {
    console.error('Password change error:', err);
    return {
      success: false,
      message: err?.message || 'Failed to update password. Please try again.',
    };
  }
}
