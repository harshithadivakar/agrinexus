# Agrinexus Android App PRD v2

Date: 2026-06-26  
Status: Draft v2 for stakeholder and engineering review  
Product stage: Prototype  
Primary market: India  
Primary platform: Android  
Source inputs: `AGENTS.md`, `outputs/agrinexus-app-prd.md`, `outputs/design.md`, `outputs/agrinexus-app-development-plan.md`, `tasks/todo.md`

## Method Notes

This PRD uses:

- `prd`: structured PRD creation, assumption tagging, requirements, and acceptance criteria.
- `prd-development`: 10-section PRD structure connecting problem, users, solution, metrics, requirements, scope, risks, and open questions.
- `karpathy-guidelines`: explicit assumptions, narrow MVP scope, verifiable success criteria, and no speculative implementation.
- `pm-skill-creator`: scope discipline. One artifact, one job, no kitchen-sink expansion.
- `openai-docs`: no OpenAI API feature is currently in MVP. If future AI assistant or agent features are added, official OpenAI documentation must be checked before specifying models, APIs, tools, data handling, or deployment guidance.

Gap labels:

- Assumption: plausible but unvalidated.
- Open Question: unknown and needs a decision, research, or stakeholder input.

## Document Information

Authors:

- Codex draft for Shatru

Reviewers:

- Founder/product owner: TBD
- Design reviewer: TBD
- Engineering reviewer: TBD
- Compliance/privacy reviewer: TBD

Change log:

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-06-26 | Initial app PRD created. |
| 0.2 | 2026-06-26 | Added design brief and development plan. |
| 0.3 | 2026-06-26 | Refreshed as v2 using latest project context, PM PRD structure, and engineering guardrails. |

## 1. Executive Summary

Agrinexus is building an Android companion app for urban, health-conscious, and environment-conscious home users in India who want fresh herbs and small greens at home without managing a technical gardening system. The MVP will help users create an account, pair one countertop Agrinexus device by QR code, complete first setup, passively check garden status when they open the app, find pod refill links, and get support. Success means users can confidently move from account creation to a paired, set up, growing device while the app stays claim-safe, low-friction, and free of push notifications, reminders, native checkout, or multi-device complexity.

Assumption: the primary product value is setup confidence and ownership clarity, not app engagement for its own sake. Validate through onboarding completion, QR pairing success, support request themes, and user interviews.

## 2. Problem Statement

### Who Has This Problem?

Primary users are 25-45 year old urban or space-constrained home users in India who want fresher herbs and small greens at home, like aesthetic kitchen products, and care about health or environmental impact without wanting a technical gardening hobby.

Secondary users may include gift buyers, families sharing one kitchen device, and early adopters of kitchen appliances. These are not MVP optimization targets.

### What Is The Problem?

Home hydroponics can feel technical, messy, or intimidating. Without a simple app, a first-time user may not know how to pair the device, complete setup, choose a plant, understand passive device status, buy replacement pods, or get help.

The specific MVP problem is not "people need another plant-care app." The problem is that a countertop hydroponic appliance needs a calm setup and ownership companion so first-time users can trust what to do next.

### Why Is It Painful?

User impact:

- Users may feel unsure whether they set up the device correctly.
- Users may worry they need to monitor the system daily.
- Users may not know where to buy pods or how subscriptions will work.
- Users may misinterpret water, light, or pH status if the app uses technical language.
- Users may lose trust if the app makes claims the hardware cannot prove.

Business impact:

- Failed setup can increase support load.
- Unclear refill paths can weaken pod repeat purchase and subscription potential.
- Unsupported claims create trust, compliance, and brand risk.
- A technical-feeling app can conflict with the playful kitchen brand positioning.

### Evidence

Known from founder input:

- Product is prototype stage.
- Target audience is 25-45, health-conscious, environment-conscious, and India-based.
- Hardware is intended to be aesthetic and countertop-friendly.
- The app MVP is Android-first.
- Users must create an account.
- MVP supports one QR-paired device.
- App should show passive status when opened.
- App should not use reminders or app alerts.
- Pod purchase should link externally for MVP.

