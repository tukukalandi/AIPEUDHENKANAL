import { MemberProfile, MemberCredential, CardStatus } from '../types';
import { db } from './firebase';
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
  name: string;
  cadre: string;
  office: string;
  division: string;
  status: 'Active' | 'Pending' | 'Expired';
  token: string;
  loginAt: string;
  expiresAt: number;
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
      // Lock for 15 minutes
      record.lockedUntil = Date.now() + 15 * 60 * 1000;
    }
    data[identifier] = record;
    sessionStorage.setItem(LOGIN_RATE_LIMIT_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function clearRateLimitRecord(identifier: string): void {
  try {
    const data = JSON.parse(sessionStorage.getItem(LOGIN_RATE_LIMIT_KEY) || '{}');
    delete data[identifier];
    sessionStorage.setItem(LOGIN_RATE_LIMIT_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
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
  const cleanId = identifierInput.trim();
  const cleanPass = passwordInput.trim();

  if (!cleanId || !cleanPass) {
    return {
      success: false,
      message: 'Please provide both Membership ID/Mobile number and password.',
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
    const normalizedMobile = normalizeMobileNumber(cleanId);
    const upperId = cleanId.toUpperCase();

    // Query members collection to resolve member record securely
    let memberDoc: MemberProfile | null = null;

    // Search by membershipId first
    const membersCol = collection(db, 'members');
    const qById = query(membersCol, where('membershipId', '==', upperId), limit(1));
    const snapById = await getDocs(qById);

    if (!snapById.empty) {
      const d = snapById.docs[0];
      memberDoc = { id: d.id, ...d.data() } as MemberProfile;
    } else if (normalizedMobile.length === 10) {
      // Search by registered 10-digit mobile number
      const qByMobile = query(membersCol, where('mobile', '==', normalizedMobile), limit(1));
      const snapByMobile = await getDocs(qByMobile);
      if (!snapByMobile.empty) {
        const d = snapByMobile.docs[0];
        memberDoc = { id: d.id, ...d.data() } as MemberProfile;
      }
    }

    // Generic error if member doesn't exist (prevents identifier enumeration)
    if (!memberDoc) {
      recordFailedAttempt(normalizedKey);
      return {
        success: false,
        message: 'Invalid Membership ID, mobile number, or password. Please verify your details.',
      };
    }

    // Check credential record in memberCredentials collection
    const credDocRef = doc(db, 'memberCredentials', memberDoc.membershipId);
    const credSnap = await getDoc(credDocRef);

    if (!credSnap.exists()) {
      recordFailedAttempt(normalizedKey);
      return {
        success: false,
        message: 'Invalid Membership ID, mobile number, or password. Please verify your details.',
      };
    }

    const credData = credSnap.data() as MemberCredential;

    // Verify password against PBKDF2 hash and salt
    const isPasswordValid = await verifyPassword(cleanPass, credData.salt, credData.passwordHash);

    if (!isPasswordValid) {
      recordFailedAttempt(normalizedKey);
      return {
        success: false,
        message: 'Invalid Membership ID, mobile number, or password. Please verify your details.',
      };
    }

    // Login successful: clear rate limits
    clearRateLimitRecord(normalizedKey);

    // Create secure member session (8 hours validity)
    const sessionToken = generateUnguessableToken();
    const session: MemberSession = {
      memberId: memberDoc.id,
      membershipId: memberDoc.membershipId,
      name: memberDoc.name,
      cadre: memberDoc.cadre,
      office: memberDoc.office,
      division: memberDoc.division || 'Dhenkanal',
      status: memberDoc.status,
      token: sessionToken,
      loginAt: new Date().toISOString(),
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    };

    sessionStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(session));

    return {
      success: true,
      member: memberDoc,
      session,
    };
  } catch (err) {
    console.error('Member login error:', err);
    return {
      success: false,
      message: 'A connection issue occurred during authentication. Please try again.',
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
  try {
    const docRef = doc(db, 'members', memberId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as MemberProfile;
  } catch {
    return null;
  }
}

export function logoutMember(): void {
  try {
    sessionStorage.removeItem(MEMBER_SESSION_KEY);
  } catch {
    // ignore
  }
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

  // Generic response to prevent enumeration
  const genericResponse = {
    success: true,
    message:
      'If your Membership ID or registered mobile is on file with Dhenkanal Division, password recovery instructions or an administrator assistance request has been initiated. For direct help, you can also reach the Divisional Secretary.',
  };

  try {
    const normalizedMobile = normalizeMobileNumber(cleanId);
    const upperId = cleanId.toUpperCase();
    const membersCol = collection(db, 'members');

    let memberFound: MemberProfile | null = null;
    const qById = query(membersCol, where('membershipId', '==', upperId), limit(1));
    const snapById = await getDocs(qById);

    if (!snapById.empty) {
      memberFound = { id: snapById.docs[0].id, ...snapById.docs[0].data() } as MemberProfile;
    } else if (normalizedMobile.length === 10) {
      const qByMob = query(membersCol, where('mobile', '==', normalizedMobile), limit(1));
      const snapByMob = await getDocs(qByMob);
      if (!snapByMob.empty) {
        memberFound = { id: snapByMob.docs[0].id, ...snapByMob.docs[0].data() } as MemberProfile;
      }
    }

    if (memberFound) {
      // Record a reset request in Firestore for administrator audit & assistance
      await setDoc(doc(db, 'passwordResetRequests', memberFound.membershipId), {
        memberId: memberFound.id,
        membershipId: memberFound.membershipId,
        memberName: memberFound.name,
        mobile: memberFound.mobile,
        email: memberFound.email || '',
        requestedAt: new Date().toISOString(),
        status: 'PendingAdminAssistance',
        updatedAt: serverTimestamp(),
      });
    }

    return genericResponse;
  } catch {
    return genericResponse;
  }
}
