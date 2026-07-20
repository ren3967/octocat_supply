---
title: "Data Classification Policy"
category: "Data Governance"
version: 1.0
last_updated: "2025-10-20"
owner: "Data Governance Committee"
keywords: [data classification, pii, confidential, restricted, public]
---

# Data Classification Policy

## 1. Purpose

This policy helps you understand the sensitivity of data and the required level of protection. Every piece of data in our system must be classified into one of the following four tiers.

## 2. Data Classes

| Classification | Description | Examples for Webshop | Required Protections |
| :--- | :--- | :--- | :--- |
| **Public** | Data intended for public consumption. | Product descriptions, prices, marketing images, help articles. | None. |
| **Internal** | Data accessible to employees but not for public release. | Sales analytics, internal memos, system logs (without PII). | Access control (company login required). |
| **Confidential** | Sensitive data that, if disclosed, could harm the company or its users. | Personally Identifiable Information (PII): Name, address, email, phone number, IP address, order history. | Strong access control (need-to-know basis), encryption at rest and in transit. |
| **Restricted** | Our most sensitive data, which could cause severe harm if disclosed. Governed by strict regulations. | **Payment Data:** Credit card numbers (even tokenized), CVV. **Authentication Data:** Passwords, API keys, session tokens. | Highest level of access control, strong encryption, regular audits, never stored in plaintext (e.g., passwords must be hashed). |

## 3. Developer Responsibility

-   When designing a new feature or database table, you **must** identify the classification level for all new data elements.
-   Apply security controls appropriate for the data's classification. For example, do not log `Confidential` or `Restricted` data in plaintext.