Assumption: setup confusion and refill uncertainty are high-value problems to solve first. Validate through prototype tests, onboarding usability sessions, and support logs after pilot use.

Open Question: what real customer discovery exists beyond founder assumptions?

## 3. Target Users And Personas

### Primary Persona: Ananya

Role:

- Urban professional or young household decision-maker in India.

Context:

- Lives in an apartment or compact home.
- Cooks at home often enough to value herbs and small greens.
- Likes attractive kitchen products.
- Has limited time and does not want a gardening hobby.
- Comfortable using Android apps and online marketplaces.

Goals:

- Grow fresh herbs and small greens at home.
- Set up the device correctly on the first try.
- Understand whether the garden is okay without checking it constantly.
- Refill pods easily.
- Feel confident the product is trustworthy and not overclaiming.

Pain points:

- Does not want soil, pests, mess, or complicated care.
- Does not want another notification-heavy app.
- May be skeptical of sustainability or health claims unless they are concrete.
- May worry about replacement pod availability.

Current behavior:

- Buys herbs or small greens from grocery, local markets, or delivery apps.
- May waste unused herbs.
- May have tried plants before but struggled with care or consistency.

### Secondary Persona: Rohan

Role:

- Design-conscious tech early adopter or gift buyer.

Differs from primary:

- More interested in the device as an attractive smart kitchen product.
- More tolerant of setup steps.
- May care about status details and novelty.

MVP implication:

- Serve this persona through polished visual design and clear status, but do not optimize the MVP around advanced controls.

### Jobs To Be Done

Functional job:

- "When I bring Agrinexus home, I want to set it up, start a pod, and know how to keep it running without learning hydroponics."

Emotional job:

- "I want to feel confident and a little delighted that fresh herbs are growing in my kitchen."

Social job:

- "I want the product to look good on my counter and reflect that I make thoughtful choices about food and home."

Assumption: these personas and jobs are inferred from founder input, not yet validated through user interviews.

## 4. Strategic Context

### Business Goals

The app supports the broader Agrinexus business by:

- Reducing first-use friction for a prototype-stage hardware product.
- Making the pod-based growing model easier to understand.
- Supporting future refill and subscription revenue.
- Protecting brand trust with claim-safe language.
- Creating a support and education channel without push alerts or reminders.

Assumption: the app is necessary for successful device onboarding and retention. Validate through prototype testing with and without app-guided setup.

### Competitive Landscape

Closest named competitor:

- Click & Grow.

Agrinexus should differentiate through:

- Playful kitchen-native brand voice.
- Aesthetic countertop positioning.
- Clear, low-effort setup.
- Pod-based convenience.
- Honest claim-safe messaging.
- Passive status instead of intrusive alerts.

Do not copy competitor language, claim structure, or UX patterns.

### Why Now?

The product is in prototype stage, and the app should be specified before implementation begins so engineering does not invent unsupported hardware behavior, app alerts, checkout flows, multi-device support, or broad crop claims.

Sprint 0 should resolve the decisions that block clean development:

- Stack.
- Auth.
- Backend.
- QR payload.
- Device status path.
- Plant catalog.
- External links.
- Support channel.
- Legal URLs.

## 5. Solution Overview

### Solution Description

The Agrinexus Android app is a companion app for one countertop hydroponic device. A user creates an account, pairs the device by scanning a QR code, follows a guided setup flow, chooses a plant, and lands on a calm garden dashboard. The dashboard shows passive status when opened, including water level, light status, pH status, pod age, harvest window, and last updated time when data is available.

The app also includes a Pods area for external one-time purchase and subscription links, a Learn area for setup and care education, and a Support area for common issues and contact routing. The MVP does not include push notifications, reminders, app alerts, native checkout, iOS, multiple devices, advanced controls, or AI diagnosis.

### Key Features

