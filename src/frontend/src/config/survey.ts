import type { SurveyConfig } from '../types';

export const surveyConfig: SurveyConfig = {
  title: 'Dragon Copilot Partner Developer Survey',
  description: 'Share your feedback on the Dragon Copilot partner developer experience.',
  consentText:
    'By participating in this survey, you consent to your responses being collected and analyzed ' +
    'for research purposes. Your responses will be kept confidential and used only to improve the ' +
    'Dragon Copilot partner developer experience. You may withdraw at any time.',
  questions: [], // Deprecated – use topics[].questions instead
  topics: [
    {
      id: 'partner-context',
      title: 'About You and Your Project',
      topic: 'Context',
      description: 'Background information about you and your Dragon Copilot integration.',
      intro: 'This section helps us understand your role, organization, and the Dragon Copilot solution you are working on.',
      icon: 'Contact',
      questions: [
        {
          id: 'ctx-1',
          text: 'Can you describe your role and organization, and how you are involved with Dragon Copilot?',
          required: true,
        },
        {
          id: 'ctx-2',
          text: 'What solution, agent, or integration are you building with Dragon Copilot?',
          required: true,
        },
        {
          id: 'ctx-3',
          text: 'What stage is your Dragon Copilot project currently in, and what does that look like in practice?',
          required: true,
        },
      ],
    },

    {
      id: 'onboarding',
      title: 'Onboarding Experience',
      topic: 'Onboarding',
      description: 'Your experience getting started with the Dragon Copilot partner program.',
      intro: 'We’d like to understand how you got started and what your onboarding experience was like.',
      icon: 'Rocket',
      questions: [
        {
          id: 'onb-1',
          text: 'Can you walk us through your onboarding experience, from initial sign‑up to being ready to develop?',
          required: true,
        },
        {
          id: 'onb-2',
          text: 'What resources, documentation, or support did you rely on most during onboarding?',
          required: true,
        },
        {
          id: 'onb-3',
          text: 'Were there any parts of onboarding that felt unclear, incomplete, or harder than expected?',
          required: true,
        },
        {
          id: 'onb-4',
          text: 'What would you change or improve about the onboarding experience for future partners?',
          required: true,
        },
      ],
    },

    {
      id: 'development',
      title: 'Development Experience',
      topic: 'Development',
      description: 'Your experience building and integrating your Dragon Copilot solution.',
      intro: 'This section focuses on how you developed your solution, including tools, documentation, and challenges.',
      icon: 'Code',
      questions: [
        {
          id: 'dev-1',
          text: 'How would you describe your overall development experience building your Dragon Copilot integration?',
          required: true,
        },
        {
          id: 'dev-2',
          text: 'What tools, sample code, or documentation were most helpful during development?',
          required: true,
        },
        {
          id: 'dev-3',
          text: 'What were the biggest technical or workflow challenges you encountered while developing your solution?',
          required: true,
        },
        {
          id: 'dev-4',
          text: 'What additional tools, documentation, or resources would have made development easier?',
          required: true,
        },
      ],
    },

    {
      id: 'integration-data',
      title: 'Integration & Data',
      topic: 'Integration',
      description: 'How your solution integrates with Dragon Copilot and uses data.',
      intro: 'We want to understand how your solution fits into clinical workflows and what data it depends on.',
      icon: 'PlugConnected',
      questions: [
        {
          id: 'int-1',
          text: 'How does your solution integrate into the clinician’s workflow when using Dragon Copilot?',
          required: true,
        },
        {
          id: 'int-2',
          text: 'What Dragon Copilot context or data does your solution rely on?',
          required: true,
        },
        {
          id: 'int-3',
          text: 'Is there any additional data or context that would significantly improve your solution?',
          required: true,
        },
        {
          id: 'int-4',
          text: 'Did you integrate with any external systems (such as EHRs), and what was that experience like?',
          required: true,
        },
      ],
    },

    {
      id: 'testing-debugging',
      title: 'Testing & Debugging',
      topic: 'Testing',
      description: 'Your experience testing, debugging, and validating your solution.',
      intro: 'This section focuses on how you tested your integration and what support you had during debugging.',
      icon: 'Bug',
      questions: [
        {
          id: 'test-1',
          text: 'How did you approach testing your Dragon Copilot integration?',
          required: true,
        },
        {
          id: 'test-2',
          text: 'What tools or processes did you use to debug issues during development?',
          required: true,
        },
        {
          id: 'test-3',
          text: 'What challenges did you face when testing or validating your solution?',
          required: true,
        },
        {
          id: 'test-4',
          text: 'What would increase your confidence in moving a solution to pilot or production?',
          required: true,
        },
      ],
    },

    {
      id: 'publishing',
      title: 'Publishing & Go‑To‑Market',
      topic: 'Publishing',
      description: 'Your experience preparing to publish or distribute your solution.',
      intro: 'We’d like to understand your experience with publishing, Partner Center, and go‑to‑market readiness.',
      icon: 'Store',
      questions: [
        {
          id: 'pub-1',
          text: 'What are your plans for deploying or publishing your Dragon Copilot solution?',
          required: true,
        },
        {
          id: 'pub-2',
          text: 'What has your experience been like preparing your solution for publishing or customer use?',
          required: true,
        },
        {
          id: 'pub-3',
          text: 'Were there any requirements, reviews, or processes that were difficult to navigate?',
          required: true,
        },
        {
          id: 'pub-4',
          text: 'What support or guidance would make the publishing process easier?',
          required: true,
        },
      ],
    },

    {
      id: 'wrap-up',
      title: 'Overall Feedback',
      topic: 'Wrap‑Up',
      description: 'Your overall impressions and future needs.',
      intro: 'To close, we’d like your overall perspective and suggestions for improvement.',
      icon: 'Feedback',
      questions: [
        {
          id: 'wrap-1',
          text: 'What has been the most positive aspect of working with Dragon Copilot so far?',
          required: true,
        },
        {
          id: 'wrap-2',
          text: 'What has been the biggest challenge or pain point across your experience?',
          required: true,
        },
        {
          id: 'wrap-3',
          text: 'If you could change or improve one thing about the Dragon Copilot partner experience, what would it be?',
          required: true,
        },
        {
          id: 'wrap-4',
          text: 'Do you plan to build additional features or integrations in the future? Why or why not?',
          required: true,
        },
        {
          id: 'wrap-5',
          text: 'Is there anything else you’d like to share that we haven’t asked about?',
          required: false,
        },
      ],
    },
  ],
};

// Azure Speech SDK configuration
export const azureConfig = {
  speech: {
    subscriptionKey: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
    region: import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus',
    language: import.meta.env.VITE_AZURE_SPEECH_LANGUAGE || 'en-US',
  },
};

// Feature flags
export const featureFlags = {
  enableVoiceInput: true,
  enableRealTimeTranscription: true,
};