import { useState, useCallback, useRef, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Text,
  Card,
  Badge,
  Spinner,
} from '@fluentui/react-components';
import {
  Mic24Filled,
  RecordStop24Regular,
} from '@fluentui/react-icons';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { azureConfig, featureFlags } from '../config/survey';

const useStyles = makeStyles({
  container: {
    marginBottom: tokens.spacingVerticalL,
  },
  recordingCard: {
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalM,
  },
  recordButton: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  pulsingDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: tokens.colorPaletteRedBackground3,
    animationName: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.3 },
    },
    animationDuration: '1s',
    animationIterationCount: 'infinite',
  },
  interimText: {
    fontStyle: 'italic',
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
    minHeight: '24px',
  },
  statusBadge: {
    marginTop: tokens.spacingVerticalS,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    textAlign: 'center',
  },
});

interface VoiceRecorderProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  onRecordingChange: (isRecording: boolean) => void;
}

export function VoiceRecorder({ onTranscript, onRecordingChange }: VoiceRecorderProps) {
  const styles = useStyles();
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.close();
        recognizerRef.current = null;
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setIsInitializing(true);

    try {
      // Check if we should use mock mode
      if (featureFlags.useMockSpeechService) {
        console.log('Using mock speech service (no Azure Speech key configured)');
        setIsRecording(true);
        onRecordingChange(true);
        setIsInitializing(false);
        
        // Simulate transcription after a delay
        setTimeout(() => {
          onTranscript('This is a simulated transcription for development purposes.', true);
        }, 2000);
        return;
      }

      // Initialize Azure Speech SDK
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        azureConfig.speech.subscriptionKey,
        azureConfig.speech.region
      );
      speechConfig.speechRecognitionLanguage = azureConfig.speech.language;

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

      // Set up event handlers
      recognizer.recognizing = (_, event) => {
        if (event.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
          setInterimText(event.result.text);
          onTranscript(event.result.text, false);
        }
      };

      recognizer.recognized = (_, event) => {
        if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          setInterimText('');
          onTranscript(event.result.text, true);
        } else if (event.result.reason === SpeechSDK.ResultReason.NoMatch) {
          console.log('Speech could not be recognized');
        }
      };

      recognizer.canceled = (_, event) => {
        if (event.reason === SpeechSDK.CancellationReason.Error) {
          console.error('Speech recognition error:', event.errorDetails);
          setError(`Recognition error: ${event.errorDetails}`);
        }
        stopRecording();
      };

      recognizer.sessionStopped = () => {
        stopRecording();
      };

      // Start continuous recognition
      await recognizer.startContinuousRecognitionAsync();
      recognizerRef.current = recognizer;
      setIsRecording(true);
      onRecordingChange(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    } finally {
      setIsInitializing(false);
    }
  }, [onTranscript, onRecordingChange]);

  const stopRecording = useCallback(async () => {
    if (recognizerRef.current) {
      try {
        await recognizerRef.current.stopContinuousRecognitionAsync();
        recognizerRef.current.close();
        recognizerRef.current = null;
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    setIsRecording(false);
    setInterimText('');
    onRecordingChange(false);
  }, [onRecordingChange]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <div className={styles.container}>
      <Card className={styles.recordingCard}>
        <Button
          className={styles.recordButton}
          appearance={isRecording ? 'primary' : 'secondary'}
          shape="circular"
          size="large"
          icon={
            isInitializing ? (
              <Spinner size="small" />
            ) : isRecording ? (
              <RecordStop24Regular />
            ) : (
              <Mic24Filled />
            )
          }
          onClick={toggleRecording}
          disabled={isInitializing}
        />

        {isRecording && (
          <div className={styles.recordingIndicator}>
            <div className={styles.pulsingDot} />
            <Text size={300} weight="semibold">
              Recording... Click to stop
            </Text>
          </div>
        )}

        {!isRecording && !isInitializing && (
          <Text size={300}>Click to start voice recording</Text>
        )}

        {interimText && (
          <Text className={styles.interimText} size={200}>
            {interimText}
          </Text>
        )}

        {error && (
          <Text className={styles.errorText} size={200}>
            {error}
          </Text>
        )}

        {featureFlags.useMockSpeechService && (
          <div className={styles.statusBadge}>
            <Badge appearance="outline" color="warning">
              Mock Mode (No Azure Speech key)
            </Badge>
          </div>
        )}
      </Card>
    </div>
  );
}
