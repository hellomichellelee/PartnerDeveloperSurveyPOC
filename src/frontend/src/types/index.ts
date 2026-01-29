// =============================================================================
// Type Definitions for Research Feedback Platform
// =============================================================================

export type SurveyStep = 'consent' | 'participant' | 'questions' | 'complete';

export type InputMethod = 'voice' | 'text';

export interface Participant {
  firstName: string;
  lastName: string;
  email: string;
  consentGiven: boolean;
  consentTimestamp?: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  description?: string;
  required?: boolean;
}

export interface SurveyResponse {
  questionId: string;
  questionText: string;
  responseText: string;
  inputMethod: InputMethod;
  timestamp: string;
}

export interface SurveyConfig {
  title: string;
  description: string;
  consentText: string;
  questions: SurveyQuestion[];
}

export interface SubmissionPayload {
  submissionId: string;
  participant: Participant;
  responses: Omit<SurveyResponse, 'timestamp'>[];
  submittedAt: string;
}

// Speech recognition types
export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechConfig {
  subscriptionKey: string;
  region: string;
  language?: string;
}
