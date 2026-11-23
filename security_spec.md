# Firestore Security Specification — AIPEU Dhenkanal Portal

## 1. Data Invariants
- **Single Authorized Administrator**: Only the verified Google account `tukukalandi@gmail.com` (`request.auth != null && request.auth.token.email == 'tukukalandi@gmail.com' && request.auth.token.email_verified == true`) is authorized to create, update, or delete portal content (`circulars`, `executiveMembers`, `heroSlides`, `newsSliderItems`, `announcements`, `importantDocuments`, `noticeCirculars`, `unionDocumentsAndRulings`, `ordersRulingsGuides`, `customPortalApps`, `uploadedFiles`, `galleryPhotos`, `downloadableForms`, `employeeResources`, `members`, `membershipCards`, `cardVerifications`).
- **Public Read-Only Portal**: Public visitors (including unauthenticated union members) may read published portal content and verify digital membership cards, without any write/delete privileges.
- **Credential & Audit Isolation**: `memberCredentials` and `memberAuditLogs` are strictly admin-only. `memberAuditLogs` are append-only (`update` and `delete` denied even for admins).
- **Parent Existence (Master Gate)**: A chunk under `uploadedFiles/{fileId}/chunks/{chunkId}` can only be created when its parent manifest `uploadedFiles/{fileId}` already exists.
- **Path & Payload Hygiene**: Every document ID matches `^[a-zA-Z0-9_\-]+$` (<= 128 chars), every string field has bounded `.size()`, and arrays are bounded.

## 2. The "Dirty Dozen" Attack Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Write to `circulars`**: `{ "title": "Fake", "category": "News", "snippet": "Spam", "published": "2026-01-01" }` with `auth = null`.
2. **Non-Admin Google User Write to `ordersRulingsGuides`**: `{ "fileName": "x.pdf", "folderName": "Orders", "category": "Orders", "documentUrl": "https://evil.test" }` with `email = "attacker@gmail.com", email_verified = true`.
3. **Unverified Admin Email Spoof on `customPortalApps`**: `{ "name": "Hijack", "category": "Others", "sourceType": "url", "url": "https://evil.test" }` with `email = "tukukalandi@gmail.com", email_verified = false`.
4. **Public Read of `memberCredentials`**: `get /memberCredentials/AIPEU-DKL-1001` with `auth = null`.
5. **Non-Admin Read of `memberAuditLogs`**: `list /memberAuditLogs` with `email = "member@gmail.com", email_verified = true`.
6. **Audit Log Tampering (`update` / `delete` on `memberAuditLogs`)**: Even as admin, attempting `delete /memberAuditLogs/log1` must fail.
7. **Orphaned File Chunk Write**: Creating `/uploadedFiles/nonexistent-id/chunks/chunk_0` before parent `/uploadedFiles/nonexistent-id` exists.
8. **Shadow/Ghost Field Injection on `announcements`**: Creating an announcement with an undocumented extra field `isSuperAdmin: true`.
9. **Resource Poisoning (Oversized ID)**: Creating `/galleryPhotos/<150-char-id>` exceeding `isValidId` length limit.
10. **Value Poisoning on `members`**: Updating `members/m1` with `status: "SuperAdmin"` (not in `['Active', 'Pending', 'Expired']`) or `name: 12345` (wrong type).
11. **Self-Approving Profile Update Request**: Creating `/profileUpdateRequests/req1` as public user with `status: "Approved"` instead of `"Pending"`.
12. **Public Delete on `galleryPhotos` / `downloadableForms` / `employeeResources`**: Deleting any public document when `auth = null` or non-admin.
