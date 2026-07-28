---
title: "Data Retention and Deletion Policy"
category: "Data Governance"
version: 1.0
last_updated: "2025-10-20"
owner: "Data Governance Committee"
keywords: [data retention, deletion, gdpr, data minimization]
---

# Data Retention and Deletion Policy

## 1. Principle of Storage Limitation

We must not keep personal data for longer than is necessary for the purpose for which it was collected. This policy defines the standard retention periods.

## 2. Standard Retention Periods

| Data Type | Retention Period | Rationale | Deletion Method |
| :--- | :--- | :--- | :--- |
| **Customer Account Data** | As long as the account is active. | To provide ongoing service to the user. | Anonymization or Hard Delete upon user request. |
| **Order and Payment History** | 7 years after the order date. | Legal requirement for financial and tax audits. | Hard Delete via automated script. |
| **Inactive User Accounts** | 2 years of inactivity. | Data minimization. | Account is flagged and user is notified. If no response, account is hard deleted. |
| **Server/Application Logs** | 30 days. | For security analysis and debugging. | Automated deletion. |
| **Marketing Consent** | As long as consent is active. | To respect user choices. | Hard Delete when user unsubscribes or withdraws consent. |

## 3. Developer Responsibility

-   **Automated Deletion:** When building systems, you must implement automated jobs or logic to enforce these retention policies.
-   **Deletion APIs:** Ensure that services expose secure endpoints to perform data deletion in response to user requests (as part of our DSR process). Deletion should cascade where appropriate.
-   **Hard vs. Soft Delete:** For permanent deletion, use a hard delete. A soft delete (e.g., setting an `is_deleted` flag) is not sufficient for fulfilling a user's "right to be forgotten" under GDPR. Anonymization is an acceptable alternative to hard deletion.
