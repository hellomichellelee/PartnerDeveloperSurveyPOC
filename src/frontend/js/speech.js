/**
 * Azure Speech Service Integration
 * Handles speech-to-text recognition using Azure Cognitive Services
 */

class SpeechRecognizer {
    constructor() {
        this.recognizer = null;
        this.isRecording = false;
        this.transcript = '';
        this.onTranscriptUpdate = null;
        this.onRecordingStateChange = null;
        this.onError = null;
    }

    /**
     * Initialize the speech recognizer with Azure credentials
     */
    async initialize() {
        try {
            // Check if Speech SDK is loaded
            if (typeof SpeechSDK === 'undefined') {
                throw new Error('Azure Speech SDK not loaded');
            }

            // Validate configuration
            if (SpeechConfig.subscriptionKey === 'YOUR_SPEECH_KEY_HERE') {
                console.warn('Speech Service not configured. Using mock mode.');
                return false;
            }

            // Create speech configuration
            const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
                SpeechConfig.subscriptionKey,
                SpeechConfig.region
            );
            
            speechConfig.speechRecognitionLanguage = SpeechConfig.language;
            
            // Enable continuous recognition for better accuracy
            speechConfig.setProperty(
                SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs,
                "15000"
            );
            
            speechConfig.setProperty(
                SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
                "5000"
            );

            // Create audio configuration from default microphone
            const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

            // Create the recognizer
            this.recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

            // Set up event handlers
            this.setupEventHandlers();

            console.log('Speech recognizer initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize speech recognizer:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    }

    /**
     * Set up event handlers for speech recognition
     */
    setupEventHandlers() {
        if (!this.recognizer) return;

        // Handle intermediate results (while speaking)
        this.recognizer.recognizing = (sender, event) => {
            if (event.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
                const interimTranscript = this.transcript + event.result.text;
                if (this.onTranscriptUpdate) {
                    this.onTranscriptUpdate(interimTranscript, false);
                }
            }
        };

        // Handle final results
        this.recognizer.recognized = (sender, event) => {
            if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                this.transcript += event.result.text + ' ';
                if (this.onTranscriptUpdate) {
                    this.onTranscriptUpdate(this.transcript.trim(), true);
                }
            } else if (event.result.reason === SpeechSDK.ResultReason.NoMatch) {
                console.log('No speech recognized');
            }
        };

        // Handle session events
        this.recognizer.sessionStarted = (sender, event) => {
            console.log('Speech session started');
        };

        this.recognizer.sessionStopped = (sender, event) => {
            console.log('Speech session stopped');
            this.isRecording = false;
            if (this.onRecordingStateChange) {
                this.onRecordingStateChange(false);
            }
        };

        // Handle cancellation/errors
        this.recognizer.canceled = (sender, event) => {
            console.log('Speech recognition canceled:', event.reason);
            this.isRecording = false;
            if (this.onRecordingStateChange) {
                this.onRecordingStateChange(false);
            }
            
            if (event.reason === SpeechSDK.CancellationReason.Error) {
                const error = new Error(`Speech recognition error: ${event.errorDetails}`);
                if (this.onError) {
                    this.onError(error);
                }
            }
        };
    }

    /**
     * Start speech recognition
     */
    async startRecording() {
        if (this.isRecording) {
            console.log('Already recording');
            return;
        }

        // Reset transcript for new recording
        this.transcript = '';

        // Check if recognizer is initialized
        if (!this.recognizer) {
            const initialized = await this.initialize();
            if (!initialized) {
                // Use mock mode for demo
                return this.startMockRecording();
            }
        }

        try {
            // Start continuous recognition
            await this.recognizer.startContinuousRecognitionAsync(
                () => {
                    this.isRecording = true;
                    if (this.onRecordingStateChange) {
                        this.onRecordingStateChange(true);
                    }
                    console.log('Recording started');
                },
                (error) => {
                    console.error('Failed to start recording:', error);
                    if (this.onError) {
                        this.onError(error);
                    }
                }
            );
        } catch (error) {
            console.error('Error starting recording:', error);
            if (this.onError) {
                this.onError(error);
            }
        }
    }

    /**
     * Stop speech recognition
     */
    async stopRecording() {
        if (!this.isRecording) {
            console.log('Not recording');
            return this.transcript;
        }

        // Check if using mock mode
        if (this.mockMode) {
            return this.stopMockRecording();
        }

        if (!this.recognizer) {
            return this.transcript;
        }

        try {
            await this.recognizer.stopContinuousRecognitionAsync(
                () => {
                    this.isRecording = false;
                    if (this.onRecordingStateChange) {
                        this.onRecordingStateChange(false);
                    }
                    console.log('Recording stopped');
                },
                (error) => {
                    console.error('Failed to stop recording:', error);
                }
            );
        } catch (error) {
            console.error('Error stopping recording:', error);
        }

        return this.transcript;
    }

    /**
     * Mock recording for demo/development when Speech Service is not configured
     */
    startMockRecording() {
        this.mockMode = true;
        this.isRecording = true;
        
        if (this.onRecordingStateChange) {
            this.onRecordingStateChange(true);
        }

        // Simulate speech recognition with sample text
        const mockPhrases = [
            "I think the main challenge is...",
            "The workflow could be improved by...",
            "What I really appreciate is...",
            "One suggestion would be..."
        ];

        let phraseIndex = 0;
        this.mockInterval = setInterval(() => {
            if (phraseIndex < mockPhrases.length && this.isRecording) {
                this.transcript += mockPhrases[phraseIndex] + ' ';
                if (this.onTranscriptUpdate) {
                    this.onTranscriptUpdate(this.transcript.trim(), true);
                }
                phraseIndex++;
            }
        }, 2000);

        console.log('Mock recording started (Speech Service not configured)');
    }

    /**
     * Stop mock recording
     */
    stopMockRecording() {
        this.isRecording = false;
        this.mockMode = false;
        
        if (this.mockInterval) {
            clearInterval(this.mockInterval);
            this.mockInterval = null;
        }

        if (this.onRecordingStateChange) {
            this.onRecordingStateChange(false);
        }

        console.log('Mock recording stopped');
        return this.transcript;
    }

    /**
     * Get the current transcript
     */
    getTranscript() {
        return this.transcript.trim();
    }

    /**
     * Clear the current transcript
     */
    clearTranscript() {
        this.transcript = '';
    }

    /**
     * Dispose of the recognizer
     */
    dispose() {
        if (this.mockInterval) {
            clearInterval(this.mockInterval);
        }
        
        if (this.recognizer) {
            this.recognizer.close();
            this.recognizer = null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpeechRecognizer };
}
