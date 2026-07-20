---
title: "Threat Modeling Guide"
category: "Secure Development"
version: 1.0
last_updated: "2025-10-20"
owner: "Security Team"
keywords: [threat modeling, security, stride, risk assessment]
---

# Threat Modeling Guide

This guide helps development teams identify and address security threats during the design and review phases of new features.

## 1. What is Threat Modeling?

Threat modeling is the process of identifying potential security threats to a system and determining how to mitigate them. It should be performed for every new feature or significant change to existing functionality.

## 2. When to Threat Model

- When designing a new feature that handles user data.
- When introducing a new external integration (API, payment gateway, etc.).
- When modifying authentication, authorization, or session management.
- When adding file upload, download, or storage capabilities.

## 3. The STRIDE Framework

Use the STRIDE model to categorize threats:

| Threat | Description | Example in Webshop |
| :--- | :--- | :--- |
| **Spoofing** | Impersonating another user or system. | Attacker reuses stolen session token to act as another user. |
| **Tampering** | Modifying data in transit or at rest. | Attacker modifies order total in a checkout request. |
| **Repudiation** | Denying actions without evidence. | A seller claims they never shipped an order. |
| **Information Disclosure** | Exposing data to unauthorized parties. | Path traversal in file download exposes server files. |
| **Denial of Service** | Making a system unavailable. | Flooding the download endpoint with requests. |
| **Elevation of Privilege** | Gaining higher access than intended. | Regular user accessing admin product management. |

## 4. Threat Modeling Process

1. **Identify assets** – What data or functionality needs protecting? (e.g., user PII, payment data)
2. **Define trust boundaries** – Where does data cross from one trust level to another? (e.g., public internet → API)
3. **Enumerate threats** – Apply STRIDE to each data flow and component.
4. **Rate risks** – Assess likelihood × impact for each threat (High / Medium / Low).
5. **Define mitigations** – For each threat, document the control that addresses it.
6. **Verify mitigations** – Confirm controls are implemented during code review (see `02-code-review-security-checklist.md`).

## 5. Common Mitigations

- **Input validation & allow-lists** – Reject unexpected input before it reaches business logic.
- **Parameterized queries** – Prevent SQL injection.
- **Rate limiting** – Prevent abuse of resource-intensive endpoints.
- **Safe path resolution** – Use `path.resolve()` and verify the result stays within the intended directory.
- **Least privilege** – Services and database users should have only the permissions they need.
- **Audit logging** – Record security-sensitive events (logins, permission changes, data exports) without logging sensitive values.
