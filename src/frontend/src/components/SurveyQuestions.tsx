import { useState, useCallback, useRef, useEffect } from 'react';
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
  Spinner,
} from '@fluentui/react-components';
import {
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
  voiceInputSection: {
    marginBottom: tokens.spacingVerticalM,
  },
  responseArea: {
    minHeight: '150px',
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
  const [interimText, setInterimText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Ref to track the latest confirmed text for voice appending
  const confirmedTextRef = useRef('');

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const existingResponse = responses.get(currentQuestion.id);
  const confirmedText = currentText !== '' ? currentText : (existingResponse?.responseText || '');
  const displayText = confirmedText + (interimText ? (confirmedText ? ' ' : '') + interimText : '');

  // Keep ref in sync with confirmed text
  useEffect(() => {
    confirmedTextRef.current = confirmedText;
  }, [confirmedText]);

  const saveCurrentResponse = useCallback(() => {
    if (confirmedText.trim()) {
      const response: SurveyResponse = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        responseText: confirmedText.trim(),
        inputMethod,
        timestamp: new Date().toISOString(),
      };
      setResponses(prev => new Map(prev).set(currentQuestion.id, response));
    }
  }, [currentQuestion, confirmedText, inputMethod]);

  const handleNext = useCallback(() => {
    saveCurrentResponse();
    setCurrentText('');
    setInterimText('');
    confirmedTextRef.current = '';
    
    if (isLastQuestion) {
      const allResponses = Array.from(responses.values());
      if (confirmedText.trim()) {
        allResponses.push({
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          responseText: confirmedText.trim(),
          inputMethod,
          timestamp: new Date().toISOString(),
        });
      }
      onComplete(allResponses);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [saveCurrentResponse, isLastQuestion, responses, confirmedText, currentQuestion, inputMethod, onComplete]);

  const handlePrevious = useCallback(() => {
    saveCurrentResponse();
    setCurrentText('');
    setInterimText('');
    confirmedTextRef.current = '';
    setCurrentIndex(prev => prev - 1);
  }, [saveCurrentResponse]);

  const handleTextChange = useCallback((_: unknown, data: { value: string }) => {
    setCurrentText(data.value);
    setInterimText('');
    setInputMethod('text');
  }, []);

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      // Use ref to get the latest text and append
      const base = confirmedTextRef.current;
      const newText = base + (base ? ' ' : '') + text;
      setCurrentText(newText);
      setInterimText('');
      setInputMethod('voice');
    } else {
      setInterimText(text);
    }
  }, []);

  const handleTextareaFocus = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setInterimText('');
    }
  }, [isRecording]);

  const handleRecordingChange = useCallback((recording: boolean) => {
    setIsRecording(recording);
    if (!recording) {
      setInterimText('');
    }
  }, []);

  const canProceed = confirmedText.trim().length > 0 || !currentQuestion.required;

  return (
    <Card className={styles.card}>
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

        {featureFlags.enableVoiceInput && (
          <div className={styles.voiceInputSection}>
            <VoiceRecorder
              onTranscript={handleTranscript}
              onRecordingChange={handleRecordingChange}
              isRecording={isRecording}
            />
          </div>
        )}

        <Field label="Your response">
          <Textarea
            className={styles.responseArea}
            value={displayText}
            onChange={handleTextChange}
            onFocus={handleTextareaFocus}
            placeholder="Type your response here..."
            resize="vertical"
            size="large"
          />
        </Field>
      </div>

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
