// =============================================================================
// Research Feedback Processing & Insights Platform
// Main Bicep Deployment Template
// =============================================================================

targetScope = 'resourceGroup'

// -----------------------------------------------------------------------------
// Parameters
// -----------------------------------------------------------------------------

@description('The environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environmentName string = 'dev'

@description('The Azure region for all resources')
param location string = resourceGroup().location

@description('Base name for all resources')
@minLength(3)
@maxLength(20)
param baseName string = 'surveyplatform'

@description('SQL Administrator login username')
@secure()
param sqlAdminLogin string

@description('SQL Administrator login password')
@secure()
param sqlAdminPassword string

@description('Tags to apply to all resources')
param tags object = {
  project: 'Research-Feedback-Platform'
  environment: environmentName
}

// -----------------------------------------------------------------------------
// Variables
// -----------------------------------------------------------------------------

var resourcePrefix = '${baseName}-${environmentName}'
var uniqueSuffix = uniqueString(resourceGroup().id, baseName)

// Resource names
var staticWebAppName = 'swa-${resourcePrefix}'
var storageAccountName = 'st${replace(baseName, '-', '')}${uniqueSuffix}'
var sqlServerName = 'sql-${resourcePrefix}-${uniqueSuffix}'
var sqlDatabaseName = 'sqldb-responses'
var speechServiceName = 'speech-${resourcePrefix}'
var languageServiceName = 'lang-${resourcePrefix}'
var appInsightsName = 'appi-${resourcePrefix}'
var logAnalyticsName = 'log-${resourcePrefix}'

// -----------------------------------------------------------------------------
// Log Analytics Workspace (for Application Insights)
// -----------------------------------------------------------------------------

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// -----------------------------------------------------------------------------
// Application Insights
// -----------------------------------------------------------------------------

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// -----------------------------------------------------------------------------
// Storage Account (for Azure Functions)
// -----------------------------------------------------------------------------

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: take(storageAccountName, 24)
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

// Storage Queue for async processing
resource queueService 'Microsoft.Storage/storageAccounts/queueServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource processingQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2023-01-01' = {
  parent: queueService
  name: 'response-processing'
}

// -----------------------------------------------------------------------------
// Azure SQL Server and Database
// -----------------------------------------------------------------------------

resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: sqlServerName
  location: location
  tags: tags
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// Allow Azure services to access SQL Server
resource sqlFirewallAzure 'Microsoft.Sql/servers/firewallRules@2022-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 5
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648 // 2 GB
  }
}

// -----------------------------------------------------------------------------
// Azure Cognitive Services - Speech
// -----------------------------------------------------------------------------

resource speechService 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: speechServiceName
  location: location
  tags: tags
  kind: 'SpeechServices'
  sku: {
    name: 'F0' // Free tier: 5 hours/month - sufficient for POC
  }
  properties: {
    customSubDomainName: speechServiceName
    publicNetworkAccess: 'Enabled'
  }
}

// -----------------------------------------------------------------------------
// Azure Cognitive Services - Language (Text Analytics)
// -----------------------------------------------------------------------------

resource languageService 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: languageServiceName
  location: location
  tags: tags
  kind: 'TextAnalytics'
  sku: {
    name: 'F0' // Free tier: 5,000 calls/month - sufficient for POC
  }
  properties: {
    customSubDomainName: languageServiceName
    publicNetworkAccess: 'Enabled'
  }
}



// -----------------------------------------------------------------------------
// Azure Static Web App
// -----------------------------------------------------------------------------

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: 'eastus2' // Static Web Apps have limited regions
  tags: union(tags, {
    'azd-service-name': 'web'
  })
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      appLocation: '/frontend'
      outputLocation: ''
      skipGithubActionWorkflowGeneration: true
    }
  }
}

// Static Web App settings for Speech SDK (API is managed by SWA)
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-01-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    AZURE_SPEECH_KEY: speechService.listKeys().key1
    AZURE_SPEECH_REGION: location
    SqlConnectionString: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Database=${sqlDatabaseName};User Id=${sqlAdminLogin};Password=${sqlAdminPassword};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;'
    AZURE_LANGUAGE_ENDPOINT: languageService.properties.endpoint
    AZURE_LANGUAGE_KEY: languageService.listKeys().key1
  }
}

// -----------------------------------------------------------------------------
// Outputs
// -----------------------------------------------------------------------------

@description('Static Web App URL')
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'

// Note: Deployment token should be retrieved via Azure CLI or Portal, not exposed as output
// Use: az staticwebapp secrets list --name <app-name> --resource-group <rg-name>

@description('SQL Server fully qualified domain name')
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName

@description('SQL Database name')
output sqlDatabaseName string = sqlDatabase.name

@description('Speech Service endpoint')
output speechServiceEndpoint string = speechService.properties.endpoint

@description('Speech Service region')
output speechServiceRegion string = location

@description('Language Service endpoint')
output languageServiceEndpoint string = languageService.properties.endpoint

@description('Application Insights connection string')
output appInsightsConnectionString string = appInsights.properties.ConnectionString

@description('Storage account name')
output storageAccountName string = storageAccount.name
