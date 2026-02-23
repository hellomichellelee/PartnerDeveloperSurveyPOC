# Product Requirements Document (PRD)

## Research Feedback Data Collection Platform

---

## 1. Overview

### 1.1 Product Summary

This project introduces a lightweight, scalable platform for collecting **spoken or written open‑text research responses** and storing them for downstream processing.

The platform is a **static web application** built with **VS Code + Azure Speech Services** that handles data ingestion and storage.

> **Note:** Data extraction/transformation and reporting are handled by separate projects.

### 1.2 Problem Statement

Research teams need a reliable, user-friendly way to collect qualitative feedback from participants. The collection process should support both spoken and written responses, with automatic transcription of audio to reduce manual effort.

### 1.3 Goals

- Provide a simple, accessible interface for collecting research feedback.
- Automate transcription of spoken responses using Azure Speech.
- Store raw responses reliably for downstream processing.
- Ensure proper consent collection and compliance.

---

## 2. Users & Use Cases

### 2.1 Users

- **UX Researchers (Primary):** Need to collect feedback from research participants.
- **Research Participants:** Provide spoken or written feedback to survey questions.

### 2.2 Core Use Cases

1. Collect spoken feedback to structured research questions.
2. Automatically transcribe audio to text (Azure Speech).
3. Store raw responses with participant information for downstream processing.

---

## 3. Requirements

### 3.1 Functional Requirements

#### 3.1.1 Data Collection

- Static web app records audio via browser, using Azure Speech.
- Form collects:
  - First Name
  - Last Name
  - Email
  - Consent checkbox (required)
- App supports typed open-text input as alternative to speech.

#### 3.1.2 Data Storage

- Raw data stored in tabular form (Azure SQL or PostgreSQL).
- Each record includes:
  - Participant information
  - Question ID
  - Transcript
  - Timestamp
  - Consent flag

---

## 4. Non‑Functional Requirements

- **Security:** Data stored per Microsoft privacy standards.
- **Performance:** Form submission latency < 3 seconds.
- **Scalability:** Supports 10,000+ responses per study.
- **Accessibility:** Web app should be accessible via modern browsers.

---

## 5. Architecture Overview

### 5.1 Components

1. **Frontend:**
   - Azure Static Web App
   - Azure Speech SDK for recording + transcription

2. **Backend:**
   - Azure SQL/PostgreSQL database
   - Azure Functions (API for data collection)

### 5.2 Data Flow

1. User records audio → Azure Speech transcribes.
2. Raw record saved to database with participant info and consent.

---

## 6. Success Metrics

- ≥90% transcription accuracy (typical Azure Speech performance).
- ≥95% of submissions saved successfully without errors.
- Form completion rate ≥85% of started sessions.

---

## 7. Consent & Compliance Requirements

### 7.1 Consent Capture

Participants must:
- Provide **First Name, Last Name, Email**
- Review consent form
- Check "I agree to the terms and conditions"

### 7.2 Example Consent Language (Draft)

> "By checking this box, I confirm that I have read and agree to the research consent terms. I understand that my audio recordings and written responses will be used for internal UX research purposes."

### 7.3 Compliance Notes

- Azure Speech transcription handles data as submitted and returns results statelessly.
- No data is stored by the transcription service beyond the immediate request.

---

## 8. Open Questions (Resolved)

| Topic | Decision |
|-------|----------|
| Low-code or Copilot refinement | Supported via Azure Functions + VS Code Copilot |
| Participant identity requirements | First name, last name, email, consent checkbox |

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Audio quality affects transcription accuracy | Provide recording guidance, test mic setup |
| Growth of data volume | Database can scale as needed |
| Browser compatibility | Test on major browsers, provide fallback options |

---

## 10. Backlog (Initial)

### MVP

- Build static web app with speech input
- Store raw responses in database
- Consent & identity collection

### Future Enhancements

- Multi-language support
- In‑app participant guidance
- Improved accessibility features
