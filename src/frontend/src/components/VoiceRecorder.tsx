import { useState, useCallback, useRef, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Text,
  Card,
  Spinner,
  Link,
} from '@fluentui/react-components';
import {
  Mic24Filled,
  RecordStop24Regular,
} from '@fluentui/react-icons';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { azureConfig } from '../config/survey';

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
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    textAlign: 'center',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
  },
  retryLink: {
    cursor: 'pointer',
  },
  configWarning: {
    color: tokens.colorPaletteYellowForeground1,
    textAlign: 'center',
    fontSize: tokens.fontSizeBase200,
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
  const [errorType, setErrorType] = useState<'permission' | 'config' | 'other' | null>(null);
  
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

  // Define stopRecording first so it can be used in startRecording
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

  const startRecording = useCallback(async () => {
    setError(null);
    setErrorType(null);
    setIsInitializing(true);

    try {
      // Check if Speech SDK is configured
      if (!azureConfig.speech.subscriptionKey || !azureConfig.speech.region) {
        setErrorType('config');
        setError('Azure Speech service is not configured. Please add VITE_AZURE_SPEECH_KEY and VITE_AZURE_SPEECH_REGION environment variables.');
        setIsInitializing(false);
        return;
      }

      // First, explicitly request microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately - we just needed it to get permission
        stream.getTracks().forEach(track => track.stop());
        console.log('Microphone permission granted');
      } catch (permissionError) {
        console.error('Microphone permission denied:', permissionError);
        setErrorType('permission');
        if (permissionError instanceof DOMException) {
          if (permissionError.name === 'NotAllowedError') {
            setError('Microphone access was denied.');
          } else if (permissionError.name === 'NotFoundError') {
            setError('No microphone found. Please connect a microphone and try again.');
          } else if (permissionError.name === 'NotReadableError') {
            setError('Microphone is in use by another application.');
          } else {
            setError(`Microphone error: ${permissionError.message}`);
          }
        } else {
          setError('Could not access microphone.');
        }
        setIsInitializing(false);
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
          setErrorType('config');
          setError(`Speech service error: ${event.errorDetails}`);
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
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // Determine error type for appropriate messaging
      if (errorMessage.includes('subscription') || errorMessage.includes('key') || errorMessage.includes('401') || errorMessage.includes('403')) {
        setErrorType('config');
        setError('Speech service authentication failed. Please check Azure Speech credentials.');
      } else {
        setErrorType('other');
        setError(`Recording error: ${errorMessage}`);
      }
    } finally {
      setIsInitializing(false);
    }
  }, [onTranscript, onRecordingChange, stopRecording]);

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
          <div className={styles.errorContainer}>
            <Text className={styles.errorText} size={200}>
              {error}
            </Text>
            {errorType === 'permission' && (
              <>
                <Link 
                  className={styles.retryLink}
                  onClick={async () => {
                    setError(null);
                    setErrorType(null);
                    // Re-request permission
                    startRecording();
                  }}
                >
                  🔄 Click here to try again
                </Link>
                <Text size={100} style={{ color: tokens.colorNeutralForeground3, textAlign: 'center' }}>
                  If denied, click the 🔒 icon in your browser's address bar to manage permissions
                </Text>
              </>
            )}
            {errorType === 'config' && (
              <Text size={100} className={styles.configWarning}>
                Check that VITE_AZURE_SPEECH_KEY and VITE_AZURE_SPEECH_REGION are set correctly.
              </Text>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
