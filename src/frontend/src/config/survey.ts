import type { SurveyConfig } from '../types';

// =============================================================================
// Survey Configuration
// =============================================================================

export const surveyConfig: SurveyConfig = {
  title: 'Dragon admin center',
  description: 'Share your valuable feedback to help us improve Dragon admin center.',

  consentText: `By participating in this survey, I confirm that:

• I have read and understand the purpose of this research study.
• I understand that my audio recordings and written responses will be used for internal UX research purposes.
• My responses may be processed by automated Azure AI systems for transcription, sentiment analysis, and topic extraction.
• I can withdraw from this study at any time without providing a reason.
• My personal information will be handled in accordance with Microsoft's privacy policy.
• I am 18 years of age or older.

I voluntarily agree to participate in this research study.`,

  // Legacy flat questions array (kept for backward compat — prefer topics)
  questions: [],

  topics: [
    {
      id: 'provisioning',
      title: 'Provisioning',
      topic: 'Provisioning',
      description: 'Provisioning is the process that sets up an application for an environment, like turning on Dragon Copilot in Production so its features become available to assigned users.',
      intro: "This section gathers your feedback on provisioning in Dragon admin center—the process that prepares an application for use in an environment. Provisioning 'sets up the Dragon Copilot application within the selected environment'.",
      icon: 'CheckmarkCircle',
      questions: [
        {
          id: 'prov-1',
          text: 'Can you describe what the provisioning experience was like for you?',
          required: true,
        },
        {
          id: 'prov-2',
          text: "Was there any part of the 'Provision' process that felt unclear to you?",
          required: true,
        },
        {
          id: 'prov-3',
          text: "Is the term 'provision' something you were familiar with, or is it a concept you don't encounter frequently?",
          required: true,
        },
        {
          id: 'prov-4',
          text: 'How does this new process compare to how you rolled out features in NMC?',
          description: "In Nuance Management Center (NMC) the concept of provisioning didn't exist in the same way.",
          required: true,
        },
      ],
    },
    {
      id: 'environments',
      title: 'Environments',
      topic: 'Environments',
      description: 'Environments are separate spaces, like Test or Production, where you configure and manage applications, settings, and access without affecting other spaces.',
      intro: "We'd like your input on environment management in Dragon admin center—creating and managing environments for testing, production, or department-specific needs to ensure applications, configurations, and access are properly controlled.",
      icon: 'GlobeSurface',
      questions: [
        {
          id: 'env-1',
          text: 'What kinds of organizational structures or IT management needs do you expect your environment structure to reflect?',
          required: true,
        },
        {
          id: 'env-2',
          text: 'What kinds of scenarios require you to create, manage, or modify environments? How frequently do you conduct this type of work?',
          required: true,
        },
        {
          id: 'env-3',
          text: "Do you think having the ability to create multiple environments in DAC (for example, separate 'default' and 'test' environments) is useful for your organization's workflows?",
          required: true,
        },
      ],
    },
    {
      id: 'organization-units',
      title: 'Organization units',
      topic: 'Organizations',
      description: 'Organizational Units are structural groupings, such as facilities, departments, or teams, used to organize users and control how settings and permissions are applied.',
      intro: "Organizational Units are structural groupings, such as facilities, departments, or teams, used to organize users and control how settings and permissions are applied. In Nuance management center (NMC), the hierarchy was strictly Organization > Sites > Groups. In DAC, you have more freedom (multiple layers of Organization units without fixed 'site' or 'group' labels).",
      icon: 'Organization',
      questions: [
        {
          id: 'org-1',
          text: 'How do you feel about organization units? Do they make organizing users and resources easier or harder for you?',
          required: true,
        },
        {
          id: 'org-2',
          text: "Have you taken advantage of this flexibility? For example, have you restructured or added new Organization units now that you aren't limited to a site/group hierarchy?",
          required: true,
        },
        {
          id: 'org-3',
          text: "How could the interface make it easier to find or manage your hierarchy? Any suggestions if it wasn't intuitive?",
          required: true,
        },
        {
          id: 'org-4',
          text: 'What kinds of scenarios require you to create, manage, or modify org units? How frequently do you conduct this type of work?',
          required: true,
        },
        {
          id: 'org-5',
          text: "Did you encounter any unexpected behavior or things you'd like to change about how Org Units work?",
          required: true,
        },
      ],
    },
    {
      id: 'library-texts',
      title: 'Library items: Texts',
      topic: 'Texts',
      description: 'Texts are predefined content snippets inserted with keywords during clinical documentation—such as inserting a standard discharge summary when a clinician says "add discharge note."',
      intro: 'Texts are reusable documentation snippets, like a standard discharge summary—"Patient stable and ready for home"—that clinicians insert with a voice command, such as "Discharge summary", in Dragon Copilot. In NMC these were Auto-texts tied to Sites/Groups; DAC lets you manage and scope them flexibly across Organization units.',
      icon: 'Library',
      questions: [
        {
          id: 'txt-1',
          text: 'What types of texts do you manage for your organization? How often do you create or edit these?',
          required: true,
        },
        {
          id: 'txt-2',
          text: 'Describe how you would add or modify a Text in DAC. Was it easy to do? Any challenges you encountered?',
          required: true,
        },
        {
          id: 'txt-3',
          text: 'Is it clear how to manage the scope of a Text? For instance, whether a Text applies to the whole organization or only to a specific organization unit or user.',
          required: true,
        },
        {
          id: 'txt-4',
          text: 'In Dragon admin center, texts can be defined at the organization-level or specified for a specific organization unit. Have you made use of that capability, or do you typically keep texts global? Why?',
          required: true,
        },
        {
          id: 'txt-5',
          text: 'Similar to NMC, DAC supports cutting or copying a text from one Organization unit and pasting it into another. Do you use this feature? Has it worked as you would expect it to?',
          required: true,
        },
      ],
    },
    {
      id: 'library-prompts',
      title: 'Library items: Prompts',
      topic: 'Prompts',
      description: 'Prompts are custom instructions for common clinical scenarios that tailor AI-generated responses when clinicians interact with chat—for example, guiding Copilot to summarize a medication list when a clinician types "summarize meds."',
      intro: "Prompts are customizable AI requests—like 'Generate a structured assessment and plan'—that clinicians trigger in Dragon Copilot. In DAC, admins can tune each Prompt by shaping the instruction, required inputs, and desired clinical tone, ensuring the AI produces responses that match organizational standards.",
      icon: 'Library',
      questions: [
        {
          id: 'prm-1',
          text: 'Prompts are a new library item in Dragon admin center. Prompts act as custom templates for frequent AI-generated content in Dragon Copilot. Have you explored the Prompts feature at all in the past few weeks?',
          required: true,
        },
        {
          id: 'prm-2',
          text: 'What Prompts have you tried to create or use? How was the process of creating a custom prompt in DAC?',
          required: true,
        },
        {
          id: 'prm-3',
          text: "Do you have any concerns or uncertainty about how you'd manage or govern these AI prompts for your users?",
          required: true,
        },
        {
          id: 'prm-4',
          text: 'What scenarios might cause you to add, edit, or delete prompts? How frequently would you expect to encounter these scenarios?',
          required: true,
        },
      ],
    },
    {
      id: 'library-vocabulary',
      title: 'Library items: Vocabulary',
      topic: 'Vocabulary',
      description: 'Vocabulary items add domain-specific medical terms and spoken forms to improve speech-to-text recognition accuracy in Dragon Copilot—for instance, teaching the system terms like "high blood sugar" or "hyper-gly-cee-mee-ah."',
      intro: "Vocabulary items are custom words or phrases—such as 'hypertensive crisis' and its synonym 'malignant hypertension,' or the abbreviation 'HTN'—that ensure Dragon Copilot correctly recognizes the terminology clinicians use. In NMC, Words were tied to Sites/Groups; DAC lets you apply them globally or to specific Organization units.",
      icon: 'Library',
      questions: [
        {
          id: 'voc-1',
          text: 'Have you worked with vocabulary items in DAC? (formerly known as Words in NMC) How has your experience been?',
          required: true,
        },
        {
          id: 'voc-2',
          text: 'What kinds of tasks do you normally do with custom vocabulary? (e.g., adding new terms, reviewing for duplicates, updating pronunciations) — have you done any of those in DAC yet? How was that process?',
          required: true,
        },
        {
          id: 'voc-3',
          text: "Previously in NMC, words may have been managed per site or group; now DAC lets you apply custom vocabulary at the organization-level or to a specific organization unit. Is this flexibility something you've used or plan to use?",
          required: true,
        },
        {
          id: 'voc-4',
          text: 'How many vocabulary items do you manage for your organization? Can you describe how they are scoped and what scenarios they support?',
          required: true,
        },
      ],
    },
    {
      id: 'library-workflows',
      title: 'Library items: Workflows',
      topic: 'Workflows',
      description: 'Workflows are automated step-by-step sequences that enable Dragon Copilot to carry out multi-step tasks for clinicians based on a keyword or phrase—such as opening a lab results section and inserting findings when the clinician says "document labs."',
      intro: "Workflows automate multi-step actions—such as turning off the mic, copying selected text, and inserting a note—when a clinician says a spoken command like 'End session.' NMC's Step-by-Step Commands become centralized, Organization-Unit-scoped Workflows in DAC.",
      icon: 'Library',
      questions: [
        {
          id: 'wf-1',
          text: 'NMC Step-by-Step Commands are now called Workflows in DAC. Have you accessed or managed any Workflows in DAC over the past few weeks?',
          required: true,
        },
        {
          id: 'wf-2',
          text: 'What was your experience like? (E.g., creating a multi-step sequence, setting a spoken trigger phrase, etc.)',
          required: true,
        },
        {
          id: 'wf-3',
          text: 'What kinds of workflows do you manage for your organization? How many workflows? What are some common use cases?',
          required: true,
        },
        {
          id: 'wf-4',
          text: 'How often do you typically use or update these kinds of multi-step Workflows in administration?',
          required: true,
        },
      ],
    },
    {
      id: 'application-settings',
      title: 'Application settings',
      topic: 'Settings',
      description: 'Application settings control how Dragon Copilot features and permissions behave across different levels in an environment, including the organization, its organizational units, and individual users.',
      intro: "Application settings control how an application, such as Dragon Copilot, behaves for different environments and organization units—such as enabling AI summaries or restricting certain features. DAC uses a clear inheritance model so settings can be managed globally or customized for specific Organization units.",
      icon: 'Settings',
      questions: [
        {
          id: 'set-1',
          text: 'Were you able to find where to manage global settings for your organization in DAC? How intuitive was it to find and navigate the settings pages?',
          required: true,
        },
        {
          id: 'set-2',
          text: 'Is it clear how you would change a particular setting for only a subset of users (say, a specific hospital department) in DAC? Does the concept of applying settings through the organization unit hierarchy make sense?',
          required: true,
        },
        {
          id: 'set-3',
          text: "In NMC, settings could be applied at the site or group level. In DAC, you can configure a setting at the organization-level or override it at a lower organization unit or user level. How do you feel about this level of control? Is it something you've used or plan to use?",
          required: true,
        },
        {
          id: 'set-4',
          text: 'Have you utilized locking for settings? Do you have any concerns about how it works?',
          required: true,
        },
        {
          id: 'set-5',
          text: "Are there any settings or configuration options you expected to find in DAC that you haven't found yet? Or settings you wish you could control per unit/user that you currently cannot?",
          required: true,
        },
      ],
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
};
