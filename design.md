# Agrinexus Android App Design Source Of Truth

Date: 2026-06-26
Status: MVP design direction, ready for wireframes and app implementation
Primary source: `outputs/agrinexus-app-prd-v2.md`
Companion source: `outputs/agrinexus-app-development-plan.md`
Product: Agrinexus Android companion app for one countertop hydroponic device

## 1. Design Read

Reading this as: a native Android companion app for a playful kitchen-appliance brand in India, built for health-conscious and environment-conscious home users who want fresh herbs and small greens without managing a technical gardening system.

Design dials:

- `DESIGN_VARIANCE: 6`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 5`

Why:

- This is not a landing page or a farm dashboard. It is a companion app for a physical countertop appliance.
- The app should feel fresh, tactile, and easy to trust.
- Setup and QR pairing need clarity before delight.
- Daily use should be passive and calm, because the product promise is low effort.
- Motion should communicate feedback and state change, not attract attention for its own sake.

How to use this file:

- Product and design agents should treat this as the app design source of truth.
- Engineering agents should use this to create theme tokens, navigation, reusable components, and screen contracts.
- Copy agents should use the voice and claim-safety sections before writing app copy.
- Future agents should load only the sections needed for the decision they are making.

## 2. Source Of Truth Map

Always-needed context:

- `outputs/agrinexus-app-prd-v2.md`: product scope, user stories, requirements, metrics, risks, and open questions.
- `outputs/design.md`: app design system, UX rules, screen contracts, and design verification.
- `outputs/agrinexus-app-development-plan.md`: build sequence, architecture assumptions, and implementation guardrails.
- `AGENTS.md`: agent workflow rules and project boundaries.
- `tasks/todo.md`: current sprint state and open decisions.

Retrieve only when relevant:

- Earlier PRD drafts.
- Landing page files.
- Skill installation history.
- Zip packaging history.
- Broad market research.

Do not use old notes to override PRD v2 unless the user explicitly updates the project direction.

## 3. Product Context

Agrinexus is a home hydroponics brand at prototype stage. The product is an aesthetic countertop system that grows herbs and small greens from recyclable pods, similar in simplicity to a pod-based kitchen appliance.

The app exists to help a new owner:

- Create an account.
- Pair one Agrinexus device by QR code.
- Complete first setup.
- Add water.
- Insert a pod.
- Choose a plant.
- Passively check garden status when opening the app.
- Find external pod purchase and refill links.
- Learn routine care.
- Get support.

The app does not exist to increase engagement for its own sake. Success is not "more screen time." Success is fewer confused users, higher setup completion, successful pairing, and fewer support requests caused by unclear instructions.

## 4. MVP Boundaries

MVP includes:

- Android app only.
- Account creation and sign in.
- One QR-paired device per account.
- Guided setup flow.
- One active plant cycle.
- Passive Garden dashboard.
- Status on app open for water, light, pH, pod age, harvest window, and last updated time when data exists.
- Pods and Refills area with external links.
- Learn area for routine care.
- Support area with setup, QR, pod, water, device, cleaning, and contact help.

MVP does not include:

- Push notifications.
- Care reminders.
- App alerts.
- Notification permission prompts.
- Native checkout.
- iOS app.
- Multi-device support.
- AI plant diagnosis.
- Advanced device controls.
- Automated nutrient dosing claims.
- Claims that the app or product is organic, pesticide-free, zero waste, no maintenance, or proven to save water.

Design implication:

- Do not design notification settings.
- Do not design reminder schedules.
- Do not design cart, payment, or order history flows.
- Do not design multi-device switchers.
- Do not design crop performance charts unless the status contract requires them later.

## 5. Core UX Promise

The user should feel:

- "I know what to do next."
- "This device is easy to start."
- "The app is calm and honest."
- "I can get help without digging."
- "The brand feels playful, but not careless."

The app should avoid making the user feel:

- Watched by a technical system.
- Responsible for lab-style tuning.
- Pressured by alerts.
- Sold to before they understand the device.
- Misled by broad health or sustainability claims.

## 6. Product Design Principles

### 6.1 Kitchen-Native Clarity

Use words that belong in a kitchen and home routine.

Use:

- Garden
- Pod
- Water
- Light
- Harvest
- Refills
- Clean tank
- Start growing

Avoid:

- Telemetry
- Hydroponic protocol
- Nutrient optimization
- Crop management
- pH calibration journey
- Yield engine

### 6.2 One Next Action

Every onboarding and setup screen should have one dominant action. If a user has to decide between three equal actions during setup, the design is doing too much.

Examples:

- Create My Account
- Scan Code
- Add Water
- Insert Pod
- Choose Plant
- Start Growing

### 6.3 Passive Status, Not Alarm Behavior

The dashboard may show status when opened. It must not behave like a care reminder system.

Allowed:

- Status tile shows "Check water" when opened.
- Last updated time explains data freshness.
- Support shortcut appears near a problem state.
- Inline explanation clarifies unavailable status.

Not allowed:

- Push notification.
- Reminder schedule.
- Care alert inbox.
- Notification permission screen.
- Alarm-style language.

### 6.4 Claim-Safe Delight

The brand may be playful, but claims must stay honest because the product is at prototype stage.

Use:

- Fresh herbs and small greens.
- Low-maintenance indoor growing.
- Minimal upkeep.
- Recyclable pods.
- Designed for countertop growing.
- Fresh ingredients within reach.

Avoid:

- Organic.
- Pesticide-free.
- Zero waste.
- No maintenance.
- Saves water.
- Grows vegetables.
- Fully autonomous garden.

Exception:

- These claims can appear only in internal risk lists or validation notes, not as customer-facing claims.

### 6.5 Useful Beauty

The app should look designed, but usefulness leads. Product photos, crop imagery, and clear status states matter more than decorative flourishes.

## 7. Information Architecture

Pre-setup flow:

1. Welcome
2. Account creation or sign in
3. QR pairing
4. Guided setup
5. Choose plant
6. Setup complete
7. Garden dashboard

Post-setup top-level navigation:

- Garden
- Pods
- Learn
- Support

Account and settings:

- Available from top-right account entry or settings area.
- Do not make Account a bottom tab unless account tasks become frequent.

State routing:

- No session -> Welcome or Sign In.
- Signed in, no paired device -> Pair Device.
- Paired, setup incomplete -> Continue Setup.
- Paired, setup complete -> Garden.
- Status unavailable -> Garden with unavailable state and support path.
- External links missing -> Pods with coming-soon state.

Navigation rules:

- Onboarding should not show bottom navigation.
- Bottom navigation appears only after setup is complete.
- Android back behavior must be predictable.
- Do not silently reset setup progress.
- Preserve state when users return from external links.

## 8. Screen Contracts

Each screen below defines the job, content, primary action, required states, and design risks.

### 8.1 Welcome

Job:

- Introduce Agrinexus and move the user into account creation or sign in.

Primary action:

- Create My Account

Secondary action:

- Sign In

Content:

- One short headline.
- One product or crop visual.
- Short supporting line focused on fresh herbs and small greens.

States:

- First open.
- Returning signed-out user.
- Legal links unavailable before release should be blocked before launch, not hidden.

Design risks:

- Do not overexplain hydroponics.
- Do not use unsupported sustainability or health claims.
- Do not make the welcome screen feel like a marketing landing page.

### 8.2 Account Creation And Sign In

Job:

- Let the user create or access the account required for pairing.

Primary action:

- Create Account or Sign In.

Content:

- Email, phone, OTP, password, or provider fields based on the authentication decision.
- Privacy policy and terms links before release.

Required states:

- Loading.
- Invalid input.
- Existing account.
- OTP or verification failed if applicable.
- Network unavailable.
- Sign-in success.

Design rules:

- Labels above fields.
- No placeholder-only labels.
- Error near the field or action that caused it.
- Clear recovery path.
- Do not collect optional profile fields unless needed for support.

Open decision:

- Authentication method is not finalized.

### 8.3 QR Pairing

Job:

- Link one Agrinexus device to the user's account.

Primary action:

- Scan Code

Content:

- Camera scanner area.
- Short instruction explaining where the code is located on the device.
- Manual code fallback only if hardware supports it.

Required states:

- Camera permission prompt.
- Camera permission denied.
- Scan in progress.
- Valid Agrinexus QR.
- Invalid QR.
- Already paired device.
- User already has one paired device.
- Network unavailable.
- Manual fallback unavailable.

Design rules:

- Avoid technical language like "register payload" or "bind serial."
- Explain failure without blaming the user.
- Do not show raw QR secret, token, or internal device ID.
- Do not allow second-device pairing in MVP.

Open decision:

- QR payload and pairing API contract are not finalized.

### 8.4 Guided Setup

Job:

- Help the user start the first pod with confidence.

Flow:

1. Place device.
2. Add water.
3. Insert pod.
4. Choose plant.
5. Start growing.

Primary action:

- Specific action per step.

Required states:

- Setup not started.
- Step complete.
- Resume setup.
- Setup blocked by missing device state if applicable.
- Setup complete.

Design rules:

- One task per screen.
- Progress visible but quiet.
- Use the task name as the label, not generic "Step 1."
- Save progress if the app closes.
- Use visuals only when they reduce confusion.

Design risk:

- Do not make setup feel like a technical checklist.

### 8.5 Choose Plant

Job:

- Let the user select the active plant type for the first pod cycle.

MVP crop groups:

- Herbs.
- Lettuce.
- Microgreens.
- Strawberries, only if validated for launch.

Primary action:

- Start Growing

Required states:

- Plant available.
- Plant unavailable.
- Plant selected.
- Harvest window unknown.
- Catalog unavailable.

Design rules:

- Use real crop photos or high-quality generated placeholders with replacement notes.
- Do not show fake harvest windows.
- If strawberries are not validated, omit them or mark as not available yet.

Open decision:

- Launch plant catalog and harvest windows are not finalized.

### 8.6 Garden Dashboard

Job:

- Let the user passively check the current garden state when opening the app.

Content hierarchy:

1. Active plant.
2. Plain-language growth or pod context.
3. Next useful action, only when there is one.
4. Status tiles for water, light, pH, pod age, and harvest.
5. Last updated time.
6. Support shortcut.

Required modules:

- Active plant.
- Pod age.
- Harvest window.
- Water status.
- Light status.
- pH status.
- Last updated time.

Required states:

- Ready.
- Needs water check.
- pH status needs attention.
- Status unavailable.
- Status stale.
- No active plant.
- Setup incomplete.
- Network unavailable.

Design rules:

- Use plain status labels before raw sensor values.
- Show raw values only if the status model requires them.
- Do not rely on color alone.
- Do not turn dashboard status into alerts or reminders.
- Use semantic status color only when it communicates state.
- Keep the dashboard calmer than a data analytics screen.

Example labels:

- Water looks good.
- Check water.
- Light is on schedule.
- pH looks steady.
- Updated just now.
- Status unavailable.

Design risk:

- A dashboard full of charts will make the product feel harder than promised.

### 8.7 Pods And Refills

Job:

- Help users find replacement pods and refill options without building native checkout.

Primary actions:

- Find Pods
- Explore Refills

Required states:

- One-time marketplace link available.
- Subscription link available.
- Link missing.
- External destination opening.
- External destination failed.

Design rules:

- Clearly indicate when the user is leaving the app.
- Do not create cart, checkout, payment, order history, or subscription management in MVP.
- If links are not ready, show coming-soon state.
- Do not imply a native marketplace exists.

Open decisions:

- Marketplace URL.
- Subscription URL.

### 8.8 Learn

Job:

- Teach routine care in short, practical chunks.

Content groups:

- Getting started.
- Refilling water.
- Replacing pods.
- Harvesting.
- Cleaning the tank.

Required states:

- Content available.
- Content unavailable.
- Offline or network unavailable if content is remote.

Design rules:

- Use task-first titles.
- Keep articles short.
- Use visuals where placement or sequence matters.
- Do not bury support behind long education content.

Example titles:

- Fill the tank to the marked line.
- Pop in a new pod.
- Harvest without pulling the pod.
- Clean the tank between cycles.

### 8.9 Support

Job:

- Help users recover from setup, QR, pod, water, device, and cleaning issues.

Primary actions:

- Browse Help
- Contact Support

Required topics:

- Setup help.
- QR pairing help.
- Pod help.
- Water help.
- Device help.
- Cleaning help.
- Contact route.

Required states:

- Support topics loaded.
- Contact channel available.
- Contact channel unavailable.
- Network unavailable.

Design rules:

- Setup help must be reachable within two taps.
- Pairing help should be linked from the QR screen.
- Contact channel should match the launch decision, such as WhatsApp, email, phone, form, or external link.
- Do not invent a support channel before it is chosen.

Open decision:

- MVP support channel is not finalized.

### 8.10 Account And Settings

Job:

- Let users manage account basics and see app/legal information.

MVP items:

- Profile basics if required.
- Paired device summary.
- Sign out.
- Privacy policy.
- Terms.
- App version.

Design rules:

- Keep Account secondary.
- Separate destructive or sensitive actions.
- Do not include notification settings in MVP.
- Do not include multi-device management in MVP.

## 9. Visual System

### 9.1 Design System Foundation

Recommended foundation:

- Native Android with Kotlin and Jetpack Compose using Material 3 principles.

If React Native is chosen:

- Keep a Material-informed Android experience.
- Use one native-feeling component library.
- Do not mix web-style UI kits with native mobile patterns.

System rules:

- One component family.
- One icon family.
- One accent color.
- Token-driven theming.
- Light and dark mode support.
- Native Android permission, sheet, back, and input behavior.

### 9.2 Visual Feel

Agrinexus should feel:

- Fresh.
- Clean.
- Tactile.
- Bright.
- Calm.
- Playful in small moments.
- Trustworthy during setup and status.

Avoid:

- Dark agritech dashboard.
- Beige luxury kitchen default.
- Neon green tech interface.
- Purple AI gradient language.
- Stock wellness app tropes.
- Decorative blobs, orbs, and random abstract shapes.

### 9.3 Color Tokens

Use semantic tokens. Do not scatter raw hex values through screens.

Light mode:

- `surface`: `#F7FAF6`
- `surface_elevated`: `#FFFFFF`
- `surface_soft`: `#EAF3EC`
- `text_primary`: `#17211B`
- `text_secondary`: `#536157`
- `border_subtle`: `#D8E4DA`
- `brand_primary`: `#1F7A4D`
- `brand_primary_pressed`: `#165E3A`
- `brand_on_primary`: `#FFFFFF`

