---
title: "Secure Coding Guidelines"
category: "Secure Development"
version: 1.2
last_updated: "2025-10-20"
owner: "Security Team"
keywords: [secure coding, owasp, sqli, xss, authentication, access control]
---

# Secure Coding Guidelines

These guidelines are mandatory for all code written for the webshop. They are based on the OWASP Top 10 and other security best practices.

## 1. Input Validation

-   **Principle:** Never trust user input. Validate all incoming data on the server-side.
-   **Action:**
    -   Use an allow-list approach for validation where possible.
    -   Validate for type, length, format, and range.
    -   Use well-vetted libraries for validating complex data (e.g., email addresses).

## 2. Prevent Injection

-   **SQL Injection (SQLi):**
    -   **Action:** Always use parameterized queries or prepared statements. Do not construct SQL queries by concatenating strings with user input.
    -   **Bad:** `db.query("SELECT * FROM users WHERE id = '" + userId + "'");`
    -   **Good:** `db.query("SELECT * FROM users WHERE id = ?", [userId]);`
-   **Cross-Site Scripting (XSS):**
    -   **Action:** Encode all user-supplied data before rendering it in HTML. Use modern frontend frameworks (like React, Vue) which often provide auto-escaping, but understand how to use it correctly.
    -   Use `textContent` instead of `innerHTML` where possible.
    -   Implement a strict Content Security Policy (CSP).

## 3. Authentication and Session Management

-   **Password Storage:**
    -   **Action:** Never store passwords in plaintext or with outdated hashing algorithms (like MD5, SHA1).
    -   **Required:** Use a strong, salted, and peppered hashing algorithm like **Argon2** or **bcrypt**.
-   **Session Tokens:**
    -   **Action:** Generate session tokens with a cryptographically secure random number generator. Tokens must be long and complex.
    -   Store session tokens securely (e.g., using `HttpOnly`, `Secure`, and `SameSite` cookie attributes).

## 4. Access Control (Authorization)

-   **Principle:** Deny by default.
-   **Action:**
    -   Enforce authorization checks on the server-side for every request that accesses a resource. Do not rely on the client to enforce access control.
    -   **Bad:** Hiding a button in the UI is not a security control.
    -   **Good:** The API endpoint `/api/orders/{orderId}` must verify that the logged-in user is the owner of that order or an admin.
    -   Use Role-Based Access Control (RBAC) where appropriate.

## 5. Dependency Management

-   **Action:**
    -   Use a tool like GitHub Dependabot or Snyk to automatically scan your dependencies for known vulnerabilities.
    -   Keep all third-party libraries and frameworks up-to-date.
    -   Before adding a new dependency, vet its reputation and maintenance status.