- Account creation and sign in.
- One-device QR pairing.
- Guided setup flow: setup device, add water, insert pod, choose plant.
- Passive Garden dashboard.
- Status states for water, light, pH, pod age, harvest window, and last updated time.
- Plant selection from approved launch catalog.
- External pod purchase link.
- External refill subscription link.
- Learn content for setup, refill, pod replacement, harvest, and cleaning.
- Support topics and contact route.
- Claim-safe app copy.
- Light and dark mode support.
- Loading, empty, unavailable, stale, error, and permission-denied states.

### Design Direction

Design source:

- `outputs/design.md`

Core design read:

- Native Android companion app for health-conscious home users in India.
- Playful kitchen-appliance language.
- Material-informed mobile UI plus fresh consumer brand layer.
- Fresh, tactile, bright, and calm.
- Not a farm dashboard, lab dashboard, wellness hype app, or marketplace-first app.

Navigation after setup:

- Garden.
- Pods.
- Learn.
- Support.

Account/profile should live in settings or a top-right area unless account tasks become frequent.

## 6. Success Metrics

### Primary Metric

Setup completion rate:

- Definition: percentage of signed-in users with a paired device who complete setup through plant selection and reach the Garden dashboard.
- Current: Open Question, no baseline yet.
- Target: Open Question, set after pilot baseline.
- Timeline: measure after pilot or first closed beta cohort.

### Secondary Metrics

- Account creation completion rate.
- QR pairing success rate.
- Average time from app open to paired device.
- Percentage of users who complete setup without contacting support.
- Dashboard views after setup.
- Marketplace link click-through rate.
- Subscription link click-through rate.
- Support starts during setup.
- Crash-free sessions.

### Guardrail Metrics

- Notification permission prompts: must remain zero in MVP.
- Unsupported claim occurrences in app copy: must remain zero.
- Native checkout attempts: must remain zero in MVP.
- Second-device pairing success: must remain blocked in MVP.
- Support request rate should not spike due to unclear QR pairing or setup copy.

### Instrumentation Events

Minimum analytics events:

- `account_create_started`
- `account_create_completed`
- `sign_in_completed`
- `qr_scan_started`
- `qr_scan_succeeded`
- `qr_scan_failed`
- `device_pairing_completed`
- `setup_started`
- `setup_step_completed`
- `setup_completed`
- `garden_dashboard_viewed`
- `device_status_unavailable_seen`
- `pod_purchase_link_opened`
- `subscription_link_opened`
- `support_topic_opened`
- `support_contact_started`

Assumption: analytics provider and event schema are not yet selected.

## 7. User Stories And Requirements

### Epic Hypothesis

We believe that an Android companion app with account creation, QR pairing, guided setup, passive status, pod links, education, and support will increase first-use success for Agrinexus prototype users because users need confidence and clear next actions when using a countertop hydroponic device for the first time. We will measure success through setup completion rate, QR pairing success rate, support request rate during setup, and dashboard views after setup.

### Story 1: Create Account

As a new Agrinexus user, I want to create an account, so that my device and plant cycle can be associated with me.

Acceptance criteria:

- Given a new user, when they submit valid account details, then an account is created.
- Given account creation succeeds, when the user continues, then they are taken to device pairing.
- Given invalid details, when the user submits the form, then the app shows a plain-language inline error.
- Given the user is signed out, when they open the app, then protected device screens are not accessible.

### Story 2: Sign In And Resume

As an existing Agrinexus user, I want to sign in, so that I can resume my device and plant status.

Acceptance criteria:

- Given an existing user, when they sign in successfully, then the app restores their paired device and setup state.
- Given sign in fails, when the app receives the error, then the app shows a calm, useful error message.
- Given the user signs out, when they return, then account-protected content requires sign in.

### Story 3: Pair One Device With QR Code

As a signed-in user, I want to scan the QR code on my Agrinexus device, so that the app can pair my garden to my account.

Acceptance criteria:

- Given a valid unpaired Agrinexus QR code, when scanned, then the device is linked to the user account.
- Given an invalid QR code, when scanned, then the app explains that it is not an Agrinexus code.
- Given camera permission is denied, when the user tries to scan, then the app shows a recovery path.
- Given the user already has a paired device, when they try to pair another, then the app blocks the action and explains that MVP supports one device.
- Given hardware supports manual pairing codes, when QR scan fails, then the user can use the fallback.

