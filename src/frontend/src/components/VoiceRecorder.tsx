import { useState, useCallback, useRef, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Text,
  Spinner,
} from '@fluentui/react-components';
import {
  Mic24Regular,
  MicOff24Regular,
} from '@fluentui/react-icons';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { azureConfig } from '../config/survey';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
});

interface VoiceRecorderProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  onRecordingChange: (isRecording: boolean) => void;
  isRecording: boolean;
}

export function VoiceRecorder({ onTranscript, onRecordingChange, isRecording }: VoiceRecorderProps) {
  const styles = useStyles();
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);

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
    onRecordingChange(false);
  }, [onRecordingChange]);

  // Stop recording when isRecording prop changes to false externally
  useEffect(() => {
    if (!isRecording && recognizerRef.current) {
      stopRecording();
    }
  }, [isRecording, stopRecording]);

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
      if (!azureConfig.speech.subscriptionKey || !azureConfig.speech.region) {
        setError('Azure Speech service is not configured.');
        setIsInitializing(false);
        return;
      }

      // Request microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (permissionError) {
        if (permissionError instanceof DOMException) {
          if (permissionError.name === 'NotAllowedError') {
            setError('Microphone access was denied.');
          } else if (permissionError.name === 'NotFoundError') {
            setError('No microphone found.');
          } else {
            setError(`Microphone error: ${permissionError.message}`);
          }
        } else {
          setError('Could not access microphone.');
        }
        setIsInitializing(false);
        return;
      }

      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        azureConfig.speech.subscriptionKey,
        azureConfig.speech.region
      );
      speechConfig.speechRecognitionLanguage = azureConfig.speech.language;

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

      recognizer.recognizing = (_, event) => {
        if (event.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
          onTranscript(event.result.text, false);
        }
      };

      recognizer.recognized = (_, event) => {
        if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          onTranscript(event.result.text, true);
        }
      };

      recognizer.canceled = (_, event) => {
        if (event.reason === SpeechSDK.CancellationReason.Error) {
          setError(`Speech service error: ${event.errorDetails}`);
        }
        stopRecording();
      };

      recognizer.sessionStopped = () => {
        stopRecording();
      };

      await recognizer.startContinuousRecognitionAsync();
      recognizerRef.current = recognizer;
      onRecordingChange(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Recording error: ${errorMessage}`);
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
      <Button
        appearance={isRecording ? 'primary' : 'secondary'}
        icon={
          isInitializing ? (
            <Spinner size="tiny" />
          ) : isRecording ? (
            <MicOff24Regular />
          ) : (
            <Mic24Regular />
          )
        }
        onClick={toggleRecording}
        disabled={isInitializing}
      >
        {isInitializing ? 'Starting...' : isRecording ? 'Stop voice input' : 'Start voice input'}
      </Button>

      {error && (
        <Text className={styles.errorText}>{error}</Text>
      )}
    </div>
  );
}
