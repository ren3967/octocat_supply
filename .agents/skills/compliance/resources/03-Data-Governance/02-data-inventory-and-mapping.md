---
title: "Data Inventory and Mapping"
category: "Data Governance"
version: 1.0
last_updated: "2025-10-20"
owner: "Data Governance Committee"
keywords: [data inventory, data mapping, data flows, pii, gdpr]
---

# Data Inventory and Mapping

## 1. Purpose

This document provides a catalogue of the personal and sensitive data processed by OctoCAT Supply, where it is stored, and how it flows through the system. It supports GDPR Article 30 Record of Processing Activities requirements.

## 2. Data Inventory

| Data Element | Classification | Storage Location | Retention Period | Legal Basis |
| :--- | :--- | :--- | :--- | :--- |
| Name | Confidential | `user_details` table | Account lifetime + 2 years | Contract performance |
| Email address | Confidential | `user_details` table | Account lifetime + 2 years | Contract performance |
| Phone number | Confidential | `user_details` table | Account lifetime + 2 years | Contract performance |
| Physical address | Confidential | `user_details` table | Account lifetime + 2 years | Contract performance |
| Order history | Confidential | `orders`, `order_details` tables | 7 years | Legal obligation |
| Session token | Restricted | In-memory / cookie | Session duration | Contract performance |
| Password hash | Restricted | `user_details` table | Account lifetime | Contract performance |
| Product data | Public | `products` table | Indefinite | N/A |

## 3. Data Flow Diagram (Summary)

```
Browser ──HTTPS──► API Server ──► SQLite Database
                       │
                       └──► Logs (no PII logged)
```

- All data in transit is protected by TLS.
- The API server does not cache `Restricted` data in memory beyond the request lifecycle.
- Logs must not contain `Confidential` or `Restricted` fields (see `01-secure-coding-guidelines.md`).

## 4. Developer Responsibilities

- When adding a new database column that stores personal data, update this inventory.
- Tag new data elements with their classification (see `01-data-classification-policy.md`).
- Ensure new data flows are reviewed by the Data Governance Committee before going to production.