Open Question: does hardware support manual code fallback?

### Story 4: Complete Guided Setup

As a paired user, I want guided setup steps, so that I can start my first pod correctly.

Acceptance criteria:

- Given a paired device, when setup starts, then the app presents setup device, add water, insert pod, choose plant, and start growing steps.
- Given the user completes a step, when they continue, then progress is saved.
- Given the app closes mid-setup, when reopened, then the app resumes from the last incomplete step.
- Given setup is complete, when the user reaches the Garden dashboard, then selected plant and pod start date are visible.

### Story 5: Choose Plant

As a user starting a pod, I want to choose what I am growing, so that the app can show the right plant context.

Acceptance criteria:

- Given the plant catalog is loaded, when the user reaches plant selection, then approved launch plants are shown.
- Given strawberries are not validated for launch, when the user sees the plant list, then strawberries are omitted or marked unavailable.
- Given the user selects a plant, when setup completes, then active plant type is stored.
- Given harvest window data is unavailable, when plant details are displayed, then the app avoids fake growth timing.

Open Question: which crops and harvest windows are validated for MVP?

### Story 6: View Passive Garden Dashboard

As an Agrinexus user, I want to check my garden status when I open the app, so that I know whether everything looks okay.

Acceptance criteria:

- Given status data is available, when the user opens Garden, then active plant, pod age, harvest window, water level, light status, pH status, and last updated time are visible.
- Given status data is unavailable, when Garden loads, then the app shows a calm unavailable state and a support path.
- Given status data is stale, when Garden loads, then the app clearly indicates the last updated time.
- Given water or pH needs attention, when the user opens the app, then the dashboard can show that passive status but must not send push alerts or reminders.

### Story 7: Find Pods And Refills

As a user, I want to find replacement pods or refill plans, so that I can continue growing after my current pod.

Acceptance criteria:

- Given a one-time marketplace link is configured, when the user taps the purchase action, then the external destination opens.
- Given a subscription link is configured, when the user taps the subscription action, then the external destination opens.
- Given a link is missing, when the user opens Pods, then the app shows a neutral coming-soon state.
- Given the user is leaving the app, when opening an external link, then the app makes that clear where appropriate.
- The app does not process native payments in MVP.

### Story 8: Learn Routine Care

As a user, I want short care guidance, so that I can refill water, replace pods, harvest, and clean the tank correctly.

Acceptance criteria:

- Learn includes setup, water refill, pod replacement, harvest, and cleaning content.
- Content uses plain kitchen-native language.
- Content avoids unsupported claims.
- Long technical hydroponic explanations are excluded from MVP unless needed for support.

### Story 9: Get Support

As a user with a setup or device question, I want support topics and a contact route, so that I can recover without feeling stuck.

Acceptance criteria:

- Support includes setup help, QR pairing help, pod help, water help, device help, cleaning help, and contact route.
- Setup help is reachable within two taps from Support.
- If the support contact channel is unavailable, then the app shows a neutral unavailable state.
- Support copy does not blame the user.

### Story 10: Observe Engineering And Quality Guardrails

As the product team, we want the app built with clear technical guardrails, so that MVP development stays maintainable and testable.

Acceptance criteria:

- Core logic is separated from UI, platform input/output, and backend implementations.
- Secrets, URLs, API keys, and environment-specific values are loaded from secure config or environment variables, not hardcoded.
- External service dependencies are listed.
- `DeviceStatusRepository` can return mock data until hardware status transport is finalized.
- Tests cover core logic and edge cases.
- CI runs lint, tests, type-check or static analysis where applicable, and build checks.
- Logging exists for critical operations without logging secrets or unnecessary personal data.

## 8. Functional Requirements

### Account And Identity

- FR-001: The app must require account creation or sign in before device pairing.
- FR-002: The app must support sign in, sign out, and session resume.
- FR-003: The app must associate one user account with one MVP device.
- FR-004: The app must block second-device pairing in MVP.
- FR-005: The app must include privacy policy and terms links before release.

### Device Pairing