Dark mode:

- `surface`: `#0F1612`
- `surface_elevated`: `#162019`
- `surface_soft`: `#1D2B22`
- `text_primary`: `#F1F6F0`
- `text_secondary`: `#AAB8AD`
- `border_subtle`: `#2A3A30`
- `brand_primary`: `#6DDBA0`
- `brand_primary_pressed`: `#8BE5B5`
- `brand_on_primary`: `#082014`

Semantic status:

- `status_ready`: brand primary.
- `status_waiting`: `#C27A20`.
- `status_attention`: `#B5433D`.
- `status_info`: `#3867D6`.
- `status_neutral`: text secondary.

Color rules:

- Colored dots are allowed only when they communicate real state.
- Functional color must be paired with icon or text.
- Test contrast in both modes.
- Status colors should not overpower the brand.

### 9.4 Typography

Recommended production font:

- Android system sans or Roboto.

Optional brand display font:

- Outfit or Satoshi for limited display moments, only if bundled correctly.

Avoid:

- Serif display type.
- All-caps section labels throughout the app.
- Tiny captions as primary content.
- Decorative mono labels.

Type scale guidance:

- Screen title: 28 to 32 px.
- Section title: 20 to 24 px.
- Body: 16 px.
- Secondary text: 14 px.
- Caption or status meta: 12 to 13 px, used sparingly.
- Button label: 15 to 16 px.

