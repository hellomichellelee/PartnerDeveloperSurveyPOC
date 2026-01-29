# Product Requirements Document (PRD)

## Research Feedback Processing & Insights Platform

---

## 1. Overview

### 1.1 Product Summary

This project introduces a lightweight, scalable platform for collecting **spoken or written open‑text research responses**, automatically processing them for **topic extraction**, **sentiment**, and **structured output**, and presenting results in a **review dashboard** for research teams.

The platform begins as a **static web application** built with **VS Code + Azure Speech Services**, and evolves into an end‑to‑end workflow for ingestion → processing → insights.

### 1.2 Problem Statement

Research teams produce large volumes of qualitative feedback across studies. Manual transcription, coding, sentiment interpretation, and topic grouping are time‑consuming and inconsistent. At scale, this limits the ability to quickly identify patterns and deliver timely insights.

### 1.3 Goals

- Accelerate insight generation for open‑text qualitative research.
- Automate transcription, topic identification, and sentiment classification.
- Provide a clean processed table ready for dashboards and export.
- Reduce manual coding effort by ≥80%.

---

## 2. Users & Use Cases

### 2.1 Users

- **UX Researchers (Primary):** Need fast, consistent topic/sentiment coding.
- **Product Managers / Engineers:** Need quick summaries and distribution patterns.
- **Internal Stakeholders:** Consume dashboard-level insights.

### 2.2 Core Use Cases

1. Collect spoken feedback to structured research questions.
2. Automatically transcribe audio to text (Azure Speech).
3. Detect key topics or phrases in responses.
4. Classify sentiment (Positive / Neutral / Negative).
5. Produce tabular processed data.
6. Review aggregated results in Power BI.

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

#### 3.1.3 Processing Pipeline

- Processing can run via **Azure Function** or **Microsoft Fabric notebook pipeline**.
- Tasks:
  - **Topic extraction** using Azure AI Language **Key Phrase Extraction**
  - **Sentiment analysis** using Azure AI Language Sentiment API
  - Results written back to a *processed_responses* table.

#### 3.1.4 Review Dashboard

- Standalone **Power BI** dashboard for POC.
- Insights shown:
  - Sentiment distribution
  - Topics and frequencies
  - Question-specific trends
  - Filter by participant or question

---

## 4. Non‑Functional Requirements

- **Security:** Data stored per Microsoft privacy standards.
- **Performance:**
  - Processing latency < 5 minutes per batch
  - Dashboard loads < 3 seconds for standard filters
- **Scalability:** Supports 10,000+ responses per study.

---

## 5. Architecture Overview

### 5.1 Components

1. **Frontend:**
   - Azure Static Web App
   - Azure Speech SDK for recording + transcription

2. **Backend:**
   - Azure SQL/PostgreSQL database
   - Azure Function or Fabric pipeline
   - Azure AI Language (Key Phrases + Sentiment)

3. **Analytics:**
   - Power BI dashboard

### 5.2 Data Flow

1. User records audio → Azure Speech transcribes.
2. Raw record saved in DB.
3. Processor detects topics, sentiments.
4. Processed table updates.
5. Dashboard refreshes for team review.

---

## 6. Success Metrics

- ≥80% reduction manual coding time.
- ≥90% transcription accuracy (typical Azure Speech performance).
- Pipeline processes ≥95% responses without intervention.
- Power BI dashboard achieves ≥4/5 usability in internal evaluation.

---

## 7. Consent & Compliance Requirements

### 7.1 Consent Capture

Participants must:
- Provide **First Name, Last Name, Email**
- Review consent form
- Check "I agree to the terms and conditions"

### 7.2 Example Consent Language (Draft)

> "By checking this box, I confirm that I have read and agree to the research consent terms. I understand that my audio recordings and written responses will be used for internal UX research and may be processed by automated Azure AI systems for transcription, sentiment analysis, and topic extraction."

### 7.3 Compliance Notes

- Azure Language sentiment analysis and topic extraction handle data as submitted and return results statelessly.
- No data is stored by the service.
- Processing can also occur in containers if needed for localized PII restrictions.

---

## 8. Open Questions (Resolved)

| Topic | Decision |
|-------|----------|
| Topic extraction service | Azure AI Language – Key Phrase Extraction |
| Sentiment classification | Azure AI Language Sentiment API |
| Low-code or Copilot refinement | Supported via Azure Functions + VS Code Copilot |
| Dashboard location | Standalone Power BI report |
| Participant identity requirements | First name, last name, email, consent checkbox |

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Audio quality affects transcription accuracy | Provide recording guidance, test mic setup |
| Topics too generic or noisy | Refine key phrase patterns, allow researcher edits |
| Sentiment misclassification | Use confidence thresholds and flag low-confidence items |
| Growth of data volume | Add batching and queue processing |

---

## 10. Backlog (Initial)

### MVP

- Build static web app with speech input
- Store raw responses in database
- Implement processing pipeline
- Power BI dashboard (v1)
- Consent & identity collection

### Future Enhancements

- Researcher UI to manage topic lists
- Multi-language support
- LLM summarization
- In‑app participant guidance
