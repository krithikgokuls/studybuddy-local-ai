# StudyBuddy – AI Companion for My Friend

StudyBuddy is a polished, highly responsive, privacy-first AI study companion built specifically to help students and friends prepare for exams and certifications (like the Cisco CCNA) with less stress and absolute confidence. 

Designed around **open-weight/open-source AI models** (such as Llama 3.2), the application maintains a strict **Offline-First / Local AI** ethos. Study materials never leave your device unless you explicitly opt to route them through custom local servers.

---

## 🚀 Key Features

1. **Dashboard**: Comprehensive overview of study streaks, daily target goals, mastered modules, and weak diagnostics.
2. **Materials Hub**: Upload or paste text/Markdown notes locally with secure local storage containment.
3. **AI Tutor**: Real-time conversational tutoring Grounded strictly in your notes, utilizing simple real-world analogies to break down dry documentation. Includes macro triggers: *Explain Simpler*, *Give me an Example*, and *Test me*.
4. **Quiz Generator**: Synthesize multi-choice knowledge check questions with dynamic grading and diagnostic explanations.
5. **Flashcards**: Cozy tactile memory flashcards leveraging 3D perspective CSS transforms with status-based repetition tracking.
6. **Study Planner**: Auto-generate structured 5-day timelines leading up to your deadline based on daily hours.
7. **Diagnostics**: Process performance metrics across quizzes and cards to map knowledge gaps and generate custom review prompts.

---

## 🛠️ Technical Architecture

- **Frontend**: React + TypeScript powered by Vite.
- **Styling**: Tailwind CSS v4 featuring typographic curves.
- **AI Service Abstraction**: Swappable runtime engine supporting:
  - **Offline Demo Engine**: A keyword-responsive parsing engine running directly inside the client (zero server dependencies).
  - **Local Ollama Integration**: Query your own locally served open-weight models (like Llama 3.2) over native REST APIs.
- **Data Persistence**: Browser `localStorage` for complete data containment and client sovereignty.

---

## 💻 Local Setup & Ollama Configuration

To run StudyBuddy with local open-weight AI execution:

1. **Install Ollama**: Download Ollama from [ollama.com](https://ollama.com).
2. **Download Llama 3.2**: Run the following command in your terminal:
   ```bash
   ollama pull llama3.2
   ```
3. **Configure CORS Origins (CRITICAL)**: Browsers enforce strict security filters that block local fetch requests unless CORS is explicitly permitted on the backend engine. Launch Ollama using this environment setting:
   - **Mac/Linux**:
     ```bash
     OLLAMA_ORIGINS="*" ollama serve
     ```
   - **Windows**:
     1. Open System Environment Variables.
     2. Add a new variable: `OLLAMA_ORIGINS` set to `*`.
     3. Restart Ollama from the task bar.
4. **Enable Local Ollama in UI**:
   - Go to **Settings** in the StudyBuddy Top Bar.
   - Switch the Active AI Engine to **Local Ollama (Llama 3.2)**.
   - Save Configuration.

---

## 🌩️ Google Cloud Run Deployment & Campaign Compliance

To deploy StudyBuddy securely to Google Cloud Run while complying with the AI Challenge parameters, execute the following steps:

### 1. Secret Management Bindings (Zero-Hardcoding Hygiene)
If you configure external AI or cloud elements, keep credentials out of code by binding secrets dynamically:

```bash
# Create and populate a Secret Manager secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run compute service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 2. Firestore Security Configuration (User Data Isolation)
If transitioning from localStorage to Firebase, deploy these secure, owner-bound security rules (`firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Deploying to Cloud Run with Campaign Labeling
Build and deploy the service container to Cloud Run. Make sure to apply the mandatory `dev-tutorial` resource label to participate in automated challenge tracking:

```bash
# Build the container locally or via Cloud Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/studybuddy

# Deploy to Cloud Run
gcloud run deploy studybuddy \
  --image gcr.io/YOUR_PROJECT_ID/studybuddy \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --update-labels=dev-tutorial=cloud-run-ai-challenge
```

---

## 🧑‍🤝‍🧑 Educational Walkthrough & Testing Protocol

To verify every interactive pipeline, follow this walkthrough testing protocol:

| Goal State | Action Path | Expected Outcome |
| :--- | :--- | :--- |
| **Simulated Cold Start** | Click the **"Try Demo"** button on the Dashboard. | Loads "Arun" profile, initializes Computer Networks study guides, generates 5-day study timeline, and populates 2 historical quiz records. |
| **Contextual Tutoring** | Navigate to **AI Tutor**, choose the *OSI & Transport Protocols* note, click **"Explain Simpler"**. | AI returns a cozy custom response comparing TCP to a registered letter and UDP to a fast postcard. |
| **Structured Validation** | Navigate to **Quiz**, choose *OSI Model*, Select *Medium*, click **"Generate Practice Quiz"**. | Renders 3 custom questions. Answering reveals instant grading checkmarks and comprehensive diagnostic explanations. |
| **Tactile Active Recall** | Navigate to **Flashcards**, flip the card to see the answer, click **"Need Revision"**. | Flashcard flips with a satisfying 3D rotational translation. Marking "Need Revision" successfully writes to local memory performance logs. |
| **Full Diagnostic Mapping** | Navigate to **Diagnostics**, click **"Run AI Diagnostics"**. | Performs a full analytical sweep over local metrics. Generates custom strong/weak categories and maps two bespoke practice probes. |
| **Full Personalization** | Navigate to **Settings**, change the Friend name to "Sophia", add "Biotech" to subjects, click **"Update Friend Parameters"**. | Footer credit and dashboard welcome message immediately synchronize with Sophia's personalized goal parameters. |

---

*StudyBuddy – Built with passion, powered by open weights, dedicated to the success of students worldwide. 🦉*
