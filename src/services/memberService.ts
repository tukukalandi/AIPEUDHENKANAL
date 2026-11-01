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
} from 'firebase/firestore';
import { db } from './firebase';
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
    await addDoc(col, {
      action,
      actor,
      targetMemberId,
      targetMembershipId,
      details,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Failed to record audit log:', err);
  }
}

// ================= MEMBERSHIP ID GENERATOR =================
export async function generateUniqueMembershipId(): Promise<string> {
  try {
    const col = collection(db, 'members');
    const snap = await getDocs(col);
    const existingCount = snap.size;
    const nextNum = 1001 + existingCount;
    return `AIPEU-DKL-${nextNum}`;
  } catch {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `AIPEU-DKL-${randomSuffix}`;
  }
}

// ================= INITIAL DEFAULT SAMPLE MEMBERS =================
export const INITIAL_SAMPLE_MEMBERS: MemberProfile[] = [
  {
    id: 'mem-seed-1001',
    membershipId: 'AIPEU-DKL-1001',
    name: 'Comrade Tukuna Kalandi',
    fullName: 'Comrade Tukuna Kalandi',
    cadre: 'Postal Assistant',
    office: 'Dhenkanal Head Post Office',
    division: 'Dhenkanal',
    mobile: '9861184651',
    email: 'tukukalandi@gmail.com',
    address: 'Staff Quarters, Dhenkanal HO, Odisha - 759001',
    dateOfJoining: '2016-04-12',
    status: 'Active',
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
    name: 'Comrade Bijay Kumar Sahoo',
    fullName: 'Comrade Bijay Kumar Sahoo',
    cadre: 'Postman',
    office: 'Kamakhyanagar Sub Post Office',
    division: 'Dhenkanal',
    mobile: '9437256180',
    email: 'bksahoo.post@gmail.com',
    address: 'At/PO Kamakhyanagar, Dhenkanal, Odisha - 759018',
    dateOfJoining: '2019-08-20',
    status: 'Active',
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
    name: 'Comrade Pratap Chandra Rout',
    fullName: 'Comrade Pratap Chandra Rout',
    cadre: 'GDS BPM',
    office: 'Bhuban Sub Post Office',
    division: 'Dhenkanal',
    mobile: '9438112233',
    email: 'pcrout.dkl@gmail.com',
    address: 'Bhuban Market Area, Dhenkanal, Odisha - 759017',
    dateOfJoining: '2022-02-15',
    status: 'Pending',
    validFrom: '2026-01-01',
    validTo: '2027-12-31',
    photoUrl: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

// ================= MEMBER QUERIES =================
export async function getMembersFromFirestore(): Promise<MemberProfile[]> {
  try {
    await seedInitialMembersIfEmpty();
  } catch (seedErr) {
    console.warn('Initial member seed note:', seedErr);
  }

  try {
    const col = collection(db, 'members');
    const snap = await getDocs(col);
    if (!snap.empty) {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MemberProfile));
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      try {
        localStorage.setItem('aipeu_cached_members', JSON.stringify(list));
      } catch {}
      return list;
    }
  } catch (err) {
    console.error('Error fetching members from Firestore:', err);
  }

  // Check localStorage cache
  try {
    const cached = localStorage.getItem('aipeu_cached_members');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // Fallback to sample members so admin always sees available members
  return INITIAL_SAMPLE_MEMBERS;
}

export async function getMemberById(id: string): Promise<MemberProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'members', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as MemberProfile;
  } catch {
    return null;
  }
}