Rules:

- Body copy should remain readable at larger Android font sizes.
- Onboarding copy should usually stay within 2 to 3 lines.
- Long help content belongs in Learn or Support, not setup screens.

### 9.5 Shape And Spacing

Shape:

- Primary buttons: pill radius.
- Cards and tiles: 8 px radius.
- Inputs: 8 px radius.
- Device image masks: 16 px radius.
- Bottom sheets and modals: 24 px top radius.

Spacing:

- Screen edge padding: 20 px.
- Compact row gap: 8 px.
- Standard section gap: 16 px.
- Large group gap: 24 px.
- Screen section gap: 32 px.

Rules:

- Do not nest cards inside cards.
- Keep fixed bottom navigation clear of system gesture areas.
- Reserve stable dimensions for QR scanner, status tiles, and plant cards.
- Button text must fit without wrapping.

### 9.6 Iconography

Use one icon family only.

Recommended style:

- Rounded line icons.
- Consistent stroke.
- Simple forms for plant, water, light, QR, pod, support, account, harvest, and external link.

Rules:

- Do not use emoji as structural icons.
- Icon-only buttons need accessible labels and adequate hit area.
- Icons support scanning but cannot replace text for critical status.

## 10. Component Contracts

### 10.1 Buttons

Primary:

- Filled brand color.
- High-contrast label.
- Used once per screen for the main action.

