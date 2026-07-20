---
title: "User Consent Management Guidelines"
category: "Privacy-Specific"
version: 1.0
last_updated: "2025-10-20"
owner: "Legal & Privacy Team"
keywords: [consent, gdpr, marketing, cookies]
---

# User Consent Management Guidelines

## 1. The Standard for Consent (GDPR)

Under GDPR, consent must be:
-   **Freely given:** The user must have a real choice.
-   **Specific:** Consent for marketing emails is separate from consent for analytics cookies.
-   **Informed:** The user must know what they are consenting to.
-   **Unambiguous:** It must be a clear, affirmative action (e.g., checking a box). Pre-checked boxes are not allowed.
-   **Easy to withdraw:** It must be as easy for a user to withdraw consent as it was to give it.

## 2. Implementation Requirements

### For Marketing Consent (e.g., Newsletters)
-   **UI:** Use an unchecked checkbox with clear explanatory text. Example: `[ ] I would like to receive promotional emails and newsletters.`
-   **Backend:**
    -   Record the `user_id`, the `timestamp` of consent, and the specific `version` of the privacy policy they consented to.
    -   Provide a clear "Unsubscribe" link in every marketing email.
    -   Provide a preference center where users can manage their communication settings.

### For Cookie Consent
-   **UI:**
    -   Use a cookie banner on the user's first visit.
    -   The banner must not block access to the site's legal documents (Privacy Policy).
    -   It must provide "Accept All", "Reject All", and "Customize" options.
    -   "Reject All" must be as easy to click as "Accept All".
-   **Backend:**
    -   No non-essential cookies (e.g., analytics, advertising) may be placed on the user's device until they have given explicit consent.
    -   The user's choices must be stored and respected on subsequent visits.
    -   Provide a link in the footer (e.g., "Cookie Settings") for users to change their preferences at any time.
