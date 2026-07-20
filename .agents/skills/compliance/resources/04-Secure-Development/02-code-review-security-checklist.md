---
title: "Code Review Security Checklist"
category: "Secure Development"
version: 1.0
last_updated: "2025-10-20"
owner: "Security Team"
keywords: [code review, security, checklist, pull request]
---

# Code Review Security Checklist

Before approving any pull request, the reviewer must ensure the following security checks have been considered.

## Checklist

### Input and Output
- [ ] Is all user input validated on the server-side (not just the client)?
- [ ] Is output properly encoded to prevent XSS (e.g., using `textContent`, framework escaping)?
- [ ] Is the Content Security Policy (CSP) sufficient for the changes being made?

### Authentication & Authorization
- [ ] Does the change introduce any new authentication mechanisms? If so, are they secure (e.g., proper password hashing)?
- [ ] Is access control enforced on the server for every endpoint and resource?
- [ ] Does the code prevent users from accessing or modifying other users' data (Insecure Direct Object Reference - IDOR)?

### Data Handling
- [ ] Is any new sensitive data (`Confidential`, `Restricted`) being stored?
- [ ] If so, is it protected at rest (encrypted) and in transit (TLS)?
- [ ] Are passwords or secrets being stored correctly (i.e., hashed, not in plaintext)?
- [ ] Does the code log any sensitive data? (It shouldn't).

### SQL & Database
- [ ] Are all database queries parameterized to prevent SQL injection?
- [ ] Is there any risk of leaking too much information in error messages?

### Dependencies
- [ ] Does the PR introduce new third-party dependencies?
- [ ] If so, have they been vetted for security and maintenance?
- [ ] Has a vulnerability scan (e.g., Dependabot) been run against the new code?

### Logic & Business Rules
- [ ] Could any business logic be manipulated for financial gain or unauthorized access (e.g., manipulating item prices in a cart)?
- [ ] Are there checks for race conditions in critical operations (e.g., applying a coupon)?
