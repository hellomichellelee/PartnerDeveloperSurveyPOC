# Research Feedback Processing & Insights Platform

A lightweight, scalable platform for collecting spoken or written open-text research responses, automatically processing them for topic extraction, sentiment analysis, and presenting results in a review dashboard.

## � Live Demo

**Production URL:** https://proud-glacier-09697480f.2.azurestaticapps.net

## 🏗️ Project Structure

```
Partner_Developer_Survey/
├── src/
│   ├── frontend/           # React + Fluent UI 2 frontend
│   │   ├── src/            # React components
│   │   ├── dist/           # Built output
│   │   └── package.json
│   │
│   └── api/                # Azure Functions (Python 3.10)
│       ├── SubmitResponse/ # POST /api/submit-response
│       ├── GetResponses/   # GET /api/responses
│       ├── GetSentimentSummary/ # GET /api/sentiment-summary
│       ├── GetQuestions/   # GET /api/questions
│       ├── ProcessResponses/ # POST /api/process-responses
│       ├── health/         # GET /api/health
│       ├── shared/         # Shared Python modules
│       └── requirements.txt
│
├── infra/                  # Infrastructure as Code (Bicep)
│   ├── main-simple.bicep   # Simplified deployment
│   └── modules/
│
├── scripts/                # Utility scripts
│   └── init_database.py    # SQL schema initialization
│
├── docs/                   # Documentation
│   └── PRD.md
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://python.org/) (v3.11+)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [Azure Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/)

### Local Development

1. **Install frontend dependencies:**
   ```bash
   cd src/frontend
   npm install
   ```

2. **Run frontend locally:**
   ```bash
   npm run dev
   ```

3. **Run API locally (requires Azure Functions Core Tools):**
   ```bash
   cd src/api
   func start
   ```

### Deploy to Azure

1. **Build the frontend:**
   ```bash
   cd src/frontend
   npm run build
   ```

2. **Deploy using SWA CLI:**
   ```bash
   npx @azure/static-web-apps-cli deploy \
     --app-location "./src/frontend/dist" \
     --api-location "./src/api" \
     --api-language "python" \
     --api-version "3.10" \
     --deployment-token "<YOUR_TOKEN>"
   ```

## 🔧 Azure Services Used

| Service | Purpose | Tier |
|---------|---------|------|
| Azure Static Web Apps | Host React frontend + Python API | Free |
| Azure SQL Database | Store survey responses | Basic ($5/mo) |
| Azure Speech Services | Audio transcription | F0 (Free) |
| Azure AI Language | Sentiment & key phrase extraction | F0 (Free) |
| Azure Storage | Function app storage | Standard |

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/submit-response` | POST | Submit survey responses |
| `/api/responses` | GET | Get all responses with sentiment |
| `/api/sentiment-summary` | GET | Get sentiment statistics |
| `/api/questions` | GET | Get survey questions |
| `/api/process-responses` | POST/GET | Process pending responses |
| `/api/health` | GET | Health check |
| `/api/test-db` | GET | Storage diagnostic |

## ⚠️ Current Limitations (POC)

The current deployment uses **in-memory storage** with **mock sentiment analysis** because:
- SWA managed functions don't properly install Python dependencies from requirements.txt
- The Azure Functions consumption quota in the subscription is 0

### Data Persistence
- Data is stored in memory and **resets on cold start**
- For production, see the "Production Upgrade" section below

### Sentiment Analysis
- Uses keyword-based mock analysis instead of Azure AI Language
- Positive keywords: great, excellent, love, amazing, wonderful, fantastic, good, best, awesome, happy, recommend, helpful, satisfied, impressive, valuable
- Negative keywords: bad, terrible, hate, awful, horrible, poor, worst, disappointed, frustrating, annoying, slow, broken, useless, difficult, confusing

## 🔄 Production Upgrade Options

### Option 1: GitHub Actions Deployment (Recommended)
GitHub Actions deployment properly triggers the Oryx build which installs Python dependencies.

1. Connect your repo to the Static Web App via GitHub
2. The workflow will use remote build to install dependencies
3. Update `requirements.txt` to include:
   ```
   azure-functions
   pymssql
   azure-ai-textanalytics==5.3.0
   ```
4. Update the shared/database.py to use pymssql
5. Set environment variables in Azure Portal for SQL connection string

### Option 2: Bring Your Own Azure Functions
Link a separate Azure Functions app with proper Python support:

1. Create an Azure Functions app (Python 3.10+, Linux, Consumption or Premium)
2. Deploy the functions from `src/api/`
3. Link to the Static Web App in Azure Portal → Static Web App → Settings → APIs

### Option 3: Request Quota Increase
If you need standalone Azure Functions:

1. Go to Azure Portal → Subscriptions → Usage + quotas
2. Request increase for "Dynamic Windows" in your region
3. Deploy using the full `infra/main.bicep` template

## 📋 Features

- ✅ Modern React frontend with Fluent UI 2
- ✅ Audio recording with real-time transcription (Speech SDK)
- ✅ Text input alternative
- ✅ Consent capture with participant info
- ✅ Automatic sentiment analysis (mock for POC)
- ✅ Key phrase/topic extraction
- ✅ API endpoints for data access

## 🗄️ Database Schema

The SQL database (when connected) includes:
- `participants` - Survey participant information
- `responses` - Individual question responses with sentiment
- `questions` - Survey question definitions
- `vw_responses_with_participants` - View joining responses with participants
- `vw_sentiment_summary` - Aggregated sentiment statistics

Initialize with: `python scripts/init_database.py`

## 📄 License

Internal Microsoft Use Only
