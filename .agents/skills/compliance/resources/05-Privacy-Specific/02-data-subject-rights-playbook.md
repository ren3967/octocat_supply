---
title: "Data Subject Rights (DSR) Playbook for Developers"
category: "Privacy-Specific"
version: 1.0
last_updated: "2025-10-20"
owner: "Privacy Team"
keywords: [dsr, gdpr, data subject rights, right to be forgotten, deletion]
---

# Data Subject Rights (DSR) Playbook for Developers

## 1. Purpose

Regulations like GDPR and CCPA grant users rights over their data. We must have technical systems in place to fulfill these requests. This playbook outlines the developer's role.

## 2. Key Rights and Technical Implementation

### A. Right to Access
-   **What it is:** A user can request a copy of all personal data we hold about them.
-   **Developer Action:**
    1.  Create a script or service that, given a `user_id`, can query all relevant microservices and databases (e.g., `customers-db`, `orders-db`).
    2.  The script must gather all data linked to that user (account details, order history, support tickets, etc.).
    3.  The output must be in a machine-readable format, like JSON.
    4.  This process should be automated as much as possible to be fulfilled within the legal deadline (typically 30 days).

### B. Right to Erasure (Right to be Forgotten)
-   **What it is:** A user can request that we delete their personal data.
-   **Developer Action:**
    1.  Create a secure, internal-only "Erasure API."
    2.  Given a `user_id`, this API must trigger a workflow to permanently delete or anonymize the user's personal data from all systems.
    3.  **Deletion vs. Anonymization:**
        -   **Deletion (Hard Delete):** `DELETE FROM customers WHERE id = ?`. This is preferred for data we no longer need at all.
        -   **Anonymization:** `UPDATE orders SET customer_id = NULL, shipping_address = 'anonymized' WHERE customer_id = ?`. This is used when we need to keep the record for other business reasons (e.g., financial reporting) but must remove the link to the individual.
    4.  The erasure must cascade through all related systems.

### C. Right to Rectification
-   **What it is:** A user can request to correct inaccurate data.
-   **Developer Action:**
    -   Our webshop should already provide a user profile page where users can update their name, address, etc.
    -   Ensure these "edit" functions are robust and update the data correctly across all relevant tables.
