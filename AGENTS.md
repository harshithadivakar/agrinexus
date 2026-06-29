# AGENTS.md

Guidance for AI and coding agents working on Agrinexus.

## 1. Start Here

Before doing project work, read these files:

- `memory/MEMORY.md`
- `memory/lessons.md`
- `tasks/todo.md`
- `outputs/agrinexus-app-prd-v2.md`
- `outputs/design.md`
- `outputs/agrinexus-app-development-plan.md`

Use `tasks/todo.md` as the active sprint tracker. Plan there before building, and mark work complete as it ships.

## 2. Project Context

Agrinexus is a home hydroponics brand building an aesthetic countertop hydroponic system for kitchens and small homes.

The product is at prototype stage. Treat product, performance, sustainability, health, and compliance claims as provisional unless backed by test data, certification, source material, or explicit founder approval.

Launch market: India.

Primary audience:

- Ages 25-45.
- Health-conscious.
- Environment-conscious.
- Urban or space-constrained home users.
- People who want fresh herbs and small greens without a technical gardening hobby.

Brand feel:

- Playful kitchen brand.
- Fresh, optimistic, and approachable.
- Modern and aesthetic without sounding cold or overly scientific.
- Practical and trustworthy.

Closest named competitor:

- Click & Grow.

Do not copy competitor wording, visual systems, UX patterns, or claim structures.

## 3. Product Truths

Known product facts:

- Countertop hydroponic appliance.
- Pod-based growing format, similar in convenience to Nespresso capsules.
- Automated lighting.
- Automated pH monitoring.
- User refills water, replaces pods, cleans the tank, and harvests.
- Target unattended run time is 2 weeks before water refill, currently a prototype target.
- Intended crops: herbs, lettuce, microgreens, and strawberries.
- Pods are recyclable.

Currently not planned:

- Automated nutrient dosing.
- Push notifications.
- App alerts.
- Care reminders.
- Native checkout in MVP.
- Multiple devices in MVP.
- iOS in MVP.
- Community, recipes, AI plant diagnosis, or advanced hydroponic controls in MVP.

If a task requires any unplanned feature, ask before adding it.

## 4. Android App MVP

The app MVP is Android-first.

The MVP must let a user:

1. Create an account.
2. Pair one Agrinexus device using QR code.
3. Complete setup: setup device, add water, insert pod, choose plant.
4. View a passive garden dashboard when opening the app.
5. See water level, light status, pH status, pod age, harvest window, and last updated time when data exists.
6. Open external links for one-time pod purchase and refill subscription.
7. Access learning and support content.
8. Use the app without push notifications, reminders, unsupported claims, native checkout, or multi-device management.

The dashboard is passive. It may show status when opened, but it must not behave like an alert or reminder system.

## 5. Active Development Plan

Current sprint is Sprint 0: resolve build-critical decisions before implementation.

Do not start full app implementation until these are decided or explicitly mocked:

- App stack: native Android with Kotlin and Jetpack Compose, or React Native.
- Authentication method and backend provider.
- QR payload and pairing API contract.
- Device status model for water, light, pH, pod age, harvest window, and last updated time.
- Whether status values are real sensor data, simplified states, or prototype mock values.
- Launch plant catalog and approved harvest windows.
- External marketplace and subscription URLs.
- Support channel for MVP.
- Privacy policy and terms URLs.

Recommended path unless the project decides otherwise:

- Native Android with Kotlin and Jetpack Compose.
- Material 3 components customized with Agrinexus design tokens.
- Repository interfaces with mock implementations during early development.
- A mockable `DeviceStatusRepository` so UI does not depend on hardware transport details.

Important architecture rule:

- Do not invent live hardware behavior before the device status contract exists.

## 6. Technical Stack And Configuration

Keep core logic separable from deployment platform. Business logic should not depend directly on UI screens, webhook handlers, cloud functions, or server entrypoints.

Configuration rules:

- Load API keys, endpoint URLs, secrets, feature flags, and environment-specific settings from secure environment variables or a configuration service.
- Never hardcode secrets.
- Do not commit `.env` files containing secrets.
- Provide safe `.env.example` style documentation when a codebase exists.

Dependencies:

- List external libraries and services required for the app or agent to function.
- Keep dependency choices aligned to the selected stack.
- Before importing a third-party library, check the project package or build files.

Likely Android stack if native is chosen:

- Kotlin.
- Jetpack Compose.
- Material 3.
- Navigation Compose.
- Camera or QR scanning library selected during Sprint 0.
- Coroutines.
- DataStore or secure storage as needed.
- Backend/auth SDK selected during Sprint 0.
- JUnit plus Android or Compose UI test tools.
- MockK or another approved mocking tool.
- Ktlint, Detekt, or project-approved equivalents.

Likely React Native stack if chosen:

- TypeScript.
- React Native.
- React Navigation.
- A camera or QR scanning package selected during Sprint 0.
- Jest.
- React Native Testing Library.
- ESLint and Prettier.

## 7. Coding Standards

Follow the established style guide for the chosen stack.

General standards:

- Keep changes small and directly tied to the task.
- Keep business logic separate from input/output handling.
- Use clear names for variables, functions, classes, screens, and repositories.
- Prefer small reusable functions and modules.
- Add comments only when the reason for code is not obvious.
- Do not add speculative abstractions for future features.
- Do not refactor unrelated code.
- Do not hardcode configuration, URLs, API keys, or secrets.

Expected formatting and linting:

- Android native: use the configured Gradle, ktlint, Detekt, or Android Studio formatter commands.
- React Native or web: use configured ESLint, Prettier, TypeScript, and package scripts.
- If commands are missing, add or document them as part of setup instead of silently skipping quality checks.

## 8. Testing And Quality

Every new feature or fix should include tests for core behavior and important edge cases.

