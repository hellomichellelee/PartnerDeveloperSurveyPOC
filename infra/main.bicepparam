using './main.bicep'

// =============================================================================
// Research Feedback Processing & Insights Platform
// Bicep Parameters File - POC (Cost-Optimized)
// =============================================================================

// Environment Configuration
param environmentName = 'dev'
param baseName = 'rfpsurvey'

// SQL Administrator Credentials
// IMPORTANT: You will be prompted to enter these securely during deployment
param sqlAdminLogin = 'sqladmin'
param sqlAdminPassword = '' // Will be prompted at deployment time

// Resource Tags
param tags = {
  project: 'Research-Feedback-Platform'
  environment: 'dev'
  costCenter: 'UX-Research'
  owner: 'research-team'
  tier: 'poc'
}