Secondary:

- Subtle surface or text style.
- Used for alternate route such as Sign In or Learn More.

Destructive:

- Use attention color.
- Spatially separated from normal actions.

States:

- Default.
- Pressed.
- Loading.
- Disabled.
- Focused.

Rules:

- Minimum touch target: 48 x 48 dp.
- Labels should be specific and short.
- Do not use "Submit" unless the form truly submits a generic request.

### 10.2 Inputs

Required structure:

- Label above field.
- Field.
- Helper text when needed.
- Error text near the field.

States:

- Default.
- Focused.
- Filled.
- Error.
- Disabled.
- Loading or verifying.

Rules:

- Use semantic keyboard types.
- Do not use placeholder-only labels.
- Keep input height touch-friendly.

### 10.3 Status Tiles

Use for:

- Water.
- Light.
- pH.
- Pod age.
- Harvest.

Each tile includes:

- Icon.
- Plain label.
- Short status text.
- Optional timestamp or context.

Rules:

- Do not show raw values without explanation.
- Do not use progress tracks for every metric.
- Do not use color as the only status signal.
- Keep tiles stable in size across status changes.

### 10.4 Plant Cards

Use for:

- Choosing a plant.
- Displaying active plant context.

Each card includes:

- Plant image.
- Plant name.
- Availability state.
- Harvest window if confirmed.

