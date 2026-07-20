# Secure Development Framework for Compliant Applications

## 1. Introduction and Core Goal

Welcome to the central knowledge base for building secure and compliant applications at **OctoCAT Supply**. The primary goal of this repository is to empower our software developers to create products—starting with our main webshop—that are secure and private by design.

This documentation is specifically structured to be consumed by **AI-assisted software development agents**. By providing clear, structured, and machine-readable guidelines, we enable AI agents to access this knowledge base to answer questions, review code for compliance issues, and assist in generating secure code from the start.

Our core values are:
-   **Security by Default:** Building applications that are resilient to threats from the ground up.
-   **Privacy by Design:** Embedding data protection into the entire development lifecycle.
-   **Clarity and Actionability:** Providing guidelines that are easy to understand and implement.
-   **AI-Enablement:** Structuring knowledge so that it can be effectively used by next-generation AI development tools.

## 2. Documentation Structure

This repository is organized into five key sections, each serving a distinct purpose in the development lifecycle.

### `/01-Foundational-Principles`

**Goal:** To establish the "why" behind our commitment to security and privacy.
This section contains the high-level policies and ethical standards that form the bedrock of our development culture. It includes our internal privacy policy and the developer's code of conduct.

### `/02-Legal-Frameworks`

**Goal:** To outline the legal and regulatory landscape we operate in.
Here you will find summaries of critical regulations like GDPR, CCPA, and PCI DSS. This section also covers our policies on data residency, cross-border data transfers, and the multilingual requirements for our public-facing legal documents like the Terms of Service.

### `/03-Data-Governance`

**Goal:** To provide a framework for managing data responsibly.
This section is about the data itself. It includes our official **Data Classification Policy** to help you identify data sensitivity, a **Data Inventory Map** for the webshop, and our **Data Retention and Deletion Policy** to ensure we don't keep data longer than necessary.

### `/04-Secure-Development`

**Goal:** To provide actionable, hands-on guidance for writing secure code.
This is the most practical section for day-to-day development. It contains our **Secure Coding Guidelines** (based on OWASP Top 10), a **Security Checklist** for code reviews, and a guide to performing **Threat Modeling** to identify risks before you write a single line of code.

### `/05-Privacy-Specific`

**Goal:** To detail the implementation of privacy-centric features.
This section dives deep into features required by privacy laws. It includes technical guidelines for **User Consent Management** (for cookies and marketing) and a developer **Playbook for handling Data Subject Rights (DSR)**, such as requests for data access or deletion.

## 3. How to Use with an AI Agent

These documents are formatted in Markdown with YAML frontmatter to make them easy to parse. An AI agent can be configured to use this repository as its primary source of truth for all compliance, security, and privacy questions.

**Example Queries for an AI Agent:**
- *"What is OctoCAT Supply's policy on storing PII?"*
- *"Generate a Go function to connect to the database, ensuring it follows our secure coding guidelines."*
- *"Review this Python code for potential SQL injection vulnerabilities."*
- *"According to the DSR playbook, what steps are needed to build a data erasure API?"*
