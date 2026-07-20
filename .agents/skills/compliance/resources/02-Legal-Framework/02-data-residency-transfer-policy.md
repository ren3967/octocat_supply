---
title: "Data Residency and Cross-Border Transfer Policy"
category: "Legal Frameworks"
version: 1.0
last_updated: "2025-10-20"
owner: "Legal & Compliance Team"
keywords: [data residency, data transfer, gdpr, hosting, cloud]
---

# Data Residency and Cross-Border Transfer Policy

## 1. Policy Statement

To comply with global regulations, particularly GDPR, we must control where personal data is stored and how it is transferred across borders.

## 2. Approved Data Storage Locations

-   **Primary Region (EU Data):** All personal data belonging to EU residents **must** be stored in our primary cloud region: `eu-central-1` (Frankfurt).
-   **Secondary Region (Non-EU Data):** Data for customers outside the EU should be stored in `us-east-1` (North Virginia).
-   **Prohibited Regions:** It is forbidden to store or process personal data in any unapproved cloud region.

## 3. Cross-Border Data Transfers

-   **Definition:** A cross-border transfer occurs when you move personal data from one legal jurisdiction to another (e.g., from the EU to the US).
-   **Rules for EU Data:**
    -   Transferring EU personal data outside of the EU is strictly regulated.
    -   It is only permitted if the receiving service or entity has a valid data transfer mechanism in place, such as **Standard Contractual Clauses (SCCs)**.
    -   **Action:** Before integrating any new third-party service (SaaS, API) that will process data of EU users, you **must** verify with the Legal team that a valid transfer mechanism is in place. Do not assume.
