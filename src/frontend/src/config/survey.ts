import type { SurveyConfig } from '../types';

// =============================================================================
// Survey Configuration
// =============================================================================

export const surveyConfig: SurveyConfig = {
  title: 'Research Feedback Survey',
  description: 'Share your valuable feedback to help us improve our products and services.',
  
  consentText: `By participating in this survey, I confirm that:

• I have read and understand the purpose of this research study.
• I understand that my audio recordings and written responses will be used for internal UX research purposes.
• My responses may be processed by automated Azure AI systems for transcription, sentiment analysis, and topic extraction.
• I can withdraw from this study at any time without providing a reason.
• My personal information will be handled in accordance with Microsoft's privacy policy.
• I am 18 years of age or older.

I voluntarily agree to participate in this research study.`,

  questions: [
    {
      id: 'q1',
      text: 'What was your overall experience using the product?',
      description: 'Please describe your general impressions, including what worked well and any areas for improvement.',
      required: true,
    },
    {
      id: 'q2',
      text: 'What features did you find most useful?',
      description: 'Tell us about the features that helped you accomplish your tasks effectively.',
      required: true,
    },
    {
      id: 'q3',
      text: 'What challenges or frustrations did you encounter?',
      description: 'Share any difficulties you experienced while using the product.',
      required: true,
    },
    {
      id: 'q4',
      text: 'What improvements would you suggest?',
      description: 'What changes would make the product more useful for you?',
      required: true,
    },
    {
      id: 'q5',
      text: 'Would you recommend this product to others? Why or why not?',
      description: 'Please explain your reasoning.',
      required: true,
    },
  ],
};

// =============================================================================
// Azure Services Configuration
// =============================================================================

export const azureConfig = {
  speech: {
    // These will be loaded from environment variables or Static Web App settings
    subscriptionKey: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
    region: import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus2',
    language: 'en-US',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  },
};

// =============================================================================
// Feature Flags
// =============================================================================

export const featureFlags = {
  enableVoiceInput: true,
  enableOfflineMode: true,
  useMockSpeechService: import.meta.env.DEV && !import.meta.env.VITE_AZURE_SPEECH_KEY,
};
