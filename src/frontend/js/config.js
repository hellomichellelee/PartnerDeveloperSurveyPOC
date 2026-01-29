/**
 * Azure Speech Service Configuration
 * 
 * IMPORTANT: For production, use Azure Key Vault or environment variables.
 * Never commit real keys to source control.
 */

const SpeechConfig = {
    // Azure Speech Service settings
    // Get these from Azure Portal > Speech Service > Keys and Endpoint
    subscriptionKey: 'YOUR_SPEECH_KEY_HERE',
    region: 'eastus', // e.g., 'eastus', 'westus2', 'westeurope'
    
    // Recognition settings
    language: 'en-US',
    
    // API endpoints
    apiBaseUrl: '/api', // Azure Functions API base URL
};

// Survey questions configuration
const SurveyQuestions = [
    {
        id: 'q1',
        text: 'What are the main challenges you face in your daily workflow?',
        type: 'open-text'
    },
    {
        id: 'q2', 
        text: 'How would you describe your experience with our current tools?',
        type: 'open-text'
    },
    {
        id: 'q3',
        text: 'What features would you most like to see improved or added?',
        type: 'open-text'
    },
    {
        id: 'q4',
        text: 'Can you describe a recent situation where you felt frustrated with the product?',
        type: 'open-text'
    },
    {
        id: 'q5',
        text: 'What would make you recommend this product to a colleague?',
        type: 'open-text'
    }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpeechConfig, SurveyQuestions };
}
