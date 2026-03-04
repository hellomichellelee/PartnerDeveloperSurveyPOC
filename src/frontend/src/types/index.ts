// =============================================================================
// Type Definitions for Research Feedback Platform
// =============================================================================

export type SurveyStep = 'consent' | 'participant' | 'topics' | 'questions' | 'topicComplete' | 'complete';

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
  context?: string;
  required?: boolean;
}

export interface SurveyResponse {
  questionId: string;
  questionText: string;
  responseText: string;
  inputMethod: InputMethod;
  timestamp: string;
  topicId?: string;
}

export interface SurveyTopic {
  id: string;
  title: string;
  description: string;
  intro: string;
  icon: string; // icon name key
  questions: SurveyQuestion[];
}

export interface SurveyConfig {
  title: string;
  description: string;
  consentText: string;
  topics: SurveyTopic[];
  /** @deprecated Use topics[].questions instead */
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
