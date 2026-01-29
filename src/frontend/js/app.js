/**
 * Main Application Logic
 * Handles survey flow, user interactions, and API communication
 */

class SurveyApp {
    constructor() {
        this.participant = null;
        this.currentQuestionIndex = 0;
        this.responses = [];
        this.speechRecognizer = new SpeechRecognizer();
        this.inputMode = 'voice';
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindElements();
        this.bindEvents();
        this.setupSpeechCallbacks();
        
        console.log('Survey app initialized');
    }

    /**
     * Cache DOM elements
     */
    bindElements() {
        // Sections
        this.participantSection = document.getElementById('participant-section');
        this.surveySection = document.getElementById('survey-section');
        this.completionSection = document.getElementById('completion-section');

        // Participant form
        this.participantForm = document.getElementById('participant-form');

        // Survey elements
        this.progress = document.getElementById('progress');
        this.currentQuestionSpan = document.getElementById('current-question');
        this.totalQuestionsSpan = document.getElementById('total-questions');
        this.questionText = document.getElementById('question-text');

        // Input mode toggle
        this.toggleBtns = document.querySelectorAll('.toggle-btn');
        this.voiceInput = document.getElementById('voice-input');
        this.textInput = document.getElementById('text-input');

        // Voice input elements
        this.recordBtn = document.getElementById('record-btn');
        this.recordingStatus = document.getElementById('recording-status');
        this.transcriptPreview = document.getElementById('transcript-preview');
        this.transcriptText = document.getElementById('transcript-text');

        // Text input
        this.textResponse = document.getElementById('text-response');

        // Navigation
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.submitBtn = document.getElementById('submit-btn');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Participant form submission
        this.participantForm.addEventListener('submit', (e) => this.handleParticipantSubmit(e));

        // Input mode toggle
        this.toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.toggleInputMode(btn.dataset.mode));
        });

        // Recording button
        this.recordBtn.addEventListener('click', () => this.toggleRecording());

        // Text input changes
        this.textResponse.addEventListener('input', () => this.saveCurrentResponse());

        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.navigateQuestion(-1));
        this.nextBtn.addEventListener('click', () => this.navigateQuestion(1));
        this.submitBtn.addEventListener('click', () => this.submitSurvey());
    }

    /**
     * Set up speech recognizer callbacks
     */
    setupSpeechCallbacks() {
        this.speechRecognizer.onTranscriptUpdate = (transcript, isFinal) => {
            this.transcriptText.textContent = transcript || 'Listening...';
            this.transcriptPreview.classList.remove('hidden');
            
            if (isFinal) {
                this.saveCurrentResponse();
            }
        };

        this.speechRecognizer.onRecordingStateChange = (isRecording) => {
            this.updateRecordingUI(isRecording);
        };

        this.speechRecognizer.onError = (error) => {
            console.error('Speech recognition error:', error);
            alert('Speech recognition error. Please try again or use text input.');
        };
    }

    /**
     * Handle participant form submission
     */
    handleParticipantSubmit(e) {
        e.preventDefault();

        this.participant = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            consentGiven: document.getElementById('consent').checked,
            consentTimestamp: new Date().toISOString()
        };

        // Initialize responses array
        this.responses = SurveyQuestions.map(q => ({
            questionId: q.id,
            questionText: q.text,
            response: '',
            inputMode: null,
            timestamp: null
        }));

        // Update UI
        this.totalQuestionsSpan.textContent = SurveyQuestions.length;
        this.showSection('survey');
        this.displayQuestion(0);
    }

    /**
     * Toggle between voice and text input modes
     */
    toggleInputMode(mode) {
        this.inputMode = mode;

        // Update toggle buttons
        this.toggleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Show/hide input sections
        this.voiceInput.classList.toggle('hidden', mode !== 'voice');
        this.textInput.classList.toggle('hidden', mode !== 'text');

        // Stop recording if switching away from voice
        if (mode !== 'voice' && this.speechRecognizer.isRecording) {
            this.speechRecognizer.stopRecording();
        }

        // Sync content between modes
        if (mode === 'text') {
            const transcript = this.speechRecognizer.getTranscript();
            if (transcript && !this.textResponse.value) {
                this.textResponse.value = transcript;
            }
        }
    }

    /**
     * Toggle recording state
     */
    async toggleRecording() {
        if (this.speechRecognizer.isRecording) {
            await this.speechRecognizer.stopRecording();
        } else {
            this.speechRecognizer.clearTranscript();
            await this.speechRecognizer.startRecording();
        }
    }

    /**
     * Update recording UI state
     */
    updateRecordingUI(isRecording) {
        this.recordBtn.classList.toggle('recording', isRecording);
        this.recordingStatus.classList.toggle('active', isRecording);

        const statusText = this.recordingStatus.querySelector('span');
        const recordIcon = this.recordBtn.querySelector('.record-icon');

        if (isRecording) {
            statusText.textContent = 'Recording...';
            recordIcon.textContent = '⏹';
            this.recordBtn.innerHTML = '<span class="record-icon">⏹</span> Stop Recording';
        } else {
            statusText.textContent = 'Ready to record';
            recordIcon.textContent = '⏺';
            this.recordBtn.innerHTML = '<span class="record-icon">⏺</span> Start Recording';
        }
    }

    /**
     * Display a question
     */
    displayQuestion(index) {
        const question = SurveyQuestions[index];
        
        // Update question display
        this.questionText.textContent = question.text;
        this.currentQuestionSpan.textContent = index + 1;
        
        // Update progress bar
        const progressPercent = ((index + 1) / SurveyQuestions.length) * 100;
        this.progress.style.width = `${progressPercent}%`;

        // Restore previous response if exists
        const savedResponse = this.responses[index];
        if (savedResponse.response) {
            if (savedResponse.inputMode === 'voice') {
                this.transcriptText.textContent = savedResponse.response;
                this.transcriptPreview.classList.remove('hidden');
            }
            this.textResponse.value = savedResponse.response;
        } else {
            this.transcriptText.textContent = '';
            this.transcriptPreview.classList.add('hidden');
            this.textResponse.value = '';
        }

        // Clear speech recognizer for new question
        this.speechRecognizer.clearTranscript();

        // Update navigation buttons
        this.prevBtn.disabled = index === 0;
        
        const isLastQuestion = index === SurveyQuestions.length - 1;
        this.nextBtn.classList.toggle('hidden', isLastQuestion);
        this.submitBtn.classList.toggle('hidden', !isLastQuestion);
    }

    /**
     * Navigate to a different question
     */
    navigateQuestion(direction) {
        // Save current response before navigating
        this.saveCurrentResponse();

        // Stop recording if active
        if (this.speechRecognizer.isRecording) {
            this.speechRecognizer.stopRecording();
        }

        const newIndex = this.currentQuestionIndex + direction;
        
        if (newIndex >= 0 && newIndex < SurveyQuestions.length) {
            this.currentQuestionIndex = newIndex;
            this.displayQuestion(newIndex);
        }
    }

    /**
     * Save the current response
     */
    saveCurrentResponse() {
        let response = '';
        
        if (this.inputMode === 'voice') {
            response = this.speechRecognizer.getTranscript();
        } else {
            response = this.textResponse.value.trim();
        }

        if (response) {
            this.responses[this.currentQuestionIndex] = {
                ...this.responses[this.currentQuestionIndex],
                response: response,
                inputMode: this.inputMode,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Submit the survey
     */
    async submitSurvey() {
        // Save final response
        this.saveCurrentResponse();

        // Stop any active recording
        if (this.speechRecognizer.isRecording) {
            await this.speechRecognizer.stopRecording();
        }

        // Validate responses
        const unanswered = this.responses.filter(r => !r.response).length;
        if (unanswered > 0) {
            const proceed = confirm(`You have ${unanswered} unanswered question(s). Do you want to submit anyway?`);
            if (!proceed) return;
        }

        // Prepare submission data
        const submission = {
            participant: this.participant,
            responses: this.responses.filter(r => r.response),
            submittedAt: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        try {
            // Submit to API
            await this.sendToAPI(submission);
            
            // Show completion
            this.showSection('completion');
            
            console.log('Survey submitted successfully:', submission);
        } catch (error) {
            console.error('Failed to submit survey:', error);
            alert('Failed to submit survey. Please try again.');
        }
    }

    /**
     * Send data to the backend API
     */
    async sendToAPI(data) {
        try {
            const response = await fetch(`${SpeechConfig.apiBaseUrl}/submit-response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            // For demo purposes, log but don't fail
            console.warn('API not available, storing locally:', error);
            
            // Store in localStorage as backup
            const stored = JSON.parse(localStorage.getItem('survey_responses') || '[]');
            stored.push(data);
            localStorage.setItem('survey_responses', JSON.stringify(stored));
            
            return { success: true, stored: 'local' };
        }
    }

    /**
     * Show a specific section
     */
    showSection(section) {
        this.participantSection.classList.add('hidden');
        this.surveySection.classList.add('hidden');
        this.completionSection.classList.add('hidden');

        switch (section) {
            case 'participant':
                this.participantSection.classList.remove('hidden');
                break;
            case 'survey':
                this.surveySection.classList.remove('hidden');
                break;
            case 'completion':
                this.completionSection.classList.remove('hidden');
                break;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.surveyApp = new SurveyApp();
});