- FR-006: The app must scan a QR code to pair an Agrinexus device.
- FR-007: The app must validate the QR code before registering the device.
- FR-008: The app must store paired device ID, pairing status, pairing timestamp, and user ID.
- FR-009: The app must support invalid QR and permission-denied states.
- FR-010: The app should include manual fallback only if supported by the hardware contract.

### Guided Setup

- FR-011: The app must guide the user through setup device, add water, insert pod, and choose plant.
- FR-012: The app must save setup progress so users can resume.
- FR-013: The app must allow the user to choose from the approved launch plant catalog.
- FR-014: The app must record pod start date after setup completion.
- FR-015: The app must show a setup-complete state before routing to Garden.

### Garden Dashboard

- FR-016: The app must show one primary Garden dashboard after setup.
- FR-017: The dashboard must show active plant and pod age.
- FR-018: The dashboard must show harvest window when approved data exists.
- FR-019: The dashboard must show water level, light status, pH status, and last updated time when data exists.
- FR-020: The dashboard must support unavailable and stale states.
- FR-021: The dashboard must remain passive and must not send push notifications, reminders, or app alerts in MVP.

### Pods And Refills

- FR-022: The app must include a Pods section.
- FR-023: The Pods section must support one-time external marketplace link.
- FR-024: The Pods section must support external subscription link.
- FR-025: The app must handle missing links with a coming-soon state.
- FR-026: The app must not process native payments in MVP.

### Learn And Support

- FR-027: The app must include Learn content for setup, water refill, pod replacement, harvest, and cleaning.
- FR-028: The app must include Support topics for setup, QR pairing, pod, water, device, cleaning, and contact route.
- FR-029: Setup help must be reachable within two taps from Support.
- FR-030: Support must handle unavailable contact route gracefully.

## 9. Non-Functional Requirements

- NFR-001: The app must be optimized for Android MVP launch.
- NFR-002: The app should work well on common mid-range Android devices in India.
- NFR-003: The app must use Material-informed UI and Agrinexus design tokens unless the stack decision changes this.
- NFR-004: The app must support light and dark mode.
- NFR-005: The app must respect reduced motion.
- NFR-006: Primary touch targets must be at least 48 x 48 px.
- NFR-007: Body text and primary buttons must meet WCAG AA contrast.
- NFR-008: The app must use plain, non-technical language.
- NFR-009: The app must avoid unsupported health, environmental, performance, and maintenance claims.
- NFR-010: The app must handle poor or intermittent network conditions gracefully.
- NFR-011: Account and device data must be stored securely through the selected stack.
- NFR-012: External service dependencies must be mocked in tests.
- NFR-013: Core logic must be separable from platform input/output.
- NFR-014: The app must not request notification permission in MVP.

## 10. Data, Privacy, Analytics, And Logging

### Data Requirements

- DATA-001: Store user account ID and authentication state.
- DATA-002: Store required account profile basics for support.
- DATA-003: Store paired device ID, QR pairing status, pairing date, and device nickname if supported.
- DATA-004: Store active plant type, pod start date, and plant cycle status.
- DATA-005: Store latest available water level, light status, pH status, harvest window, pod age, and last updated timestamp.
- DATA-006: Store configured one-time marketplace link and subscription link.
- DATA-007: Store support request metadata only if support is handled in-app.
- DATA-008: Track onboarding, pairing, setup, dashboard, link click, and support events.

### Privacy Requirements

- PRIV-001: Do not log secrets, tokens, raw QR secrets, or unnecessary personal data.
- PRIV-002: Provide privacy policy and terms links before release.
- PRIV-003: Use secure configuration for secrets and endpoint URLs.
- PRIV-004: Confirm data retention and account deletion expectations before release.

### Logging Requirements

Log critical operations:

- Account creation and sign-in failures.
- QR scan attempts and validation failures.
- Device pairing state transitions.
- Setup progress transitions.
- Device status fetch failures.
- External marketplace link opens.
- Support starts and failures.
- Network and backend errors.

## 11. Out Of Scope

Not included in this MVP:

