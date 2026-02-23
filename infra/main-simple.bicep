// =============================================================================
// Research Feedback Processing & Insights Platform
// Simplified Bicep Template for POC (No separate Function App quota needed)
// Uses Static Web App's built-in managed functions
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
param baseName string = 'rfpsurvey'

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

// -----------------------------------------------------------------------------
// Storage Account (for queue processing if needed later)
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
// Azure Cognitive Services - Speech (Free tier)
// -----------------------------------------------------------------------------

resource speechService 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: speechServiceName
  location: location
  tags: tags
  kind: 'SpeechServices'
  sku: {
    name: 'F0' // Free tier: 5 hours/month
  }
  properties: {
    customSubDomainName: speechServiceName
    publicNetworkAccess: 'Enabled'
  }
}

// -----------------------------------------------------------------------------
// Azure Static Web App (Free tier with managed functions)
// -----------------------------------------------------------------------------

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: 'eastus2'
  tags: union(tags, {
    'azd-service-name': 'web'
  })
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      appLocation: '/src/frontend'
      apiLocation: '/src/api'
      outputLocation: 'dist'
      skipGithubActionWorkflowGeneration: true
    }
  }
}

// Static Web App application settings
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-01-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    AZURE_SQL_CONNECTION_STRING: 'Driver={ODBC Driver 18 for SQL Server};Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Database=${sqlDatabaseName};Uid=${sqlAdminLogin};Pwd=${sqlAdminPassword};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;'
    AZURE_SPEECH_KEY: speechService.listKeys().key1
    AZURE_SPEECH_REGION: location
  }
}

// -----------------------------------------------------------------------------
// Outputs
// -----------------------------------------------------------------------------

@description('Static Web App URL')
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'

@description('Static Web App name')
output staticWebAppName string = staticWebApp.name

@description('SQL Server fully qualified domain name')
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName

@description('SQL Database name')
output sqlDatabaseName string = sqlDatabase.name

// Note: Connection string should be constructed at runtime using Key Vault secrets
// SQL Server FQDN and Database name are provided as separate outputs above

@description('Speech Service endpoint')
output speechServiceEndpoint string = speechService.properties.endpoint

@description('Speech Service region')
output speechServiceRegion string = location

@description('Storage account name')
output storageAccountName string = storageAccount.name
