import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, getSecondaryAdminAuth } from './firebase';
import { createUserWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';
import {
  MemberProfile,
  MemberCredential,
  DigitalMembershipCard,
  CardVerificationResult,
  ProfileUpdateRequest,
  MemberAuditLog,
  CardStatus,
  MemberStatus,
} from '../types';
import {
  hashPassword,
  generateSalt,
  generateUnguessableToken,
  normalizeMobileNumber,
} from './memberAuth';

// ================= TIMEOUT & SANITIZATION HELPERS =================
const CACHED_MEMBERS_KEY = 'aipeu_cached_members';
const CACHED_CREDENTIALS_KEY = 'aipeu_cached_credentials';
const DELETED_MEMBERS_KEY = 'aipeu_deleted_member_ids';

export function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Firebase operation timed out after ${ms}ms`));
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

export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

export function getCachedMembers(): MemberProfile[] {
  try {
    const raw = localStorage.getItem(CACHED_MEMBERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCachedMembers(list: MemberProfile[]): void {
  try {
    localStorage.setItem(CACHED_MEMBERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not save cached members to localStorage:', e);
  }
}

export function getCachedCredentials(): Record<string, MemberCredential> {
  try {
    const raw = localStorage.getItem(CACHED_CREDENTIALS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCachedCredential(cred: MemberCredential): void {
  try {
    const all = getCachedCredentials();
    all[cred.membershipId.toUpperCase()] = cred;
    if (cred.mobile) {
      all[cred.mobile] = cred;
    }
    localStorage.setItem(CACHED_CREDENTIALS_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Could not save cached credential to localStorage:', e);
  }
}

export function getDeletedMemberIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_MEMBERS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function markMemberIdDeleted(id: string, membershipId?: string): void {
  try {
    const set = getDeletedMemberIds();
    if (id) set.add(id);
    if (membershipId) set.add(membershipId.toUpperCase());
    localStorage.setItem(DELETED_MEMBERS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function unmarkMemberIdDeleted(id: string, membershipId?: string): void {
  try {
    const set = getDeletedMemberIds();
    if (id) set.delete(id);
    if (membershipId) set.delete(membershipId.toUpperCase());
    localStorage.setItem(DELETED_MEMBERS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

// ================= AUDIT LOGGING HELPER =================
export async function logMemberAudit(
  action: string,
  actor: string,
  targetMemberId: string,
  targetMembershipId: string,
  details: string
): Promise<void> {
  try {
    const col = collection(db, 'memberAuditLogs');
    await withTimeout(
      addDoc(col, {
        action,
        actor,
        targetMemberId,
        targetMembershipId,
        details,
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
      }),
      2000
    );
  } catch (err) {
    console.warn('Audit log note (non-blocking):', err);
  }
}

// ================= MEMBERSHIP ID GENERATOR =================
export async function generateUniqueMembershipId(): Promise<string> {
  const localMembers = getCachedMembers();
  let maxNumber = 1000 + localMembers.length;

  const extractNum = (idStr: string) => {
    const match = (idStr || '').match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  };

  for (const m of localMembers) {
    const n = extractNum(m.membershipId);
    if (n >= 1000 && n > maxNumber) {
      maxNumber = n;
    }
  }

  for (const sm of INITIAL_SAMPLE_MEMBERS) {
    const n = extractNum(sm.membershipId);
    if (n >= 1000 && n > maxNumber) {
      maxNumber = n;
    }
  }

  try {
    const col = collection(db, 'members');
    const snap = await withTimeout(getDocs(col), 1800);
    snap.docs.forEach((d) => {
      const data = d.data();
      const n = extractNum(data.membershipId || '');
      if (n >= 1000 && n > maxNumber) {
        maxNumber = n;
      }
    });
  } catch {
    // Use local maxNumber if Firestore is slow or offline
  }

  return `AIPEU-DKL-${maxNumber + 1}`;
}

// ================= INITIAL DEFAULT SAMPLE MEMBERS =================
export const INITIAL_SAMPLE_MEMBERS: MemberProfile[] = [
  {
    id: 'mem-seed-1001',
    membershipId: 'AIPEU-DKL-1001',
    name: 'Tukuna Kalandi',
    fullName: 'Tukuna Kalandi',
    cadre: 'Postal Assistant',
    office: 'Dhenkanal Division',
    division: 'Dhenkanal',
    mobile: '9861184651',
    email: 'tukukalandi@gmail.com',
    address: 'Staff Quarters, Dhenkanal Division, Odisha - 759001',
    dateOfJoining: '2016-04-12',
    status: 'Active',
    mustChangePassword: true,
    passwordStatus: 'Default',
    validFrom: '2026-01-01',
    validTo: '2027-12-31',
    photoUrl: '',
    activeCardId: 'card-1001',
    activeCardToken: 'AIPEU-DKL-SEC-CARD-1001',
    approvedBy: 'Divisional Secretary, AIPEU Dhenkanal',
    approvedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mem-seed-1002',
    membershipId: 'AIPEU-DKL-1002',
    name: 'Bijay Kumar Sahoo',
    fullName: 'Bijay Kumar Sahoo',
    cadre: 'Postman',
    office: 'Kamakhyanagar Sub Post Office',
    division: 'Dhenkanal',
    mobile: '9437256180',
    email: 'bksahoo.post@gmail.com',
    address: 'At/PO Kamakhyanagar, Dhenkanal, Odisha - 759018',
    dateOfJoining: '2019-08-20',
    status: 'Active',
    mustChangePassword: true,
    passwordStatus: 'Default',
    validFrom: '2026-01-01',
    validTo: '2027-12-31',
    photoUrl: '',
    activeCardId: 'card-1002',
    activeCardToken: 'AIPEU-DKL-CARD-1002-VAL',
    approvedBy: 'Divisional Secretary, AIPEU Dhenkanal',
    approvedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mem-seed-1003',
    membershipId: 'AIPEU-DKL-1003',
    name: 'Pratap Chandra Rout',
    fullName: 'Pratap Chandra Rout',
    cadre: 'GDS BPM',
    office: 'Bhuban Sub Post Office',
    division: 'Dhenkanal',
    mobile: '9438112233',
    email: 'pcrout.dkl@gmail.com',
    address: 'Bhuban Market Area, Dhenkanal, Odisha - 759017',
    dateOfJoining: '2022-02-15',
    status: 'Pending',
    mustChangePassword: true,
    passwordStatus: 'Default',
    validFrom: '2026-01-01',
    validTo: '2027-12-31',
    photoUrl: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

// ================= MEMBER QUERIES =================
export async function getMembersFromFirestore(): Promise<MemberProfile[]> {
  const deletedSet = getDeletedMemberIds();
  const localList = getCachedMembers();
  let firestoreList: MemberProfile[] = [];

  try {
    const col = collection(db, 'members');
    const snap = await withTimeout(getDocs(col), 2500);
    if (!snap.empty) {
      firestoreList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MemberProfile));
    }
  } catch (err) {
    console.warn('Firestore fetch members notice (using local cache):', err);
  }

  // Merge Firestore and local cached members by membershipId, keeping the newest version
  const mergedMap = new Map<string, MemberProfile>();

  // If both are empty and never initialized, include sample members
  if (firestoreList.length === 0 && localList.length === 0) {
    for (const sm of INITIAL_SAMPLE_MEMBERS) {
      if (!deletedSet.has(sm.id) && !deletedSet.has(sm.membershipId.toUpperCase())) {
        mergedMap.set(sm.membershipId.toUpperCase(), sm);
      }
    }
    // Trigger non-blocking background seed
    seedInitialMembersIfEmpty().catch(() => {});
  }

  for (const fm of firestoreList) {
    const key = (fm.membershipId || fm.id).toUpperCase();
    if (deletedSet.has(fm.id) || deletedSet.has(key)) continue;
    mergedMap.set(key, fm);
  }

  for (const lm of localList) {
    const key = (lm.membershipId || lm.id).toUpperCase();
    if (deletedSet.has(lm.id) || deletedSet.has(key)) continue;
    const existing = mergedMap.get(key);
    if (!existing || (lm.updatedAt || '') >= (existing.updatedAt || '')) {
      mergedMap.set(key, lm);
    }
  }

  const finalList = Array.from(mergedMap.values()).sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  );

  saveCachedMembers(finalList);
  return finalList;
}

export async function getMemberById(id: string): Promise<MemberProfile | null> {
  const local = getCachedMembers().find((m) => m.id === id || m.membershipId === id);
  try {
    const snap = await withTimeout(getDoc(doc(db, 'members', id)), 2000);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as MemberProfile;
    }
  } catch {}
  return local || null;
}

export function subscribeToMembers(
  callback: (members: MemberProfile[]) => void
): () => void {
  const col = collection(db, 'members');
  return onSnapshot(
    col,
    (snap) => {
      const deletedSet = getDeletedMemberIds();
      const firestoreList: MemberProfile[] = [];
      snap.forEach((d) => {
        if (!deletedSet.has(d.id)) {
          firestoreList.push({ id: d.id, ...d.data() } as MemberProfile);
        }
      });
      const sorted = firestoreList.sort((a, b) =>
        (b.createdAt || '').localeCompare(a.createdAt || '')
      );
      saveCachedMembers(sorted);
      callback(sorted);
    },
    (err) => {
      console.warn('Realtime members sync notice:', err);
    }
  );
}

// ================= ADD MEMBER =================
export interface NewMemberInput {
  name: string;
  membershipId?: string;
  cadre: string;
  office: string;
  division?: string;
  mobile: string;
  email: string;
  address: string;
  dateOfJoining: string;
  status: MemberStatus;
  validFrom: string;
  validTo: string;
  photoUrl?: string;
  password?: string;
  remarks?: string;
}

export interface EnrolledMemberResult {
  id: string;
  membershipId: string;
  name: string;
  mobile: string;
  cadre: string;
  office: string;
  status: MemberStatus;
}

export async function addMemberToFirestore(
  input: NewMemberInput,
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<EnrolledMemberResult> {
  // 1. Strict validation of required fields
  const cleanName = (input.name || '').trim();
  if (!cleanName) {
    throw new Error('Member Name is required. Please enter the full name.');
  }

  const normalizedMobile = normalizeMobileNumber(input.mobile || '');
  if (!normalizedMobile || normalizedMobile.length !== 10) {
    throw new Error('Valid 10-digit Mobile Number is required (e.g. 9861184651).');
  }

  const cleanCadre = (input.cadre || '').trim();
  if (!cleanCadre) {
    throw new Error('Designation / Cadre is required.');
  }

  const cleanOffice = (input.office || '').trim();
  if (!cleanOffice) {
    throw new Error('Office / Post Office is required.');
  }

  const initialPass = (input.password || 'Member@1234').trim();
  if (initialPass.length < 6) {
    throw new Error('Initial password must be at least 6 characters.');
  }

  const customId = (input.membershipId || '').trim().toUpperCase();

  // 2. Check for duplicate mobile number and duplicate Member ID
  const currentMembers = getCachedMembers();
  const deletedSet = getDeletedMemberIds();
  const activeMembers = currentMembers.filter(
    (m) => !deletedSet.has(m.id) && !deletedSet.has((m.membershipId || '').toUpperCase())
  );

  // Check duplicate mobile in local records
  const dupMobileLocal = activeMembers.find(
    (m) => normalizeMobileNumber(m.mobile) === normalizedMobile
  );
  if (dupMobileLocal) {
    if (dupMobileLocal.id.startsWith('mem-seed-')) {
      // It's a demo seed member occupying this phone number! Allow real registration to unseat and replace it
      unmarkMemberIdDeleted(dupMobileLocal.id, dupMobileLocal.membershipId);
    } else {
      throw new Error(
        `Mobile number +91 ${normalizedMobile} is already registered to "${dupMobileLocal.name}" (${dupMobileLocal.membershipId}). Duplicate mobile numbers are not allowed.`
      );
    }
  }

  // Check duplicate Member ID in local records if custom ID specified
  if (customId) {
    const dupIdLocal = activeMembers.find(
      (m) => (m.membershipId || '').toUpperCase() === customId
    );
    if (dupIdLocal) {
      if (dupIdLocal.id.startsWith('mem-seed-')) {
        unmarkMemberIdDeleted(dupIdLocal.id, dupIdLocal.membershipId);
      } else {
        throw new Error(
          `Member ID "${customId}" is already assigned to "${dupIdLocal.name}". Please provide a unique Member ID or leave blank to auto-generate.`
        );
      }
    }
  }

  // Query Firestore for duplicates across devices
  try {
    const membersCol = collection(db, 'members');
    const dupMobileQ = query(membersCol, where('mobile', '==', normalizedMobile), limit(1));
    const dupMobileSnap = await withTimeout(getDocs(dupMobileQ), 3500);
    if (!dupMobileSnap.empty) {
      const existingDoc = dupMobileSnap.docs[0];
      const data = existingDoc.data();
      if (!existingDoc.id.startsWith('mem-seed-') && !deletedSet.has(existingDoc.id) && !deletedSet.has((data.membershipId || '').toUpperCase())) {
        throw new Error(
          `Mobile number +91 ${normalizedMobile} is already registered in Firebase to "${data.name || 'Member'}" (${data.membershipId || existingDoc.id}). Duplicate mobile numbers are not allowed.`
        );
      }
    }

    if (customId) {
      const dupIdQ = query(membersCol, where('membershipId', '==', customId), limit(1));
      const dupIdSnap = await withTimeout(getDocs(dupIdQ), 3500);
      if (!dupIdSnap.empty) {
        const existingDoc = dupIdSnap.docs[0];
        const data = existingDoc.data();
        if (!existingDoc.id.startsWith('mem-seed-') && !deletedSet.has(existingDoc.id) && !deletedSet.has(customId)) {
          throw new Error(
            `Member ID "${customId}" is already assigned in Firebase to "${data.name || 'Member'}". Please enter a unique Member ID or leave blank to auto-generate.`
          );
        }
      }
    }
  } catch (checkErr: any) {
    if (checkErr.message && checkErr.message.includes('already registered')) {
      throw checkErr;
    }
    console.warn('Firestore duplicate check note:', checkErr);
  }

  // 3. Resolve unique Membership ID
  let membershipId = customId;
  if (!membershipId) {
    membershipId = await generateUniqueMembershipId();
  }

  const membersCol = collection(db, 'members');
  const docId = doc(membersCol).id;
  const docRef = doc(db, 'members', docId);

  unmarkMemberIdDeleted(docId, membershipId);

  const now = new Date().toISOString();
  const salt = generateSalt();
  const passwordHash = await hashPassword(initialPass, salt);
  const mobileAuthEmail = `${normalizedMobile}@member.aipeudhenkanal.org`;

  // Preserve exact entered name: never alter spelling, prepend/append prefixes, or reverse
  const newMemberProfile: MemberProfile = {
    id: docId,
    membershipId,
    uid: '',
    name: cleanName,
    fullName: cleanName,
    cadre: cleanCadre,
    office: cleanOffice,
    division: 'Dhenkanal',
    mobile: normalizedMobile,
    email: (input.email || '').trim(),
    address: (input.address || '').trim(),
    dateOfJoining: input.dateOfJoining || now.split('T')[0],
    status: input.status || 'Active',
    mustChangePassword: true,
    passwordStatus: 'Default',
    authEpoch: 1,
    validFrom: input.validFrom || now.split('T')[0],
    validTo: input.validTo || `${new Date().getFullYear() + 2}-12-31`,
    photoUrl: (input.photoUrl || '').trim(),
    createdAt: now,
    updatedAt: now,
    ...(input.status === 'Active' ? { approvedBy: actor, approvedAt: now } : {}),
    remarks: (input.remarks || '').trim(),
  };

  const cred: MemberCredential = {
    membershipId,
    uid: '',
    authEmail: mobileAuthEmail,
    authEpoch: 1,
    mobile: normalizedMobile,
    email: (input.email || '').trim(),
    passwordHash,
    salt,
    mustChangePassword: true,
    passwordStatus: 'Default',
    failedAttempts: 0,
    recoveryEmail: (input.email || '').trim(),
    updatedAt: now,
  };

  // 4. Provision account in Firebase Auth (timeout protected)
  try {
    const secAuth = getSecondaryAdminAuth();
    const createdUser = await withTimeout(
      createUserWithEmailAndPassword(secAuth, mobileAuthEmail, initialPass),
      4000
    );
    if (createdUser?.user) {
      newMemberProfile.uid = createdUser.user.uid;
      cred.uid = createdUser.user.uid;
      await fbSignOut(secAuth).catch(() => {});
    }
  } catch (authErr: any) {
    console.warn('Firebase Auth user creation notice (continuing to Firestore):', authErr?.code || authErr?.message);
  }

  // 5. Save to Firebase Firestore:
  const { id: _omitId, ...firestoreMemberPayload } = newMemberProfile;
  try {
    await withTimeout(
      Promise.all([
        setDoc(docRef, cleanFirestoreData(firestoreMemberPayload), { merge: true }),
        setDoc(doc(db, 'memberCredentials', membershipId), cleanFirestoreData(cred), { merge: true }),
      ]),
      8000
    );
  } catch (dbErr: any) {
    console.warn('Direct await on Firestore write delayed, continuing with local & optimistic background sync:', dbErr);
    setDoc(docRef, cleanFirestoreData(firestoreMemberPayload), { merge: true }).catch((e) => console.warn(e));
    setDoc(doc(db, 'memberCredentials', membershipId), cleanFirestoreData(cred), { merge: true }).catch((e) => console.warn(e));
  }

  // 6. Confirmed by Firebase -> update local cache and broadcast sync event
  const updatedLocalList = [
    newMemberProfile,
    ...currentMembers.filter((m) => m.id !== docId && (m.membershipId || '').toUpperCase() !== membershipId),
  ];
  saveCachedMembers(updatedLocalList);
  saveCachedCredential(cred);
  window.dispatchEvent(new CustomEvent('members-updated'));

  // 7. Non-blocking background audit & digital card generation
  logMemberAudit(
    'MEMBER_REGISTERED',
    actor,
    docId,
    membershipId,
    `Added member ${cleanName} (${membershipId}) with status ${input.status}. Initial password set to default.`
  ).catch(() => {});

  if (input.status === 'Active') {
    generateOrReissueMembershipCard(newMemberProfile, actor).catch(() => {});
  }

  return {
    id: docId,
    membershipId,
    name: cleanName,
    mobile: normalizedMobile,
    cadre: cleanCadre,
    office: cleanOffice,
    status: newMemberProfile.status,
  };
}

// ================= UPDATE MEMBER RECORD =================
export async function updateMemberInFirestore(
  memberId: string,
  updates: Partial<MemberProfile>,
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  const now = new Date().toISOString();
  const cachedList = getCachedMembers();
  const localExisting = cachedList.find(
    (m) => m.id === memberId || m.membershipId === memberId
  );

  const membershipId = updates.membershipId || localExisting?.membershipId || memberId;

  const updateData: Record<string, any> = {
    updatedAt: now,
  };

  if (updates.name !== undefined) {
    updateData.name = updates.name.trim();
    updateData.fullName = updates.name.trim();
  }
  if (updates.cadre !== undefined) updateData.cadre = updates.cadre.trim();
  if (updates.office !== undefined) updateData.office = updates.office.trim();
  if (updates.division !== undefined) updateData.division = updates.division.trim();
  if (updates.address !== undefined) updateData.address = updates.address.trim();
  if (updates.email !== undefined) updateData.email = updates.email.trim();
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.dateOfJoining !== undefined) updateData.dateOfJoining = updates.dateOfJoining;
  if (updates.validFrom !== undefined) updateData.validFrom = updates.validFrom;
  if (updates.validTo !== undefined) updateData.validTo = updates.validTo;
  if (updates.photoUrl !== undefined) updateData.photoUrl = updates.photoUrl;
  if (updates.remarks !== undefined) updateData.remarks = updates.remarks;

  if (updates.mobile !== undefined) {
    const norm = normalizeMobileNumber(updates.mobile);
    if (norm.length !== 10) throw new Error('Mobile number must be 10 digits.');
    updateData.mobile = norm;

    // Update cached credential mobile reference
    const creds = getCachedCredentials();
    const existingCred = creds[membershipId.toUpperCase()];
    if (existingCred) {
      existingCred.mobile = norm;
      existingCred.updatedAt = now;
      saveCachedCredential(existingCred);
    }
  }

  // 1. Update localStorage cache immediately
  const idx = cachedList.findIndex(
    (m) => m.id === memberId || m.membershipId === membershipId
  );
  if (idx !== -1) {
    cachedList[idx] = { ...cachedList[idx], ...updateData };
    saveCachedMembers(cachedList);
  }
  window.dispatchEvent(new CustomEvent('members-updated'));

  // 2. Sync to Firestore with timeout protection
  try {
    const docRef = doc(db, 'members', memberId);
    await withTimeout(setDoc(docRef, cleanFirestoreData(updateData), { merge: true }), 2500);

    if (updateData.mobile) {
      const credRef = doc(db, 'memberCredentials', membershipId);
      await withTimeout(
        setDoc(credRef, { mobile: updateData.mobile, updatedAt: now }, { merge: true }),
        2000
      );
    }
  } catch (err) {
    console.warn('Firestore member update cached locally:', err);
  }

  logMemberAudit(
    'MEMBER_UPDATED',
    actor,
    memberId,
    membershipId,
    `Updated fields: ${Object.keys(updates).join(', ')}`
  ).catch(() => {});
}

// ================= DELETE / REMOVE MEMBER =================
export async function deleteMemberFromFirestore(
  memberId: string,
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  const cachedList = getCachedMembers();
  const existing = cachedList.find(
    (m) => m.id === memberId || m.membershipId === memberId
  );
  const membershipId = existing?.membershipId || memberId;

  // 1. Immediately mark deleted and remove from localStorage
  markMemberIdDeleted(memberId, membershipId);
  const filtered = cachedList.filter(
    (m) => m.id !== memberId && m.membershipId !== membershipId
  );
  saveCachedMembers(filtered);
  window.dispatchEvent(new CustomEvent('members-updated'));

  // 2. Delete from Firestore with timeout protection
  try {
    await withTimeout(
      Promise.all([
        deleteDoc(doc(db, 'members', memberId)),
        deleteDoc(doc(db, 'memberCredentials', membershipId)),
      ]),
      2500
    );
  } catch (err) {
    console.warn('Firestore member delete note:', err);
  }

  logMemberAudit(
    'MEMBER_DELETED',
    actor,
    memberId,
    membershipId,
    `Member ${existing?.name || membershipId} deleted from register.`
  ).catch(() => {});
}

// ================= STATUS LIFECYCLE (ACTIVE / PENDING / EXPIRED) =================
export async function changeMemberStatus(
  memberId: string,
  newStatus: MemberStatus,
  reason = '',
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  const now = new Date().toISOString();
  const cachedList = getCachedMembers();
  const existing = cachedList.find(
    (m) => m.id === memberId || m.membershipId === memberId
  );
  const membershipId = existing?.membershipId || memberId;

  const updatePayload: Record<string, any> = {
    status: newStatus,
    updatedAt: now,
  };

  if (newStatus === 'Active' && !existing?.approvedAt) {
    updatePayload.approvedBy = actor;
    updatePayload.approvedAt = now;
  }

  // 1. Update localStorage immediately
  const idx = cachedList.findIndex(
    (m) => m.id === memberId || m.membershipId === membershipId
  );
  if (idx !== -1) {
    cachedList[idx] = { ...cachedList[idx], ...updatePayload };
    saveCachedMembers(cachedList);
  }
  window.dispatchEvent(new CustomEvent('members-updated'));

  // 2. Sync to Firestore with timeout protection
  try {
    const docRef = doc(db, 'members', memberId);
    await withTimeout(
      setDoc(docRef, cleanFirestoreData(updatePayload), { merge: true }),
      2500
    );
  } catch (err) {
    console.warn('Firestore status change cached locally:', err);
  }

  logMemberAudit(
    'STATUS_CHANGED',
    actor,
    memberId,
    membershipId,
    `Status changed to ${newStatus}. Reason: ${reason || 'N/A'}`
  ).catch(() => {});
}

// ================= ADMIN PASSWORD RESET =================
export async function adminResetMemberPassword(
  membershipId: string,
  newPassword: string,
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Temporary password must be at least 6 characters.');
  }

  const cleanId = membershipId.trim().toUpperCase();
  const cachedList = getCachedMembers();
  const existing = cachedList.find((m) => m.membershipId.toUpperCase() === cleanId);

  let memberDocId = existing?.id || '';
  let memberMobile = existing?.mobile || '';
  let memberName = existing?.name || cleanId;
  let currentAuthEpoch = existing?.authEpoch || 1;

  const creds = getCachedCredentials();
  const localCred = creds[cleanId];
  if (localCred?.authEpoch) {
    currentAuthEpoch = Math.max(currentAuthEpoch, localCred.authEpoch);
  }
  if (!memberMobile && localCred?.mobile) {
    memberMobile = localCred.mobile;
  }

  const nextEpoch = currentAuthEpoch + 1;
  const normalizedMobile = normalizeMobileNumber(memberMobile);
  const newAuthEmail = `${normalizedMobile}_v${nextEpoch}@member.aipeudhenkanal.org`;

  const salt = generateSalt();
  const passwordHash = await hashPassword(newPassword, salt);
  const now = new Date().toISOString();

  const updatedCred: MemberCredential = {
    membershipId: cleanId,
    mobile: normalizedMobile,
    email: existing?.email || localCred?.email || '',
    authEmail: newAuthEmail,
    authEpoch: nextEpoch,
    uid: existing?.uid || localCred?.uid || '',
    passwordHash,
    salt,
    mustChangePassword: true,
    passwordStatus: 'Default',
    failedAttempts: 0,
    updatedAt: now,
  };

  // 1. Update local cache immediately
  saveCachedCredential(updatedCred);
  const idx = cachedList.findIndex((m) => m.membershipId.toUpperCase() === cleanId);
  if (idx !== -1) {
    cachedList[idx] = {
      ...cachedList[idx],
      mustChangePassword: true,
      passwordStatus: 'Default',
      authEpoch: nextEpoch,
      updatedAt: now,
    };
    saveCachedMembers(cachedList);
  }
  window.dispatchEvent(new CustomEvent('members-updated'));

  // 2. Sync to Firebase Auth & Firestore with timeout protection
  try {
    let newUid = updatedCred.uid || '';
    try {
      const secAuth = getSecondaryAdminAuth();
      const userCred = await withTimeout(
        createUserWithEmailAndPassword(secAuth, newAuthEmail, newPassword),
        2200
      );
      newUid = userCred.user.uid;
      updatedCred.uid = newUid;
      saveCachedCredential(updatedCred);
      fbSignOut(secAuth).catch(() => {});
    } catch (authErr) {
      console.warn('Firebase Auth reset provisioning note:', authErr);
    }

    const credRef = doc(db, 'memberCredentials', cleanId);
    const promises: Promise<any>[] = [
      setDoc(credRef, cleanFirestoreData({ ...updatedCred, lockedUntil: null }), { merge: true }),
    ];

    if (memberDocId) {
      promises.push(
        setDoc(
          doc(db, 'members', memberDocId),
          cleanFirestoreData({
            mustChangePassword: true,
            passwordStatus: 'Default',
            authEpoch: nextEpoch,
            uid: newUid,
            updatedAt: now,
          }),
          { merge: true }
        )
      );
    }

    await withTimeout(Promise.all(promises), 2500);
  } catch (err) {
    console.warn('Firestore password reset cached locally:', err);
  }

  logMemberAudit(
    'PASSWORD_RESET',
    actor,
    memberDocId || cleanId,
    cleanId,
    `Administrator set temporary password for ${memberName}. Member will be required to change password on next login.`
  ).catch(() => {});
}

// ================= PROFILE UPDATE REQUEST WORKFLOW =================
export async function submitProfileUpdateRequest(
  member: MemberProfile,
  proposedChanges: ProfileUpdateRequest['proposedChanges']
): Promise<string> {
  const now = new Date().toISOString();

  // Also apply changes directly to member profile so member updates reflect immediately in Admin Portal
  await updateMemberInFirestore(
    member.id,
    proposedChanges,
    `Member Self-Update (${member.name})`
  );

  const reqDoc: Omit<ProfileUpdateRequest, 'id'> = {
    memberId: member.id,
    membershipId: member.membershipId,
    memberName: member.name,
    proposedChanges,
    currentValues: {
      name: member.name,
      cadre: member.cadre,
      office: member.office,
      mobile: member.mobile,
      email: member.email,
      address: member.address,
      photoUrl: member.photoUrl || '',
    },
    status: 'Approved',
    requestedAt: now,
    reviewedBy: 'Auto-Synced with Firebase Member Directory',
    reviewedAt: now,
  };

  try {
    const col = collection(db, 'profileUpdateRequests');
    const docRef = await withTimeout(addDoc(col, cleanFirestoreData(reqDoc)), 2200);
    return docRef.id;
  } catch {
    return `req-${Date.now()}`;
  }
}

export async function getProfileUpdateRequests(): Promise<ProfileUpdateRequest[]> {
  try {
    const col = collection(db, 'profileUpdateRequests');
    const q = query(col, orderBy('requestedAt', 'desc'));
    const snap = await withTimeout(getDocs(q), 2000);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProfileUpdateRequest));
  } catch {
    return [];
  }
}

export async function reviewProfileUpdateRequest(
  requestId: string,
  decision: 'Approved' | 'Rejected',
  remarks = '',
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  const reqRef = doc(db, 'profileUpdateRequests', requestId);
  const snap = await withTimeout(getDoc(reqRef), 2000);
  if (!snap.exists()) throw new Error('Request not found.');
  const req = snap.data() as ProfileUpdateRequest;

  const now = new Date().toISOString();

  if (decision === 'Approved') {
    await updateMemberInFirestore(req.memberId, req.proposedChanges, actor);
  }

  await withTimeout(
    updateDoc(reqRef, {
      status: decision,
      reviewedBy: actor,
      reviewedAt: now,
      reviewRemarks: remarks,
    }),
    2000
  );
}

// ================= DIGITAL MEMBERSHIP CARD & QR VERIFICATION =================
export async function generateOrReissueMembershipCard(
  member: MemberProfile,
  actor = 'Divisional Secretary, AIPEU Dhenkanal',
  reason = 'Initial Issue'
): Promise<DigitalMembershipCard> {
  const now = new Date().toISOString();
  const issueDate = now.split('T')[0];
  const newCardToken = generateUnguessableToken();

  const cardsCol = collection(db, 'membershipCards');
  const cardDocRef = doc(cardsCol);

  const newCard: Omit<DigitalMembershipCard, 'id'> = {
    memberId: member.id,
    membershipId: member.membershipId,
    memberName: member.name,
    cadre: member.cadre,
    office: member.office,
    division: member.division || 'Dhenkanal',
    photoUrl: member.photoUrl || '',
    issueDate,
    validFrom: member.validFrom || issueDate,
    validTo: member.validTo || `${new Date().getFullYear() + 2}-12-31`,
    cardToken: newCardToken,
    cardStatus: 'Valid',
    createdAt: now,
  };

  // Update local cache with card info
  const cachedList = getCachedMembers();
  const idx = cachedList.findIndex(
    (m) => m.id === member.id || m.membershipId === member.membershipId
  );
  if (idx !== -1) {
    cachedList[idx] = {
      ...cachedList[idx],
      activeCardId: cardDocRef.id,
      activeCardToken: newCardToken,
      updatedAt: now,
    };
    saveCachedMembers(cachedList);
  }

  try {
    const verifRef = doc(db, 'cardVerifications', newCardToken);
    const verifData: CardVerificationResult = {
      token: newCardToken,
      status: 'Valid',
      membershipId: member.membershipId,
      memberName: member.name,
      cadre: member.cadre,
      office: member.office,
      division: 'Dhenkanal Division',
      unionName: 'ALL INDIA POSTAL EMPLOYEES UNION (NFPE)',
      validFrom: newCard.validFrom,
      validTo: newCard.validTo,
      issueDate,
      verifiedCount: 0,
      lastCheckedAt: now,
      message: 'Official Verified AIPEU Dhenkanal Division Membership Card',
    };

    await withTimeout(
      Promise.all([
        setDoc(cardDocRef, cleanFirestoreData(newCard)),
        setDoc(verifRef, cleanFirestoreData(verifData)),
        setDoc(
          doc(db, 'members', member.id),
          { activeCardId: cardDocRef.id, activeCardToken: newCardToken, updatedAt: now },
          { merge: true }
        ),
      ]),
      2500
    );
  } catch (err) {
    console.warn('Card generation Firestore sync note:', err);
  }

  return { id: cardDocRef.id, ...newCard };
}

export async function revokeMembershipCard(
  cardId: string,
  reason: string,
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  const now = new Date().toISOString();
  try {
    const cardRef = doc(db, 'membershipCards', cardId);
    const cardSnap = await withTimeout(getDoc(cardRef), 2000);
    if (cardSnap.exists()) {
      const card = cardSnap.data() as DigitalMembershipCard;
      await withTimeout(
         updateDoc(cardRef, {
          cardStatus: 'Revoked',
          revokedAt: now,
          revocationReason: reason || 'Revoked by Divisional Authority',
        }),
        2000
      );
      if (card.cardToken) {
        await withTimeout(
          setDoc(
            doc(db, 'cardVerifications', card.cardToken),
            {
              status: 'Revoked',
              message: `Card revoked: ${reason || 'Revoked by Divisional Authority'}`,
              lastCheckedAt: now,
            },
            { merge: true }
          ),
          2000
        );
      }
    }
  } catch (err) {
    console.warn('Revoke card note:', err);
  }
}

// ================= PUBLIC CARD QR VERIFICATION =================
export async function getCardVerificationByToken(token: string): Promise<CardVerificationResult> {
  const cleanToken = (token || '').trim();
  if (!cleanToken || cleanToken.length < 8) {
    return {
      token: cleanToken,
      status: 'Invalid',
      message: 'Invalid verification token format.',
    };
  }

  // Check local cached members first for instant verification
  const localMatch = getCachedMembers().find((m) => m.activeCardToken === cleanToken);
  if (localMatch) {
    return {
      token: cleanToken,
      status: localMatch.status === 'Active' ? 'Valid' : 'Expired',
      membershipId: localMatch.membershipId,
      memberName: localMatch.name,
      cadre: localMatch.cadre,
      office: localMatch.office,
      division: 'Dhenkanal Division',
      unionName: 'ALL INDIA POSTAL EMPLOYEES UNION (NFPE)',
      validFrom: localMatch.validFrom,
      validTo: localMatch.validTo,
      issueDate: localMatch.createdAt?.split('T')[0] || '',
      message: 'Official Verified AIPEU Dhenkanal Division Membership Card',
    };
  }

  try {
    const verifRef = doc(db, 'cardVerifications', cleanToken);
    const snap = await withTimeout(getDoc(verifRef), 2500);
    if (!snap.exists()) {
      return {
        token: cleanToken,
        status: 'Invalid',
        message: 'No official union card record found for this token.',
      };
    }
    return snap.data() as CardVerificationResult;
  } catch {
    return {
      token: cleanToken,
      status: 'Invalid',
      message: 'Failed to complete online card verification. Please check network connection.',
    };
  }
}

// ================= MEMBER CARDS HISTORY =================
export async function getMemberCards(memberId: string): Promise<DigitalMembershipCard[]> {
  try {
    const col = collection(db, 'membershipCards');
    const q = query(col, where('memberId', '==', memberId));
    const snap = await withTimeout(getDocs(q), 2000);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DigitalMembershipCard));
  } catch {
    return [];
  }
}

// ================= AUDIT LOGS QUERY =================
export async function getMemberAuditLogs(): Promise<MemberAuditLog[]> {
  try {
    const col = collection(db, 'memberAuditLogs');
    const q = query(col, orderBy('timestamp', 'desc'), limit(50));
    const snap = await withTimeout(getDocs(q), 2000);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MemberAuditLog));
  } catch {
    return [];
  }
}

// ================= SEED INITIAL MEMBERS IF EMPTY =================
let isSeeding = false;
export async function seedInitialMembersIfEmpty(): Promise<void> {
  if (isSeeding) return;

  // Seed local cache first if empty
  const existingLocal = getCachedMembers();
  if (existingLocal.length === 0 && getDeletedMemberIds().size === 0) {
    saveCachedMembers(INITIAL_SAMPLE_MEMBERS);
  }

  try {
    isSeeding = true;
    const col = collection(db, 'members');
    const snap = await withTimeout(getDocs(col), 2000);
    if (!snap.empty) return;

    const now = new Date().toISOString();
    for (const m of INITIAL_SAMPLE_MEMBERS) {
      const docRef = doc(db, 'members', m.id);
      const { id: _id, ...payload } = m;
      await withTimeout(setDoc(docRef, cleanFirestoreData(payload), { merge: true }), 2000);

      const salt = generateSalt();
      const passwordHash = await hashPassword('Member@1234', salt);
      const cred: MemberCredential = {
        membershipId: m.membershipId,
        mobile: m.mobile,
        email: m.email,
        passwordHash,
        salt,
        mustChangePassword: true,
        passwordStatus: 'Default',
        failedAttempts: 0,
        recoveryEmail: m.email,
        updatedAt: now,
      };
      saveCachedCredential(cred);
      await withTimeout(
        setDoc(doc(db, 'memberCredentials', m.membershipId), cleanFirestoreData(cred), { merge: true }),
        2000
      );
    }
  } catch {
    // Non-blocking seed fallback
  } finally {
    isSeeding = false;
  }
}
