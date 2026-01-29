import { useState, useCallback } from 'react';
import { makeStyles, tokens, Toaster, useToastController, useId } from '@fluentui/react-components';
import { Header } from './components/Header';
import { ConsentForm } from './components/ConsentForm';
import { ParticipantForm } from './components/ParticipantForm';
import { SurveyQuestions } from './components/SurveyQuestions';
import { CompletionScreen } from './components/CompletionScreen';
import { surveyConfig } from './config/survey';
import type { Participant, SurveyResponse, SurveyStep } from './types';

const useStyles = makeStyles({
  app: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalL}`,
  },
});

function App() {
  const styles = useStyles();
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  // Application state
  const [currentStep, setCurrentStep] = useState<SurveyStep>('consent');
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [_responses, setResponses] = useState<SurveyResponse[]>([]);
  const [submissionId] = useState(() => crypto.randomUUID());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suppress unused variable warning
  void _responses;

  // Handle consent acceptance
  const handleConsentAccept = useCallback(() => {
    setCurrentStep('participant');
  }, []);

  // Handle participant form submission
  const handleParticipantSubmit = useCallback((participantData: Participant) => {
    setParticipant({
      ...participantData,
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
    });
    setCurrentStep('questions');
  }, []);

  // Handle survey completion
  const handleSurveyComplete = useCallback(async (surveyResponses: SurveyResponse[]) => {
    setResponses(surveyResponses);
    setIsSubmitting(true);

    try {
      const payload = {
        submissionId,
        participant: {
          ...participant,
          consentGiven: true,
        },
        responses: surveyResponses.map(r => ({
          questionId: r.questionId,
          questionText: r.questionText,
          responseText: r.responseText,
          inputMethod: r.inputMethod,
        })),
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch('/api/submit-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }

      setCurrentStep('complete');
    } catch (error) {
      console.error('Submission error:', error);
      
      // Store locally as fallback
      localStorage.setItem(`survey_${submissionId}`, JSON.stringify({
        participant,
        responses: surveyResponses,
        timestamp: new Date().toISOString(),
      }));

      dispatchToast(
        'Your responses have been saved locally and will be submitted when connection is restored.',
        { intent: 'warning', timeout: 5000 }
      );

      setCurrentStep('complete');
    } finally {
      setIsSubmitting(false);
    }
  }, [submissionId, participant, dispatchToast]);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'consent':
        return <ConsentForm onAccept={handleConsentAccept} />;
      case 'participant':
        return <ParticipantForm onSubmit={handleParticipantSubmit} />;
      case 'questions':
        return (
          <SurveyQuestions
            questions={surveyConfig.questions}
            onComplete={handleSurveyComplete}
            isSubmitting={isSubmitting}
          />
        );
      case 'complete':
        return <CompletionScreen participantName={participant?.firstName || 'Participant'} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.app}>
      <Header title={surveyConfig.title} />
      <main className={styles.main}>
        {renderStep()}
      </main>
      <Toaster toasterId={toasterId} position="top-end" />
    </div>
  );
}

export default App;
