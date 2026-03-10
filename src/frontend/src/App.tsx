import { useState, useCallback } from 'react';
import { makeStyles, shorthands, Toaster, useToastController, useId } from '@fluentui/react-components';
import { Header } from './components/Header';
import { ConsentForm } from './components/ConsentForm';
import { ParticipantForm } from './components/ParticipantForm';
import { TopicMenu } from './components/TopicMenu';
import { SurveyQuestions } from './components/SurveyQuestions';
import { TopicCompletionScreen } from './components/TopicCompletionScreen';
import { CompletionScreen } from './components/CompletionScreen';
import { surveyConfig } from './config/survey';
import type { Participant, SurveyResponse, SurveyStep } from './types';

const useStyles = makeStyles({
  app: {
    minHeight: '100vh',
    backgroundColor: '#f0f4fa',
  },
  main: {
    // For consent & participant forms, keep the centered card layout
  },
  centeredMain: {
    maxWidth: '800px',
    margin: '0 auto',
    ...shorthands.padding('40px', '24px'),
  },
});

function App() {
  const styles = useStyles();
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  // Application state
  const [currentStep, setCurrentStep] = useState<SurveyStep>('consent');
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [_allResponses, setAllResponses] = useState<SurveyResponse[]>([]);
  const [submissionId] = useState(() => crypto.randomUUID());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Topic state
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

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
    // Automatically open the first topic
    const firstTopic = surveyConfig.topics[0];
    if (firstTopic) {
      setSelectedTopicId(firstTopic.id);
      setCurrentStep('questions');
    } else {
      setCurrentStep('topics');
    }
  }, []);

  // Handle topic selection
  const handleTopicSelect = useCallback((topicId: string) => {
    setSelectedTopicId(topicId);
    setCurrentStep('questions');
  }, []);

  // Handle topic questions completion (submit responses for one topic)
  const handleTopicQuestionsComplete = useCallback(async (topicResponses: SurveyResponse[]) => {
    setIsSubmitting(true);

    // Resolve the current topic for the short label
    const currentTopic = surveyConfig.topics.find(t => t.id === selectedTopicId);
    const topicLabel = currentTopic?.topic || '';

    // Tag responses with the topic ID and short topic label
    const taggedResponses = topicResponses.map(r => ({
      ...r,
      topicId: selectedTopicId || undefined,
      topic: topicLabel,
    }));

    try {
      const payload = {
        submissionId,
        participant: {
          ...participant,
          consentGiven: true,
        },
        topicId: selectedTopicId,
        topic: topicLabel,
        responses: taggedResponses.map(r => ({
          questionId: r.questionId,
          questionText: r.questionText,
          responseText: r.responseText,
          inputMethod: r.inputMethod,
          topicId: r.topicId,
          topic: r.topic,
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
    } catch (error) {
      console.error('Submission error:', error);

      // Store locally as fallback
      localStorage.setItem(`survey_${submissionId}_${selectedTopicId}`, JSON.stringify({
        participant,
        topicId: selectedTopicId,
        responses: taggedResponses,
        timestamp: new Date().toISOString(),
      }));

      dispatchToast(
        'Your responses have been saved locally and will be submitted when connection is restored.',
        { intent: 'warning', timeout: 5000 }
      );
    } finally {
      setIsSubmitting(false);
    }

    // Accumulate responses and mark topic done
    setAllResponses(prev => [...prev, ...taggedResponses]);
    setCompletedTopics(prev => new Set([...prev, selectedTopicId!]));
    setCurrentStep('topicComplete');
  }, [submissionId, participant, selectedTopicId, dispatchToast]);

  // Go back to topic menu
  const handleSelectAnotherTopic = useCallback(() => {
    setSelectedTopicId(null);
    setCurrentStep('topics');
  }, []);

  // End the entire survey
  const handleEndSurvey = useCallback(() => {
    setCurrentStep('complete');
  }, []);

  // Get current topic data
  const currentTopic = selectedTopicId
    ? surveyConfig.topics.find(t => t.id === selectedTopicId)
    : null;

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'consent':
        return (
          <div className={styles.centeredMain}>
            <ConsentForm onAccept={handleConsentAccept} />
          </div>
        );
      case 'participant':
        return (
          <div className={styles.centeredMain}>
            <ParticipantForm onSubmit={handleParticipantSubmit} />
          </div>
        );
      case 'topics':
        return (
          <TopicMenu
            topics={surveyConfig.topics}
            completedTopics={completedTopics}
            onTopicSelect={handleTopicSelect}
            onEndSurvey={handleEndSurvey}
          />
        );
      case 'questions':
        return currentTopic ? (
          <SurveyQuestions
            questions={currentTopic.questions}
            topicTitle={currentTopic.title}
            topicIntro={currentTopic.intro}
            onComplete={handleTopicQuestionsComplete}
            isSubmitting={isSubmitting}
          />
        ) : null;
      case 'topicComplete':
        return currentTopic ? (
          <TopicCompletionScreen
            topicTitle={currentTopic.title}
            completedCount={completedTopics.size}
            totalTopics={surveyConfig.topics.length}
            onSelectAnotherTopic={handleSelectAnotherTopic}
            onEndSurvey={handleEndSurvey}
          />
        ) : null;
      case 'complete':
        return (
          <CompletionScreen
            participantName={participant?.firstName || 'Participant'}
            completedTopicCount={completedTopics.size}
          />
        );
      default:
        return null;
    }
  };

  // For topic-related screens, render full-width (no header constraint)
  const isFullWidth = ['topics', 'questions', 'topicComplete', 'complete'].includes(currentStep);

  return (
    <div className={styles.app}>
      {!isFullWidth && <Header title={surveyConfig.title} />}
      <main className={isFullWidth ? styles.main : undefined}>
        {renderStep()}
      </main>
      <Toaster toasterId={toasterId} position="top-end" />
    </div>
  );
}

export default App;