Rules:

- Do not invent growth times.
- Omit unvalidated plants or mark them unavailable.
- Avoid generic leaf icons for all crops.

### 10.5 Bottom Sheets

Use for:

- Confirming external link.
- Explaining unavailable status.
- Choosing support route.
- Confirming new pod cycle if included later.

Rules:

- Do not use sheets for every small message.
- Sheets must have clear dismiss behavior.
- Bottom sheet actions must be reachable above gesture areas.

### 10.6 Empty, Loading, And Error States

Every core screen needs non-happy states.

Required states:

- No account session.
- No paired device.
- Camera permission denied.
- QR scan failed.
- Device already paired.
- Setup incomplete.
- Catalog unavailable.
- Status unavailable.
- Status stale.
- Marketplace link unavailable.
- Support channel unavailable.
- Network unavailable.

Tone:

- Calm.
- Brief.
- No blame.
- Clear next action.

Example:

"We could not read that code. Try scanning again or enter the code manually."

## 11. Content Strategy

### 11.1 Voice

Agrinexus voice:

- Playful but practical.
- Warm but not cute.
- Simple but not generic.
- Honest about the prototype stage.
- Focused on fresh ingredients, not inflated health claims.

### 11.2 Copy Rules

Use:

- "Scan the code on your Agrinexus."
- "Fill the tank to the marked line."
- "Pop in your pod."
- "What are you growing first?"
- "Your garden is growing."
- "Find pods for your next round."
- "Check water."
- "Status unavailable."

Avoid:

- "Proceed."
- "Submit."
- "Hydroponic optimization started."
- "No maintenance required."
- "Grow pesticide-free organic vegetables."
- "Zero-waste garden."
- "Saves water."

### 11.3 CTA Dictionary

Preferred labels:

- Create My Account
- Sign In
- Scan Code
- Add Water
- Insert Pod
- Choose Plant
- Start Growing
- View Garden
- Find Pods
- Explore Refills
- Learn Care
- Contact Support
- Try Again

Avoid duplicate intent:

- Do not use "Get Started," "Start," "Begin," and "Continue" interchangeably for the same action.
- Use one label per action type so the app feels consistent.

### 11.4 Claim-Safe Copy Substitutions

Instead of "no maintenance":

- Use "minimal upkeep" or "low-maintenance."

Instead of "organic":

- Use "fresh herbs and small greens."

Instead of "pesticide-free":

- Use "grown at home from Agrinexus pods" only if accurate.

Instead of "zero waste":

- Use "recyclable pods" only if recycling route and material claims are validated.

Instead of "saves water":

- Use "designed for efficient indoor growing" unless water savings are measured and approved.

Instead of "grows vegetables":

- Use "grows herbs and small greens" unless launch crop validation supports broader vegetables.

## 12. Motion And Feedback

Motion intensity: 3.

Allowed:

- Button press feedback.
- QR scan success transition.
- Setup step completion check.
- Dashboard refresh skeleton.
- Bottom sheet open and close.
- Small plant progress transition.

Avoid:

