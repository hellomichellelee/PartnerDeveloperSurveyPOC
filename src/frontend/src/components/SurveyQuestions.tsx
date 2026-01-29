import { useState, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Card,
  Text,
  Textarea,
  Button,
  ProgressBar,
  Field,
  Divider,
  ToggleButton,
  Spinner,
  Badge,
} from '@fluentui/react-components';
import {
  Mic24Regular,
  Mic24Filled,
  TextDescription24Regular,
  ArrowLeft24Regular,
  ArrowRight24Regular,
  Checkmark24Regular,
} from '@fluentui/react-icons';
import { VoiceRecorder } from './VoiceRecorder';
import { featureFlags } from '../config/survey';
import type { SurveyQuestion, SurveyResponse, InputMethod } from '../types';

const useStyles = makeStyles({
  card: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: tokens.spacingVerticalXL,
  },
  progressSection: {
    marginBottom: tokens.spacingVerticalL,
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground2,
  },
  questionSection: {
    marginTop: tokens.spacingVerticalL,
  },
  questionText: {
    marginBottom: tokens.spacingVerticalS,
  },
  questionDescription: {
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalL,
  },
  inputToggle: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalL,
  },
  responseArea: {
    minHeight: '150px',
  },
  transcriptBadge: {
    marginTop: tokens.spacingVerticalS,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: tokens.spacingVerticalXL,
    gap: tokens.spacingHorizontalM,
  },
  navButtons: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
});

interface SurveyQuestionsProps {
  questions: SurveyQuestion[];
  onComplete: (responses: SurveyResponse[]) => void;
  isSubmitting: boolean;
}

export function SurveyQuestions({ questions, onComplete, isSubmitting }: SurveyQuestionsProps) {
  const styles = useStyles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, SurveyResponse>>(new Map());
  const [inputMethod, setInputMethod] = useState<InputMethod>('text');
  const [currentText, setCurrentText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  // Load existing response when navigating
  const existingResponse = responses.get(currentQuestion.id);
  const displayText = currentText || existingResponse?.responseText || '';

  const saveCurrentResponse = useCallback(() => {
    if (displayText.trim()) {
      const response: SurveyResponse = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        responseText: displayText.trim(),
        inputMethod,
        timestamp: new Date().toISOString(),
      };
      setResponses(prev => new Map(prev).set(currentQuestion.id, response));
    }
  }, [currentQuestion, displayText, inputMethod]);

  const handleNext = useCallback(() => {
    saveCurrentResponse();
    setCurrentText('');
    
    if (isLastQuestion) {
      // Compile all responses and submit
      const allResponses = Array.from(responses.values());
      if (displayText.trim()) {
        allResponses.push({
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          responseText: displayText.trim(),
          inputMethod,
          timestamp: new Date().toISOString(),
        });
      }
      onComplete(allResponses);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [saveCurrentResponse, isLastQuestion, responses, displayText, currentQuestion, inputMethod, onComplete]);

  const handlePrevious = useCallback(() => {
    saveCurrentResponse();
    setCurrentText('');
    setCurrentIndex(prev => prev - 1);
  }, [saveCurrentResponse]);

  const handleTextChange = useCallback((_: unknown, data: { value: string }) => {
    setCurrentText(data.value);
    setInputMethod('text');
  }, []);

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      setCurrentText(prev => prev + (prev ? ' ' : '') + text);
      setInputMethod('voice');
    }
  }, []);

  const canProceed = displayText.trim().length > 0 || !currentQuestion.required;

  return (
    <Card className={styles.card}>
      {/* Progress Section */}
      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <Text size={200}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <Text size={200}>{Math.round(progress)}% complete</Text>
        </div>
        <ProgressBar value={progress / 100} thickness="large" />
      </div>

      <Divider />

      {/* Question Section */}
      <div className={styles.questionSection}>
        <Text size={500} weight="semibold" block className={styles.questionText}>
          {currentQuestion.text}
          {currentQuestion.required && (
            <Text size={500} style={{ color: tokens.colorPaletteRedForeground1 }}> *</Text>
          )}
        </Text>
        
        {currentQuestion.description && (
          <Text size={300} className={styles.questionDescription} block>
            {currentQuestion.description}
          </Text>
        )}

        {/* Input Method Toggle */}
        {featureFlags.enableVoiceInput && (
          <div className={styles.inputToggle}>
            <ToggleButton
              checked={inputMethod === 'text' && !isRecording}
              icon={<TextDescription24Regular />}
              onClick={() => {
                setInputMethod('text');
                setIsRecording(false);
              }}
            >
              Type response
            </ToggleButton>
            <ToggleButton
              checked={inputMethod === 'voice' || isRecording}
              icon={isRecording ? <Mic24Filled /> : <Mic24Regular />}
              onClick={() => setInputMethod('voice')}
              appearance={isRecording ? 'primary' : undefined}
            >
              {isRecording ? 'Recording...' : 'Voice input'}
            </ToggleButton>
          </div>
        )}

        {/* Voice Recorder */}
        {inputMethod === 'voice' && featureFlags.enableVoiceInput && (
          <VoiceRecorder
            onTranscript={handleTranscript}
            onRecordingChange={setIsRecording}
          />
        )}

        {/* Text Response Area */}
        <Field label="Your response">
          <Textarea
            className={styles.responseArea}
            value={displayText}
            onChange={handleTextChange}
            placeholder={
              inputMethod === 'voice'
                ? 'Your transcribed response will appear here. You can also edit it.'
                : 'Type your response here...'
            }
            resize="vertical"
            size="large"
          />
        </Field>

        {inputMethod === 'voice' && displayText && (
          <div className={styles.transcriptBadge}>
            <Badge appearance="outline" color="informative" icon={<Mic24Regular />}>
              Transcribed from voice
            </Badge>
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div className={styles.actions}>
        <div className={styles.navButtons}>
          {!isFirstQuestion && (
            <Button
              appearance="subtle"
              icon={<ArrowLeft24Regular />}
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              Previous
            </Button>
          )}
        </div>

        <Button
          appearance="primary"
          size="large"
          icon={isLastQuestion ? (isSubmitting ? <Spinner size="tiny" /> : <Checkmark24Regular />) : <ArrowRight24Regular />}
          iconPosition="after"
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
        >
          {isLastQuestion ? (isSubmitting ? 'Submitting...' : 'Submit Survey') : 'Next Question'}
        </Button>
      </div>
    </Card>
  );
}
