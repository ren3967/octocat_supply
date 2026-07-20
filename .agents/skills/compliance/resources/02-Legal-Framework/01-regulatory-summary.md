---
title: "Summary of Applicable Regulations"
category: "Legal Frameworks"
version: 1.1
last_updated: "2025-10-20"
owner: "Legal Team"
keywords: [gdpr, ccpa, cpra, pci dss, legal, compliance, regulations]
---

# Summary of Applicable Regulations for the Webshop

This document provides a high-level overview of the key regulations that apply to our webshop. Developers must be aware of these obligations.

## 1. GDPR (General Data Protection Regulation)

-   **Applies to:** Any data from individuals in the European Union (EU).
-   **Key Developer Obligations:**
    -   Implement mechanisms to support Data Subject Rights (access, deletion, etc.).
    -   Ensure explicit user consent is obtained for data processing (e.g., marketing).
    -   Anonymize or pseudonymize personal data where possible.
    -   Report data breaches within 72 hours.

## 2. CCPA/CPRA (California Consumer Privacy Act / Privacy Rights Act)

-   **Applies to:** Any data from residents of California.
-   **Key Developer Obligations:**
    -   Provide a clear "Do Not Sell or Share My Personal Information" link and mechanism.
    -   Support user rights to know, delete, and correct their data.
    -   Limit the use of "Sensitive Personal Information."

## 3. PCI DSS (Payment Card Industry Data Security Standard)

-   **Applies to:** Our entire webshop infrastructure, as we handle credit card data.
-   **Key Developer Obligations:**
    -   **Never store raw credit card numbers, CVV codes, or magnetic stripe data.** We use a tokenized solution with our payment gateway for this.
    -   Ensure all data transmission of cardholder data is encrypted using strong cryptography (e.g., TLS 1.2+).
    -   Protect systems against malware and regularly update and patch all components.
    -   Follow secure coding practices to prevent vulnerabilities like SQL Injection or Cross-Site Scripting (XSS).
