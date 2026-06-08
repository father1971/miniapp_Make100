# Security Specification: Game Make100

## 1. Data Invariants
- **User Ownership:** All documents under `/users/{userId}` can only be queried, created, or updated by the authenticated user whose `uid` exactly matches `{userId}`.
- **Public Stats Matching:** All documents under `/public_stats/{userId}` can only be modified by the matching authenticated user `{userId}`.
- **Identity Integrity:** Anonymous or authenticated user ID must be secure. A user cannot overwrite or read other users' private stats.
- **Strict Size/Type Limits:** Numerical fields like counts and solve times must be positive or valid numbers, strings like `displayName` and `photoURL` must have strict length caps, and ID fields must be validated to prevent Denial of Wallet.

## 2. The "Dirty Dozen" Malicious Payloads
These payloads must be rejected with `PERMISSION_DENIED`:

1. **Identity Spoofing (Private Users):** User `attacker_uid` attempts to write directly into `/users/victim_uid`.
2. **Identity Spoofing (Public Leaderboard):** User `attacker_uid` attempts to write directly into `/public_stats/victim_uid`.
3. **Ghost Field Write (Ghost Key Injection):** Writing schema with unapproved key like `{ "solvedCount": 10, "isVerifiedAdmin": true }`.
4. **Denial of Wallet ID Attack:** Attempting to write to a document with extremely large ID or special characters (e.g. `/users/super_long_junk_id_over_128_chars_...`).
5. **No-auth Read Attempt:** Unauthenticated request trying to read `/users/some_uid`.
6. **No-auth List Attempt:** Unauthenticated request trying to list `/public_stats`.
7. **Type Mismatch Solved Count:** Writing `"solvedCount": "ten"` (string) instead of a number.
8. **Excessive Display Name Length:** Attempting to set `displayName` to a string of 1,000 characters.
9. **Excessive Photo URL Length:** Attempting to set `photoURL` to a string of 10,000 characters.
10. **Malicious Special Characters in User ID:** Writing under `/users/user%20with%20spaces`.
11. **State Injection via Skip:** Creating a private stats record without setting mandatory fields `solvedCount` or other baseline metrics.
12. **Tampering with Public Leaderboard Value Types:** Overwriting `solvedCount` with an object under `/public_stats/{userId}`.

## 3. Test Assertion Plan
- All 12 payloads must result in `PERMISSION_DENIED` during Firestore access rules checks.