- Infinite animations.
- Confetti.
- Parallax.
- Animated gradients.
- Decorative loading loops.
- Motion that blocks input.

Rules:

- Prefer 150 to 300 ms UI transitions.
- Respect reduced motion.
- Use motion to show cause and effect.
- Avoid layout-shifting animation.

## 13. Accessibility And Mobile Quality

Required:

- Touch targets at least 48 x 48 dp on Android.
- Body text at least 16 px equivalent.
- WCAG AA contrast for normal text and controls.
- Color is never the only status indicator.
- Meaningful labels for icon-only controls.
- Logical screen-reader order.
- Dynamic text sizing without layout breakage.
- Reduced motion support.
- Safe-area and system bar clearance.
- Offline and network failure messaging.

QR pairing:

- Camera permission denial must have a recovery path.
- Manual fallback should exist only if hardware supports manual codes.
- Pairing errors must not expose secrets or internal tokens.

External links:

- Make it clear when the user is leaving the app.
- Return behavior should be predictable.

## 14. Asset Strategy

Priority order:

1. Real Agrinexus product photography.
2. Real tested crop photography.
3. Generated placeholder assets with clear replacement notes.
4. Simple icon states when images do not help.

Needed assets:

- Product on a kitchen counter.
- QR code location on the device.
- Add water visual.
- Insert pod visual.
- Herbs image.
- Lettuce image.
- Microgreens image.
- Strawberry image only if validated.
- Cleaning visual.
- Support empty state visual.

Avoid:

- Generic stock kitchens without the product.
- Fake app screenshots.
- Decorative abstract blobs.
- Photos with text baked into the image.
- Images implying crops or claims not supported by the launch product.

## 15. Data And Status Model Design Notes

The app should be ready for either real device data or prototype mock data.

Recommended display model:

- `waterStatus`: ready, check, unavailable, stale.
- `lightStatus`: on_schedule, unavailable, stale.
- `phStatus`: steady, check, unavailable, stale.
- `podAgeDays`: number or unavailable.
- `harvestWindow`: date range or unavailable.
- `lastUpdatedAt`: timestamp or unavailable.

Design rules:

- Use simplified states for users.
- Keep raw data behind expandable detail only if required.
- Show unavailable and stale states gracefully.
- Do not fake precision.
- Do not imply live monitoring if status only updates when available through the confirmed data path.

Open decision:

- Hardware-to-app status path is not finalized.

## 16. Design Roadmap

This roadmap is a plan for design readiness, not a fixed calendar commitment.

### Now: Sprint 0 Design Decisions

Outcome:

- Remove ambiguity before UI implementation.

Design work:

- Confirm app stack: native Android with Jetpack Compose or React Native.
- Confirm auth method.
- Confirm QR payload and pairing error states.
- Confirm device status model.
- Confirm launch plant catalog and harvest windows.
- Confirm external marketplace and subscription URLs.
- Confirm support channel.
- Confirm privacy policy and terms URLs.
- Create low-fidelity flow map for onboarding and Garden.

Design acceptance:

- No agent or developer has to guess the setup flow, status model, or support path.

### Next: App Foundation

Outcome:

- Create the stable app shell and reusable design system.

Design work:

- Convert tokens into app theme.
- Define navigation shell.
- Define reusable buttons, inputs, tiles, plant cards, sheets, empty states, loading states, and error states.
- Create wireframes for Welcome, Auth, QR, Setup, Garden, Pods, Learn, Support, and Account.
- Confirm dark mode behavior.

Design acceptance:

- The app can be built screen by screen without rethinking the visual system.

### Next: Onboarding And Pairing

Outcome:

- Make first-use setup understandable and recoverable.

Design work:

- Finalize account screens.
- Finalize QR scanner and permission states.
- Finalize invalid QR, already paired, and one-device-limit states.
- Finalize setup step screens.
- Finalize choose plant state.

Design acceptance:

- A first-time user can understand every setup step without support.

### Next: Garden And Ownership Loop

Outcome:

- Make post-setup status calm, useful, and passive.

Design work:

- Finalize Garden dashboard.
- Finalize status unavailable and stale states.
- Finalize pod age and harvest window presentation.
- Finalize support shortcut behavior.

Design acceptance:

- Dashboard communicates useful state without behaving like an alert system.

### Later: Commerce, Localization, And Expansion

Outcome:

- Extend only after MVP proof.

Candidate future work:

- Native checkout.
- Refill subscription management.
- Multi-device support.
- iOS app.
- Hindi or regional language support.
- More plant catalog depth.
- Care history.
- Warranty and device diagnostics.
- AI help or diagnosis, only after app fundamentals and data quality are proven.

Rules:

- Later items must not leak into MVP navigation or component design.
- Future slots can be noted in architecture, but not exposed to users unless launch-ready.

## 17. Context Engineering Rules For Future Agents

Before any app design or implementation task, answer:

- What decision am I making?
- Which source file supports that decision?
- What context can I retrieve instead of keeping in the working prompt?
- What would fail if I excluded this context?
- Is missing information a true blocker or an assumption that can be labeled?

Context boundaries:

- For screen design, load this file plus the relevant PRD user story.
- For build sequencing, load the development plan plus the relevant screen contract.
- For copy, load the Content Strategy section plus PRD claim constraints.
- For implementation, load this file, the development plan, and the current `tasks/todo.md` item.
- For broad strategy, load PRD v2 and the open questions section.

Do not:

- Paste every historical artifact into a task.
- Let earlier landing page copy override app copy constraints.
- Let speculative future features enter MVP.
- Treat ambiguous hardware status as confirmed product behavior.

When research gets messy:

- Research.
- Compress into a clear plan or source-of-truth update.
- Reset working context.
- Implement from the compressed plan.

## 18. Implementation Guardrails

Follow these while converting design into app code:

- Make the smallest implementation that satisfies the screen contract.
- Keep business logic separate from UI.
- Keep external services behind mockable repositories.
- Do not let UI depend directly on hardware details.
- Do not introduce features outside MVP.
- Match the established app theme instead of creating one-off screen styles.
- Add loading, empty, error, and permission states as part of the feature, not later polish.
- Verify every screen against PRD acceptance criteria.

Recommended component build order:

1. Theme tokens.
2. App navigation shell.
3. Buttons and text primitives.
4. Inputs and form feedback.
5. Empty, loading, and error patterns.
6. QR scanner shell and permission states.
7. Setup step template.
8. Status tile.
9. Plant card.
10. External link sheet.

## 19. Open Design Decisions

These decisions block final design or implementation details:

- App stack: Kotlin and Jetpack Compose or React Native.
- Authentication method.
- QR payload and pairing API contract.
- Manual pairing fallback support.
- Device status data path.
- Status value format: real sensor data, simplified states, or prototype mocks.
- Launch plant catalog.
- Approved harvest windows.
- External marketplace URL.
- External subscription URL.
- Support channel.
- Privacy policy URL.
- Terms URL.
- Launch languages.
- Product photography availability.
- Crop photography availability.

## 20. Preflight Checklist

Before shipping any Agrinexus app UI:

- PRD v2 scope is followed.
- One design system is used.
- Android patterns are respected.
- No push notifications, reminders, or app alerts exist in MVP.
- No notification permission prompt exists.
- No native checkout exists.
- No multi-device UI exists.
- One-device limit is visible in pairing behavior.
- Buttons meet 48 x 48 dp touch targets.
- Button labels do not wrap.
- Inputs use visible labels.
- Errors have recovery paths.
- Empty states are designed.
- Loading states are designed.
- QR permission-denied state is designed.
- External link leaving-app behavior is clear.
- Status unavailable and stale states are designed.
- Color is not the only status indicator.
- Dark mode is considered.
- Reduced motion is respected.
- Dynamic text sizing does not break layouts.
- No unsupported claims appear in user-facing copy.
- No fake precise numbers appear.
- No generic stock visuals imply a product that is not shown.
- No decorative status dots are used.
- No generic "Step 1" labels drive the setup flow.
- Garden dashboard remains passive.

## 21. Definition Of Design Done

The Agrinexus MVP design is done when:

- Every MVP screen has a wireframe or implementation-ready contract.
- Every screen has happy, loading, empty, error, and blocked states where applicable.
- The design system has tokens for color, type, shape, spacing, motion, and status.
- The onboarding flow can be tested with a first-time user.
- QR pairing failure states are testable.
- The Garden dashboard works with mock status data, unavailable data, and stale data.
- Pods and Refills can handle ready links and missing links.
- Learn and Support cover the user tasks in the PRD.
- Copy passes the claim-safety checklist.
- Accessibility checks pass for touch, contrast, labels, dynamic text, and reduced motion.
- Open decisions are either resolved or clearly marked as assumptions.