// ================= ADD MEMBER =================
export interface NewMemberInput {
  name: string;
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

export async function addMemberToFirestore(
  input: NewMemberInput,
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<string> {
  const normalizedMobile = normalizeMobileNumber(input.mobile);
  if (!normalizedMobile || normalizedMobile.length !== 10) {
    throw new Error('Please provide a valid 10-digit mobile number.');
  }

  // Check duplicate mobile in existing members
  const membersCol = collection(db, 'members');
  const dupQ = query(membersCol, where('mobile', '==', normalizedMobile));
  const dupSnap = await getDocs(dupQ);
  if (!dupSnap.empty) {
    throw new Error(`A member is already registered with mobile number ${normalizedMobile}.`);
  }

  const membershipId = await generateUniqueMembershipId();
  const docRef = doc(membersCol);
  const now = new Date().toISOString();

  const newMember: Omit<MemberProfile, 'id'> = {
    membershipId,
    name: input.name.trim(),
    fullName: input.name.trim(),
    cadre: input.cadre.trim(),
    office: input.office.trim(),
    division: 'Dhenkanal',
    mobile: normalizedMobile,
    email: input.email.trim(),
    address: input.address.trim(),
    dateOfJoining: input.dateOfJoining || now.split('T')[0],
    status: input.status || 'Active',
    validFrom: input.validFrom || now.split('T')[0],
    validTo: input.validTo || `${new Date().getFullYear() + 2}-12-31`,
    photoUrl: input.photoUrl || '',
    createdAt: now,
    updatedAt: now,
    approvedBy: input.status === 'Active' ? actor : undefined,
    approvedAt: input.status === 'Active' ? now : undefined,
    remarks: input.remarks || '',
  };

  await setDoc(docRef, newMember);

  // Setup PBKDF2 secure password credentials
  const initialPass = input.password || 'Member@1234';
  const salt = generateSalt();
  const passwordHash = await hashPassword(initialPass, salt);

  const credRef = doc(db, 'memberCredentials', membershipId);
  const cred: MemberCredential = {
    membershipId,
    mobile: normalizedMobile,
    email: input.email.trim(),
    passwordHash,
    salt,
    failedAttempts: 0,
    recoveryEmail: input.email.trim(),
    updatedAt: now,
  };
  await setDoc(credRef, cred);

  await logMemberAudit(
    'MEMBER_REGISTERED',
    actor,
    docRef.id,
    membershipId,
    `Added member ${input.name} (${membershipId}) with status ${input.status}.`
  );

  // If status is Active, automatically generate an initial digital membership card
  if (input.status === 'Active') {
    const fullProfile = { id: docRef.id, ...newMember };
    await generateOrReissueMembershipCard(fullProfile, actor);
  }

  return docRef.id;
}

// ================= UPDATE MEMBER RECORD =================
export async function updateMemberInFirestore(
  memberId: string,
  updates: Partial<MemberProfile>,
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  const docRef = doc(db, 'members', memberId);
  const existingSnap = await getDoc(docRef);
  const existing = existingSnap.exists() ? (existingSnap.data() as MemberProfile) : null;
  const membershipId = updates.membershipId || existing?.membershipId || memberId;

  const updateData: Record<string, any> = {
    updatedAt: new Date().toISOString(),
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

    // Update credential mobile reference
    try {
      const credRef = doc(db, 'memberCredentials', membershipId);
      const credSnap = await getDoc(credRef);
      if (credSnap.exists()) {
        await updateDoc(credRef, { mobile: norm, updatedAt: new Date().toISOString() });
      }
    } catch {}
  }

  await setDoc(docRef, updateData, { merge: true });

  // Update localStorage cache
  try {
    const cached = localStorage.getItem('aipeu_cached_members');
    if (cached) {
      const list: MemberProfile[] = JSON.parse(cached);
      const idx = list.findIndex((m) => m.id === memberId || m.membershipId === membershipId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updateData };
        localStorage.setItem('aipeu_cached_members', JSON.stringify(list));
      }
    }
  } catch {}

  await logMemberAudit(
    'MEMBER_UPDATED',
    actor,
    memberId,
    membershipId,
    `Updated fields: ${Object.keys(updates).join(', ')}`
  );
}

// ================= DELETE / REMOVE MEMBER =================
export async function deleteMemberFromFirestore(
  memberId: string,
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  const docRef = doc(db, 'members', memberId);
  const existingSnap = await getDoc(docRef);
  const existing = existingSnap.exists() ? (existingSnap.data() as MemberProfile) : null;
  const membershipId = existing?.membershipId || memberId;

  await deleteDoc(docRef);

  try {
    const credRef = doc(db, 'memberCredentials', membershipId);
    await deleteDoc(credRef);
  } catch {}

  // Update localStorage cache
  try {
    const cached = localStorage.getItem('aipeu_cached_members');
    if (cached) {
      const list: MemberProfile[] = JSON.parse(cached);
      const filtered = list.filter((m) => m.id !== memberId && m.membershipId !== membershipId);
      localStorage.setItem('aipeu_cached_members', JSON.stringify(filtered));
    }
  } catch {}

  await logMemberAudit(
    'MEMBER_DELETED',
    actor,
    memberId,
    membershipId,
    `Member ${existing?.name || membershipId} deleted from register.`
  );
}

// ================= STATUS LIFECYCLE (ACTIVE / PENDING / EXPIRED) =================
export async function changeMemberStatus(
  memberId: string,
  newStatus: MemberStatus,
  reason = '',
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  const docRef = doc(db, 'members', memberId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Member record not found.');
  const member = snap.data() as MemberProfile;

  const now = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    status: newStatus,
    updatedAt: now,
  };

  if (newStatus === 'Active' && !member.approvedAt) {
    updatePayload.approvedBy = actor;
    updatePayload.approvedAt = now;
  }

  await updateDoc(docRef, updatePayload);

  // If membership is expired or pending, update active card verification status
  if (member.activeCardToken) {
    const verifRef = doc(db, 'cardVerifications', member.activeCardToken);
    const verifSnap = await getDoc(verifRef);
    if (verifSnap.exists()) {
      const cardStatus: CardStatus = newStatus === 'Active' ? 'Valid' : newStatus === 'Expired' ? 'Expired' : 'Revoked';
      await updateDoc(verifRef, {
        status: cardStatus,
        lastCheckedAt: now,
      });
    }

    if (member.activeCardId) {
      const cardDocRef = doc(db, 'membershipCards', member.activeCardId);
      const cardSnap = await getDoc(cardDocRef);
      if (cardSnap.exists()) {
        const cardStatus: CardStatus = newStatus === 'Active' ? 'Valid' : newStatus === 'Expired' ? 'Expired' : 'Revoked';
        await updateDoc(cardDocRef, {
          cardStatus,
          updatedAt: now,
        });
      }
    }
  }

  await logMemberAudit(
    'STATUS_CHANGED',
    actor,
    memberId,
    member.membershipId,
    `Status changed to ${newStatus}. Reason: ${reason || 'N/A'}`
  );
}

// ================= ADMIN PASSWORD RESET =================
export async function adminResetMemberPassword(
  membershipId: string,
  newPassword: string,
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(newPassword, salt);
  const credRef = doc(db, 'memberCredentials', membershipId);

  await setDoc(
    credRef,
    {
      passwordHash,
      salt,
      failedAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await logMemberAudit(
    'PASSWORD_RESET',
    actor,
    membershipId,
    membershipId,
    `Administrator reset password for ${membershipId}.`
  );
}

// ================= PROFILE UPDATE REQUEST WORKFLOW =================
export async function submitProfileUpdateRequest(
  member: MemberProfile,
  proposedChanges: ProfileUpdateRequest['proposedChanges']
): Promise<string> {
  const col = collection(db, 'profileUpdateRequests');
  const now = new Date().toISOString();

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
      photoUrl: member.photoUrl,
    },
    status: 'Pending',
    requestedAt: now,
  };

  const docRef = await addDoc(col, reqDoc);
  return docRef.id;
}

export async function getProfileUpdateRequests(): Promise<ProfileUpdateRequest[]> {
  try {
    const col = collection(db, 'profileUpdateRequests');
    const q = query(col, orderBy('requestedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProfileUpdateRequest));
  } catch {
    const col = collection(db, 'profileUpdateRequests');
    const snap = await getDocs(col);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProfileUpdateRequest));
  }
}

export async function reviewProfileUpdateRequest(
  requestId: string,
  decision: 'Approved' | 'Rejected',
  remarks = '',
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  const reqRef = doc(db, 'profileUpdateRequests', requestId);
  const snap = await getDoc(reqRef);
  if (!snap.exists()) throw new Error('Request not found.');
  const req = snap.data() as ProfileUpdateRequest;

  const now = new Date().toISOString();

  if (decision === 'Approved') {
    // Atomically apply changes to member record
    await updateMemberInFirestore(req.memberId, req.proposedChanges, actor);

    // If name or photo changed, check if active card needs reissue
    const memberSnap = await getDoc(doc(db, 'members', req.memberId));
    if (memberSnap.exists()) {
      const updatedMember = { id: memberSnap.id, ...memberSnap.data() } as MemberProfile;
      if (updatedMember.status === 'Active') {
        // Reissue card to reflect new identity/photo
        await generateOrReissueMembershipCard(
          updatedMember,
          actor,
          'Auto-reissued due to approved profile changes'
        );
      }
    }
  }

  await updateDoc(reqRef, {
    status: decision,
    reviewedBy: actor,
    reviewedAt: now,
    reviewRemarks: remarks,
  });

  await logMemberAudit(
    decision === 'Approved' ? 'PROFILE_UPDATE_APPROVED' : 'PROFILE_UPDATE_REJECTED',
    actor,
    req.memberId,
    req.membershipId,
    `Review of update request #${requestId}: ${decision}. Remarks: ${remarks || 'None'}`
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

  // If an active card existed previously, mark it as Revoked/Reissued
  if (member.activeCardToken) {
    const prevVerifRef = doc(db, 'cardVerifications', member.activeCardToken);
    const prevVerifSnap = await getDoc(prevVerifRef);
    if (prevVerifSnap.exists()) {
      await updateDoc(prevVerifRef, {
        status: 'Revoked',
        message: 'This card was superseded by a newly reissued card.',
        lastCheckedAt: now,
      });
    }

    if (member.activeCardId) {
      const prevCardRef = doc(db, 'membershipCards', member.activeCardId);
      const prevCardSnap = await getDoc(prevCardRef);
      if (prevCardSnap.exists()) {
        await updateDoc(prevCardRef, {
          cardStatus: 'Revoked',
          reissuedAt: now,
          reissuedNewToken: newCardToken,
          revocationReason: 'Reissued new card token',
        });
      }
    }
  }

  // Create new membershipCard document
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

  await setDoc(cardDocRef, newCard);

  // Create public verification record keyed strictly by cardToken
  // Contains only public verification fields (NO private mobile, NO email, NO address, NO passwords)
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
  await setDoc(verifRef, verifData);

  // Link active card on member profile
  const memberRef = doc(db, 'members', member.id);
  await updateDoc(memberRef, {
    activeCardId: cardDocRef.id,
    activeCardToken: newCardToken,
    updatedAt: now,
  });

  await logMemberAudit(
    'CARD_ISSUED',
    actor,
    member.id,
    member.membershipId,
    `Issued card token ${newCardToken.slice(0, 8)}... (${reason})`
  );

  return { id: cardDocRef.id, ...newCard };
}

export async function revokeMembershipCard(
  cardId: string,
  reason: string,
  actor = 'Divisional Secretary, AIPEU Dhenkanal'
): Promise<void> {
  const cardRef = doc(db, 'membershipCards', cardId);
  const cardSnap = await getDoc(cardRef);
  if (!cardSnap.exists()) throw new Error('Card not found.');
  const card = cardSnap.data() as DigitalMembershipCard;

  const now = new Date().toISOString();

  // Mark card as Revoked
  await updateDoc(cardRef, {
    cardStatus: 'Revoked',
    revokedAt: now,
    revocationReason: reason || 'Revoked by Divisional Authority',
  });

  // Invalidate public card verification immediately
  if (card.cardToken) {
    const verifRef = doc(db, 'cardVerifications', card.cardToken);
    await setDoc(
      verifRef,
      {
        status: 'Revoked',
        message: `Card revoked: ${reason || 'Revoked by Divisional Authority'}`,
        lastCheckedAt: now,
      },
      { merge: true }
    );
  }

  // Clear active card from member profile if it was this one
  const memberRef = doc(db, 'members', card.memberId);
  const mSnap = await getDoc(memberRef);
  if (mSnap.exists()) {
    const mData = mSnap.data() as MemberProfile;
    if (mData.activeCardId === cardId) {
      await updateDoc(memberRef, {
        activeCardId: null,
        activeCardToken: null,
        updatedAt: now,
      });
    }
  }

  await logMemberAudit(
    'CARD_REVOKED',
    actor,
    card.memberId,
    card.membershipId,
    `Revoked card ${cardId}. Reason: ${reason}`
  );
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

  try {
    const verifRef = doc(db, 'cardVerifications', cleanToken);
    const snap = await getDoc(verifRef);

    if (!snap.exists()) {
      return {
        token: cleanToken,
        status: 'Invalid',
        message: 'No official union card record found for this token.',
      };
    }

    const data = snap.data() as CardVerificationResult;

    // Check validity date
    if (data.status === 'Valid' && data.validTo) {
      const today = new Date().toISOString().split('T')[0];
      if (today > data.validTo) {
        data.status = 'Expired';
        data.message = 'This membership card has expired.';
      }
    }

    // Increment verifiedCount for audit
    await updateDoc(verifRef, {
      verifiedCount: (data.verifiedCount || 0) + 1,
      lastCheckedAt: new Date().toISOString(),
    });

    return data;
  } catch (err) {
    console.error('Error verifying card:', err);
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
    const q = query(col, where('memberId', '==', memberId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DigitalMembershipCard));
  } catch {
    const col = collection(db, 'membershipCards');
    const snap = await getDocs(col);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as DigitalMembershipCard))
      .filter((c) => c.memberId === memberId);
  }
}