- iOS app.
- Multiple devices.
- Push notifications.
- App alerts.
- Care reminders.
- Native pod checkout.
- Native subscription billing.
- Automated nutrient dosing controls.
- Advanced hydroponic controls.
- Firmware update flow.
- Warranty registration unless explicitly added.
- Community features.
- Recipe feed.
- AI plant diagnosis.
- Personalized recommendations.
- Environmental impact dashboard.
- Broad "vegetable garden" positioning.
- Claims that the product is organic, pesticide-free, zero waste, no maintenance, or proven to save water.
- OpenAI-powered or AI-agent features.

Future considerations:

- iOS.
- Multiple devices.
- Native pod store.
- Native subscription management.
- Warranty registration.
- Firmware update support.
- Shared household access.
- Crop-specific guidance.
- Recipes and harvest inspiration.
- Localized India content.
- Evidence-backed sustainability education.
- AI assistant or diagnosis features only after explicit product decision and official OpenAI/API documentation review.

## 12. Dependencies And Risks

### Dependencies

Technical:

- App stack decision.
- Auth and backend provider.
- QR payload and validation contract.
- Device status data model.
- Hardware-to-app status transport path.
- Repository interfaces and mock data.
- Analytics provider and event schema.
- Testing framework and CI setup.

External:

- Marketplace URL.
- Subscription URL.
- Support channel.
- Privacy policy and terms URLs.
- Product and crop photography or placeholder assets.
- Regulatory and compliance review for India.

Team:

- Founder/product owner decisions for Sprint 0.
- Design review against `outputs/design.md`.
- Engineering review of feasibility and hardware data contract.
- Compliance/privacy review before release.

### Risks And Mitigations

| Risk | Type | Mitigation |
|---|---|---|
| QR pairing identifies the device but does not define live status transport. | Feasibility | Keep `DeviceStatusRepository` mockable; finalize hardware-to-app contract before production status work. |
| Status values are prototype/demo values but appear real. | Trust | Label prototype data internally and avoid showing unverified precision. |
| App copy overclaims product capability. | Viability | Run claim-safe copy review before release; block organic, pesticide-free, zero waste, no maintenance, saves water, and broad vegetable claims unless proven. |
| Strawberries are included before reliable validation. | Value/trust | Omit or mark unavailable until crop validation exists. |
| External marketplace or subscription links are not ready. | Viability | Use coming-soon state; do not build native checkout as workaround. |
| Support demand spikes during setup. | Usability | Test setup flow with prototype users; make setup help reachable within two taps. |
| Notifications creep into MVP. | Scope | Explicitly block notification permission and app alerts in acceptance criteria and QA. |
| Regulatory or privacy requirements are missed. | Compliance | Review privacy, terms, electrical safety, seed/plant/pod sales, and India-specific regulations before release. |

## 13. Sprint 0 Decisions

These decisions must be resolved or explicitly mocked before implementation.

| Decision | Options | Recommendation | Status |
|---|---|---|---|
| App stack | Native Android with Kotlin and Jetpack Compose, or React Native | Native Android unless cross-platform team constraints require React Native | Open |
| Auth method | Phone OTP, email OTP, password, Google sign-in, combination | Decide based on India launch expectations and backend provider | Open |
| Backend provider | Firebase, Supabase, custom API, temporary prototype backend | Choose simplest provider that supports auth, device registration, links, and support needs | Open |
| QR payload | Device ID, serial number, token, model, registration URL | Must be finalized with hardware team | Open |
| Device status path | Sensor API, cloud sync, local bridge, mock | Mock for early UI; production path TBD | Open |
| Plant catalog | Herbs, lettuce, microgreens, strawberries | Include only validated crops in MVP | Open |
| Harvest windows | Crop-specific approved windows | Avoid fake timings until approved | Open |
| Marketplace URL | External one-time pod link | Required for Pods MVP | Open |
| Subscription URL | External subscription link | Required for refill entry point | Open |
| Support channel | WhatsApp, email, phone, form, in-app request | Choose one MVP channel first | Open |
| Legal URLs | Privacy policy and terms | Required before release | Open |

## 14. Open Questions

