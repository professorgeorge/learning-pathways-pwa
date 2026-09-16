# Pathways: Individually Customized Learning Pathways (PWA & Developer Framework)

> **Concept Prototype**  
> Conceived and developed by **[Professor Babu George](https://www.linkedin.com/in/beingbabu/)**.

---

## 1. Overview and Educational Philosophy

Universal Design for Learning (UDL) emphasizes providing learners with multiple means of representation, expression, and engagement. **Pathways** is a developer framework and installable Progressive Web App (PWA) designed to craft individually customized learning pathways for students for any set of learning objectives.

Unlike obsolete learning-style frameworks that arbitrarily classify students into fixed modalities (e.g. visual, auditory, or kinesthetic), Pathways personalizes instruction based entirely on real, multidimensional **learner conditions**:
- **Access Needs:** Text sizing, speech-synthesis audio support, reading load, and media captions.
- **Prior Knowledge:** Self-reported familiarity and mastery prerequisites per topic.
- **Metacognitive Strategies:** Frequency of goal-setting, self-testing without notes, and monitoring.
- **Context Constraints:** Primary study device (phone vs. laptop) and continuous focus window.
- **Empirical Evidence:** Rolling retrieval accuracy, hint usage rates, and observed preceding modalities.

### Core Pedagogy Principles
1. **UDL First, Personalization Second:** Adaptation *orders, highlights, and scaffolds*; it never locks out or hides alternative representations.
2. **Conditions, Not Types:** Never pigeonhole students into modality silos. All formats remain accessible in the interactive UDL Format Tray.
3. **Survey Starts, Performance Overwrites:** Initial intake serves as a prior; real-time retrieval performance and hint rates update the live evidence overlay.
4. **Rules Before Models:** Deterministic adaptation is the primary source of truth.
5. **Student Client is a Safe Surface:** The PWA contains zero artificial intelligence keys, zero prompts, and zero vendor SDKs.

---

## 2. System Architecture & Security Boundary

```
┌─────────────────────────────────────────────────────────────┐
│                 Installable Student PWA                     │
│  • Responsive / Mobile-first UI (Vanilla CSS + HTML/JS)     │
│  • Service Worker (sw.js: offline cache & app shell)        │
│  • IndexedDB (offline_store.js: answers & telemetry queue)  │
│  • Generic <BlockSwitch> & UDL <FormatTray>                 │
│  • On-device accessible speech synthesis reader             │
│  • Zero LLM keys · Zero vendor SDKs · Zero student chat     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (Scoped student session)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend-for-Frontend (BFF) Server              │
│  • Deterministic Adaptation Orchestrator (Rules first)      │
│  • Learner Profile & Evidence Overlay Engine                │
│  • Idempotent Telemetry Event Ingestion                     │
│  • Public API: /api/profiles, /api/activities, /api/progress│
│  • Immediate 404/403 block on direct student calls to /ai/* │
└──────────────────────────────┬──────────────────────────────┘
                               │ Internal Server-Only Bus
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Server-Only Isolated AI Adapter                │
│  • Gated by AI_ENABLED flag; strictly internal              │
│  • Strips all student PII (no names, emails, student IDs)   │
│  • Schema-validated draft variants for human review         │
│  • Audit logging with de-identified records only            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Getting Started with GitHub Desktop

This repository is pre-configured and ready to be opened directly in **GitHub Desktop**:

### Step 1: Clone or Add Local Repository in GitHub Desktop
1. Open **GitHub Desktop**.
2. Click **File** > **Add Local Repository...** (or press `Ctrl + O`).
3. Browse to and select this folder:
   ```
   learning-pathways-pwa
   ```
4. Click **Add Repository**.
5. Click **Publish repository** to push it to your GitHub account.

### Step 2: Install Dependencies & Launch
Make sure [Node.js](https://nodejs.org/) (version 18 or later) is installed on your computer.

Open your terminal or command prompt inside the project folder and run:
```bash
# Install dependencies
npm install

# Launch the server
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 4. Key Application Features

- **Four-Step Learner Conditions Intake (`/intake`):** Interactive intake for access needs, prior knowledge, metacognitive strategy frequencies (Likert scale), and engagement start ordering.
- **Adaptive Daily Pathway (`/today`):** Daily recommendation driven by the deterministic orchestrator, reflecting active adaptations and focus constraints.
- **Lesson Player (`/activity/:id`):** Multi-modal lesson renderer with worked examples, diagrams, plain and standard explanations, and the UDL Format Tray.
- **Retrieval Practice Gym (`/practice`):** Dedicated spaced retrieval practice with hints and immediate explanatory feedback.
- **Objective-Based Mastery (`/progress`):** Progress dashboard tracking mastery per learning objective without learning-style labels.
- **Accessibility & Settings (`/settings`):** Larger text toggle, high-contrast mode, device speech-synthesis reader, offline queue inspection, and FERPA notice.
- **Instructor & Operator Portal (`/instructor`):** Cohort telemetry review (retrieval accuracy, hint rate, UDL tray utilization) and supervised server-side AI variant drafting.

---

## 5. Automated Verification Suite

Run the full automated test suite with Vitest:
```bash
npm test
```

### Verified Test Cases:
- **`orchestrator.test.js`:** Validates all 5 rule policies (novice scaffolding, reading load selection, difficulty advancement on high accuracy, phone micro-chunking, and hint-rate scaffold).
- **`udl_envelope.test.js`:** Contract tests guaranteeing that every activity payload includes at least 1 explanation, 1 complementary representation, 2 retrieval items, and 1 transfer item.
- **`security.test.js`:** Verifies AI adapter isolation, feature flagging, and scans client bundles for forbidden API key patterns.
- **`em_dash_audit.test.js`:** Rigorously verifies that zero em dashes exist in any user-facing code or interface copy.

---

## 6. Project Structure

```
learning-pathways-pwa/
├── package.json               # Scripts and dependencies
├── .gitignore                 # Excludes node_modules and transient files
├── README.md                  # Project overview and attribution
├── index.html                 # PWA HTML shell
├── public/
│   ├── manifest.webmanifest   # PWA manifest
│   ├── sw.js                  # Service worker for offline caching
│   └── icons/                 # 192px and 512px SVG icons
├── server/
│   ├── index.js               # Express BFF API server
│   ├── config.js              # Server configuration and feature flags
│   ├── data/
│   │   ├── courses.json       # Course curriculum & objectives
│   │   └── learning_objects.json # Multi-format UDL learning blocks
│   ├── services/
│   │   ├── orchestrator.js    # Deterministic adaptation rule engine
│   │   ├── profile.js         # Profile store & evidence merger
│   │   ├── telemetry.js       # Idempotent event engine & mastery tracking
│   │   └── ai_adapter.js      # Server-only isolated AI adapter
│   └── tests/                 # Automated test suite
└── src/
    ├── main.js                # App entry point & client router
    ├── styles/                # Modern glassmorphism & accessibility CSS
    ├── db/                    # IndexedDB offline store & event queue
    ├── api/                   # Client API with offline retry
    ├── components/            # UI components (BlockSwitch, FormatTray, etc.)
    └── views/                 # Application views (Home, Intake, Today, etc.)
```

---

## 7. Legal Disclaimer & Terms of Use

<small>
<strong>Legal Disclaimer:</strong> This software is an experimental academic, research, and educational concept prototype provided on an "as-is" and "as-available" basis without warranties or conditions of any kind, whether express, implied, statutory, or otherwise, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, or non-infringement. In no event shall the author, creator (Professor Babu George), developers, contributors, or affiliated institutions be held responsible or liable for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages, or for any losses (including but not limited to loss of data, loss of profits, system downtime, equipment failure, academic standing, or goodwill) arising out of or in connection with the access, deployment, use, reliance upon, or inability to use this software, its algorithms, or its content, even if advised of the possibility of such damages. Use of this prototype is entirely at your own risk.
</small>