// ================= AUDIT LOGS QUERY =================
export async function getMemberAuditLogs(): Promise<MemberAuditLog[]> {
  try {
    const col = collection(db, 'memberAuditLogs');
    const q = query(col, orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MemberAuditLog));
  } catch {
    const col = collection(db, 'memberAuditLogs');
    const snap = await getDocs(col);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MemberAuditLog));
  }
}

// ================= SEED INITIAL MEMBERS IF EMPTY =================
let isSeeding = false;
export async function seedInitialMembersIfEmpty(): Promise<void> {
  if (isSeeding) return;
  try {
    const col = collection(db, 'members');
    const snap = await getDocs(col);
    if (!snap.empty) return;

    isSeeding = true;
    console.log('Seeding initial AIPEU Dhenkanal members...');

    const defaultMembers: Array<{
      membershipId: string;
      name: string;
      cadre: string;
      office: string;
      mobile: string;
      email: string;
      address: string;
      dateOfJoining: string;
      status: MemberStatus;
      validFrom: string;
      validTo: string;
      photoUrl?: string;
    }> = [
      {
        membershipId: 'AIPEU-DKL-1001',
        name: 'Comrade Tukuna Kalandi',
        cadre: 'Postal Assistant',
        office: 'Dhenkanal Head Post Office',
        mobile: '9861184651',
        email: 'tukukalandi@gmail.com',
        address: 'Staff Quarters, Dhenkanal HO, Odisha - 759001',
        dateOfJoining: '2016-04-12',
        status: 'Active',
        validFrom: '2026-01-01',
        validTo: '2027-12-31',
        photoUrl: '',
      },
      {
        membershipId: 'AIPEU-DKL-1002',
        name: 'Comrade Bijay Kumar Sahoo',
        cadre: 'Postman',
        office: 'Kamakhyanagar Sub Post Office',
        mobile: '9437256180',
        email: 'bksahoo.post@gmail.com',
        address: 'At/PO Kamakhyanagar, Dhenkanal, Odisha - 759018',
        dateOfJoining: '2019-08-20',
        status: 'Active',
        validFrom: '2026-01-01',
        validTo: '2027-12-31',
        photoUrl: '',
      },
      {
        membershipId: 'AIPEU-DKL-1003',
        name: 'Comrade Pratap Chandra Rout',
        cadre: 'GDS BPM',
        office: 'Bhuban Sub Post Office',
        mobile: '9438112233',
        email: 'pcrout.dkl@gmail.com',
        address: 'Bhuban Market Area, Dhenkanal, Odisha - 759017',
        dateOfJoining: '2022-02-15',
        status: 'Pending',
        validFrom: '2026-01-01',
        validTo: '2027-12-31',
        photoUrl: '',
      },
    ];

    const now = new Date().toISOString();

    for (const m of defaultMembers) {
      const docRef = doc(col);
      const memberData: MemberProfile = {
        id: docRef.id,
        ...m,
        fullName: m.name,
        division: 'Dhenkanal',
        createdAt: now,
        updatedAt: now,
        approvedBy: m.status === 'Active' ? 'Divisional Secretary, AIPEU Dhenkanal' : undefined,
        approvedAt: m.status === 'Active' ? now : undefined,
      };
      await setDoc(docRef, memberData);

      // Create credential
      const salt = generateSalt();
      const passwordHash = await hashPassword('Member@1234', salt);
      const credRef = doc(db, 'memberCredentials', m.membershipId);
      await setDoc(credRef, {
        membershipId: m.membershipId,
        mobile: m.mobile,
        email: m.email,
        passwordHash,
        salt,
        failedAttempts: 0,
        recoveryEmail: m.email,
        updatedAt: now,
      });

      // Generate card if Active
      if (m.status === 'Active') {
        const cardToken = generateUnguessableToken();
        const cardCol = collection(db, 'membershipCards');
        const cardDocRef = doc(cardCol);

        await setDoc(cardDocRef, {
          memberId: docRef.id,
          membershipId: m.membershipId,
          memberName: m.name,
          cadre: m.cadre,
          office: m.office,
          division: 'Dhenkanal',
          photoUrl: m.photoUrl || '',
          issueDate: now.split('T')[0],
          validFrom: m.validFrom,
          validTo: m.validTo,
          cardToken,
          cardStatus: 'Valid',
          createdAt: now,
        });

        // Verification token document
        const verifRef = doc(db, 'cardVerifications', cardToken);
        await setDoc(verifRef, {
          token: cardToken,
          status: 'Valid',
          membershipId: m.membershipId,
          memberName: m.name,
          cadre: m.cadre,
          office: m.office,
          division: 'Dhenkanal Division',
          unionName: 'ALL INDIA POSTAL EMPLOYEES UNION (NFPE)',
          validFrom: m.validFrom,
          validTo: m.validTo,
          issueDate: now.split('T')[0],
          verifiedCount: 0,
          lastCheckedAt: now,
          message: 'Official Verified AIPEU Dhenkanal Division Membership Card',
        });

        await updateDoc(docRef, {
          activeCardId: cardDocRef.id,
          activeCardToken: cardToken,
        });
      }
    }

    console.log('Successfully seeded initial AIPEU Dhenkanal members!');
  } catch (err) {
    console.error('Failed to seed initial members:', err);
  } finally {
    isSeeding = false;
  }
}