Coverage:

- Code coverage must not decrease below the project threshold.
- Use 80 percent as the default threshold until the project sets a different one.

Testing expectations:

- Unit tests for domain logic, repositories, view models, validation, and state transitions.
- UI tests for onboarding, QR pairing states, setup flow, and dashboard states where practical.
- Integration tests for external APIs, databases, auth, pairing, and support services.
- Mock external services so tests are fast, reliable, and isolated.
- Test empty, loading, success, error, permission-denied, unavailable, and stale states.

Suggested framework choices:

- Native Android: JUnit, Compose UI testing, MockK, Turbine when flows are used.
- React Native: Jest, React Native Testing Library, MSW or equivalent mocks.

Do not rely only on the happy path.

## 9. Deployment And Verification

All commits to the main branch should pass CI before merging.

CI should run:

- Formatting check.
- Linting.
- Static analysis or type-checking when applicable.
- Unit tests.
- Integration tests where available.
- Build or compilation check.

Use stack-equivalent commands. Examples after a codebase exists:

- Android native: `./gradlew test`, `./gradlew lint`, `./gradlew assembleDebug`.
- Windows Android native: `gradlew.bat test`, `gradlew.bat lint`, `gradlew.bat assembleDebug`.
- React Native or web: `npm run lint`, `npm test`, `npm run build`.

Before release or handoff:

- Confirm the app does not request notification permission in MVP.
- Confirm the app does not include unsupported claims.
- Confirm privacy policy and terms links are present.
- Test on emulator and at least one real Android device when possible.
- Verify accessibility: contrast, dynamic text, touch targets, and color-independent status.

## 10. Logging And Metrics

Implement logging for critical operations:

- Account creation and sign in failures.
- QR scan attempts and validation failures.
- Device pairing state transitions.
- Setup progress state transitions.
- Device status fetch failures.
- External marketplace link opens.
- Support starts and failures.
- Network and backend errors.

Use metrics to monitor:

- Account creation completion rate.
- QR pairing success rate.
- Setup completion rate.
- Time from app open to paired device.
- Dashboard views after setup.
- Marketplace link click-through.
- Support request rate during setup.
- Crash-free sessions.

Avoid logging secrets, raw tokens, sensitive account data, or unnecessary personal data.

## 11. UX And Design Guidance

Design source of truth:

- `outputs/design.md`

Current PRD source of truth:

- `outputs/agrinexus-app-prd-v2.md`

Core design direction:

- Native Android companion app.
- Material-informed mobile UI plus Agrinexus brand layer.
- Fresh, tactile, bright, and calm.
- Kitchen-native, not farm-management or lab-dashboard.
- One clear next action per setup screen.

Navigation after setup:

- Garden.
- Pods.
- Learn.
- Support.

Account/profile should live in a settings or top-right area unless account tasks become frequent.

Design constraints:

- Minimum touch target: 48 x 48 px.
- Labels above form inputs.
- No placeholder-only labels.
- Loading, empty, and error states for every core flow.
- No decorative status dots.
- No fake precise values.
- No generic stock imagery where product or crop visuals are needed.
- Respect light mode, dark mode, and reduced motion.

## 12. Copy And Claim Guardrails

Use plain language:

- "Garden"
- "Pod"
- "Water"
- "Light"
- "Harvest"
- "Refills"

Avoid technical language unless required:

- "Hydroponic cycle"
- "Nutrient protocol"
- "pH optimization"
- "Telemetry"
- "Crop management"

Do not publish these claims unless explicitly proven and approved:

- "Organic"
- "Pesticide-free"
- "Zero waste"
- "No maintenance"
- "Saves water"
- Broad "grows vegetables"

Safer wording:

- "Fresh herbs and small greens."
- "Low-maintenance."
- "Minimal upkeep."
- "Recyclable pods."
- "Designed for efficient indoor growing."
- "2-week refill target" only when clearly described as a prototype target.

CTA examples:

- "Create My Account"
- "Pair My Garden"
- "Start Setup"
- "Choose My Plant"
- "Start Growing"
- "Find Pods"
- "Explore Refills"
- "Get Setup Help"

Avoid generic CTAs such as "Submit" or "Proceed" when a more specific action is available.

## 13. Open Questions To Preserve

Do not erase or hide these. Resolve them before production implementation or release copy.

High priority:

- How does the device send water level, light status, and pH status to the app after QR pairing?
- What is the exact QR payload?
- What authentication method should Android use?
- Are water level and pH real readings, simplified statuses, or prototype mock values?
- Which plants are validated for launch?
- What harvest windows are approved for each plant?
- What marketplace and subscription links will be used?
- What support channel will launch first?

Product and operations:

- What is inside each pod: seeds, grow medium, nutrients, or all three?
- Are nutrients included in the pod, water tank, or handled another way?
- What materials are pods made from, and are they accepted by Indian recycling systems?
- What is the water tank capacity?
- What cleaning frequency is required?
- What electrical safety certifications are required for India?
- Are seed, plant, food, or pod sales subject to India-specific regulations?
- Is the target hardware price 50-200 USD, INR equivalent, or another currency strategy?

## 14. Definition Of Done

A task is done only when:

- It follows the PRD and design brief.
- It does not add out-of-scope MVP features.
- It preserves prototype-stage uncertainty.
- It avoids unsupported claims.
- It updates `tasks/todo.md` when it changes active work.
- It includes relevant tests or clearly states why tests could not be run.
- It passes configured lint, test, type-check, and build steps where available.
- It documents any remaining blockers or open questions.

For implementation tasks, also verify:

- The app still launches.
- No notification permission is requested.
- One-device MVP behavior is preserved.
- External commerce remains external.
- Dashboard status can be mocked until hardware status is finalized.
