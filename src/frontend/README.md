# Research Feedback Platform - Frontend

React application built with **Fluent UI 2** (Microsoft's design system) for collecting research feedback with voice and text input.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Fluent UI React Components v9** - Microsoft's design system
- **Azure Speech SDK** - Voice-to-text transcription

## Fluent 2 Design System

This project follows [Fluent 2 Design System](https://fluent2.microsoft.design/) guidelines:

### Typography

Uses the Fluent 2 type ramp from [@fluentui/react-components](https://storybooks.fluentui.dev/react/?path=/docs/theme-typography--docs):

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | 68px | Semibold | Hero headings |
| Large Title | 40px | Semibold | Page titles |
| Title 1-3 | 24-32px | Semibold | Section headings |
| Subtitle 1-2 | 16-20px | Semibold | Card headers |
| Body 1 | 14px | Regular | Main content |
| Caption 1-2 | 10-12px | Regular | Secondary info |

### Colors

Uses semantic color tokens from [Fluent theme](https://storybooks.fluentui.dev/react/?path=/docs/theme-colors--docs):

```tsx
import { tokens } from '@fluentui/react-components';

// Use semantic tokens for automatic theme support
backgroundColor: tokens.colorNeutralBackground1
color: tokens.colorNeutralForeground1
borderColor: tokens.colorNeutralStroke1
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd src/frontend
npm install
```

### Development

```bash
npm run dev
```

Opens at http://localhost:3000

### Environment Variables

Create a `.env.local` file:

```env
VITE_AZURE_SPEECH_KEY=your-speech-key
VITE_AZURE_SPEECH_REGION=eastus2
VITE_API_BASE_URL=/api
```

### Build

```bash
npm run build
```

Output goes to `dist/` folder for Azure Static Web Apps deployment.

## Project Structure

```
src/frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── Header.tsx
│   │   ├── ConsentForm.tsx
│   │   ├── ParticipantForm.tsx
│   │   ├── SurveyQuestions.tsx
│   │   ├── VoiceRecorder.tsx
│   │   └── CompletionScreen.tsx
│   ├── config/
│   │   └── survey.ts       # Survey configuration
│   ├── theme/
│   │   └── fluent-theme.ts # Custom Fluent theme
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── styles/
│   │   └── global.css      # Global styles
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Key Components

### FluentProvider

Wraps the app to provide theme context:

```tsx
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

<FluentProvider theme={webLightTheme}>
  <App />
</FluentProvider>
```

### makeStyles

Fluent's CSS-in-JS solution using Griffel:

```tsx
import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
  },
});
```

## Resources

- [Fluent 2 Design System](https://fluent2.microsoft.design/)
- [Fluent UI React Storybook](https://storybooks.fluentui.dev/react/)
- [Typography Guidelines](https://fluent2.microsoft.design/typography)
- [Color System](https://storybooks.fluentui.dev/react/?path=/docs/theme-colors--docs)