| Question | Owner | Needed By | Status |
|---|---|---|---|
| How does the device send water, light, and pH status after QR pairing? | Hardware and engineering | Before dashboard production integration | Open |
| What exactly is inside the QR payload? | Hardware and engineering | Before pairing implementation | Open |
| Which authentication method should Android use? | Product and engineering | Sprint 0 | Open |
| Which backend provider should be used? | Engineering | Sprint 0 | Open |
| Are water and pH actual readings, simplified statuses, or prototype values? | Hardware and product | Before dashboard final copy | Open |
| Which plants are validated for launch? | Product and hardware/growing team | Before plant catalog implementation | Open |
| What harvest windows are approved for each plant? | Product and growing team | Before plant detail UI | Open |
| What marketplace URL will pod links use? | Product/operations | Before Pods implementation | Open |
| Will subscriptions use the same marketplace or separate web flow? | Product/operations | Before Pods implementation | Open |
| What support channel launches first? | Product/support | Before Support implementation | Open |
| What cleaning frequency should the app recommend? | Product/hardware | Before Learn content finalization | Open |
| Should Hindi or another Indian language be included at launch? | Product/market | Before release planning | Open |
| What is the target hardware price currency and strategy? | Founder/business | Before investor/ecommerce copy | Open |
| What pod materials are used and are they recyclable in target Indian markets? | Product/operations | Before sustainability copy | Open |
| What India-specific regulations affect device, seed, plant, or pod sales? | Legal/compliance | Before release | Open |

## 15. PRD Self-Assessment

### Strongest Sections

- MVP scope and non-goals are strong. The project has clear boundaries: Android first, one device, QR pairing, guided setup, passive dashboard, external pod links, no reminders, no alerts, no native checkout.
- Claim guardrails are strong and should prevent risky launch copy.

### Weakest Sections

- Evidence and strategic context are weakest because customer discovery, market sizing, baseline metrics, and business targets have not been provided.
- Hardware integration is the biggest unresolved feasibility area.

### Top Assumptions To Validate

| # | Assumption | Risk If Wrong | Proposed Validation |
|---|---|---|---|
| 1 | Users need an app-guided setup to succeed with the device. | App may overbuild onboarding or miss the real friction. | Run moderated prototype setup sessions. |
| 2 | Passive status is enough without reminders or alerts. | Users may miss important care actions. | Test dashboard-only status with early users and support logs. |
| 3 | QR pairing plus account is acceptable for first use. | Pairing friction may reduce setup completion. | Usability test QR flow and permission-denied states. |
| 4 | External links are enough for pod purchase and subscription in MVP. | Refill conversion may be weak or journey may feel broken. | Track link click-through and completion where marketplace data allows. |
| 5 | Strawberries belong in the launch crop story. | Product trust suffers if they do not grow reliably. | Validate crop performance before featuring them. |

### Recommended Next Step

Complete Sprint 0 decisions before implementation. The highest-priority decision is the hardware-to-app status contract, because it determines whether the Garden dashboard shows real sensor readings, simplified statuses, or mock prototype data.

## 16. MVP Definition

The Agrinexus Android app MVP is complete when:

- Account creation works.
- Sign in works.
- Sign out works.
- One device can be QR paired.
- Second-device pairing is blocked.
- Guided setup completes.
- Setup progress resumes after app close.
- Plant can be selected from approved launch catalog.
- Pod start date is recorded.
- Garden dashboard displays active plant, pod age, harvest window, water, light, pH, and last updated time when data exists.
- Dashboard handles unavailable and stale status.
- Pods screen routes to external one-time purchase link.
- Pods screen routes to external subscription link.
- Missing links show coming soon.
- Learn content covers setup, water refill, pod replacement, harvest, and cleaning.
- Support path exists.
- No push notification permission is requested.
- No unsupported product claims appear.
- App works in light and dark mode.
- Touch targets meet 48 x 48 px.
- Config, secrets, URLs, and API keys are not hardcoded.
- Core logic is separated from platform input/output.
- External services are mockable in tests.
- Lint, test, and build checks pass for the chosen stack.

