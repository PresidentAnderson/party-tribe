#!/usr/bin/env node

/**
 * Environment Setup Agent
 * Validates and manages environment configurations across all environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EnvironmentSetupAgent {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
    this.partyTribeRoot = path.join(this.projectRoot, 'party-tribe');
    this.logFile = path.join(__dirname, 'logs/environment-setup.log');
    this.startTime = Date.now();
    this.environments = ['development', 'staging', 'production'];
    this.envConfig = {
      development: {},
      staging: {},
      production: {},
      validation: {}
    };
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(logMessage);
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async validateRequiredVariables() {
    this.log('🔍 Validating required environment variables...');
    
    const requiredVars = {
      // Database
      DATABASE_URL: {
        required: true,
        description: 'PostgreSQL database connection string',
        example: 'postgresql://user:password@localhost:5432/partytribe',
        validation: (value) => value.startsWith('postgresql://') || value.startsWith('postgres://')
      },
      
      // Authentication
      NEXTAUTH_SECRET: {
        required: true,
        description: 'Secret key for NextAuth.js sessions',
        example: 'your-secret-key-here',
        validation: (value) => value.length >= 32
      },
      NEXTAUTH_URL: {
        required: true,
        description: 'Base URL for NextAuth.js',
        example: 'http://localhost:3000',
        validation: (value) => value.startsWith('http')
      },
      
      // OAuth Providers (Optional)
      GOOGLE_CLIENT_ID: {
        required: false,
        description: 'Google OAuth client ID',
        example: 'your-google-client-id.googleusercontent.com'
      },
      GOOGLE_CLIENT_SECRET: {
        required: false,
        description: 'Google OAuth client secret',
        example: 'your-google-client-secret'
      },
      GITHUB_CLIENT_ID: {
        required: false,
        description: 'GitHub OAuth client ID',
        example: 'your-github-client-id'
      },
      GITHUB_CLIENT_SECRET: {
        required: false,
        description: 'GitHub OAuth client secret',
        example: 'your-github-client-secret'
      },
      
      // External Services (Optional)
      STRIPE_SECRET_KEY: {
        required: false,
        description: 'Stripe secret key for payments',
        example: 'sk_test_...'
      },
      STRIPE_WEBHOOK_SECRET: {
        required: false,
        description: 'Stripe webhook secret',
        example: 'whsec_...'
      },
      SENDGRID_API_KEY: {
        required: false,
        description: 'SendGrid API key for emails',
        example: 'SG...'
      },
      
      // File Storage (Optional)
      AWS_S3_BUCKET: {
        required: false,
        description: 'AWS S3 bucket name',
        example: 'party-tribe-assets'
      },
      AWS_ACCESS_KEY_ID: {
        required: false,
        description: 'AWS access key ID',
        example: 'AKIA...'
      },
      AWS_SECRET_ACCESS_KEY: {
        required: false,
        description: 'AWS secret access key',
        example: 'your-aws-secret'
      },
      AWS_REGION: {
        required: false,
        description: 'AWS region',
        example: 'us-east-1'
      }
    };

    this.envConfig.validation.requiredVars = requiredVars;
    this.log(`📋 Configured ${Object.keys(requiredVars).length} environment variables for validation`);
  }

  async scanEnvironmentFiles() {
    this.log('📁 Scanning environment files...');
    
    const envFiles = [
      { name: 'development', path: path.join(this.partyTribeRoot, '.env.local') },
      { name: 'development-example', path: path.join(this.partyTribeRoot, '.env.example') },
      { name: 'web-development', path: path.join(this.partyTribeRoot, 'apps/web/.env.local') },
      { name: 'admin-development', path: path.join(this.partyTribeRoot, 'apps/admin/.env.local') }
    ];

    for (const envFile of envFiles) {
      if (fs.existsSync(envFile.path)) {
        const content = fs.readFileSync(envFile.path, 'utf8');
        this.envConfig[envFile.name] = this.parseEnvFile(content);
        this.log(`✅ Found environment file: ${envFile.name}`);
      } else {
        this.log(`⚠️ Environment file not found: ${envFile.name}`, 'WARN');
        this.envConfig[envFile.name] = {};
      }
    }
  }

  parseEnvFile(content) {
    const config = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=');
          // Remove quotes if present
          value = value.replace(/^["']|["']$/g, '');
          config[key] = value;
        }
      }
    }
    
    return config;
  }

  async validateEnvironmentSecurity() {
    this.log('🔒 Validating environment security...');
    
    const securityChecks = [];
    
    // Check for exposed secrets in git
    try {
      const gitFiles = execSync('git ls-files', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).split('\n');
      
      const exposedEnvFiles = gitFiles.filter(file => 
        file.includes('.env') && 
        !file.includes('.example') && 
        !file.includes('.template')
      );
      
      if (exposedEnvFiles.length > 0) {
        securityChecks.push({
          type: 'error',
          message: `Environment files tracked in git: ${exposedEnvFiles.join(', ')}`
        });
      } else {
        securityChecks.push({
          type: 'success',
          message: 'No environment files exposed in git'
        });
      }
    } catch (error) {
      securityChecks.push({
        type: 'warning',
        message: 'Could not check git for exposed files'
      });
    }

    // Check for weak secrets
    for (const [envName, config] of Object.entries(this.envConfig)) {
      if (config.NEXTAUTH_SECRET) {
        if (config.NEXTAUTH_SECRET === 'your-nextauth-secret-here' || 
            config.NEXTAUTH_SECRET.length < 32) {
          securityChecks.push({
            type: 'error',
            message: `Weak NEXTAUTH_SECRET in ${envName}`
          });
        }
      }
    }

    // Check for production URLs in development
    if (this.envConfig.development.NEXTAUTH_URL && 
        !this.envConfig.development.NEXTAUTH_URL.includes('localhost')) {
      securityChecks.push({
        type: 'warning',
        message: 'Development environment using non-localhost URL'
      });
    }

    this.envConfig.validation.securityChecks = securityChecks;
    
    const errors = securityChecks.filter(check => check.type === 'error');
    const warnings = securityChecks.filter(check => check.type === 'warning');
    
    this.log(`🔒 Security validation complete: ${errors.length} errors, ${warnings.length} warnings`);
    
    if (errors.length > 0) {
      errors.forEach(error => this.log(`❌ ${error.message}`, 'ERROR'));
    }
    if (warnings.length > 0) {
      warnings.forEach(warning => this.log(`⚠️ ${warning.message}`, 'WARN'));
    }
  }

  async generateSecureSecrets() {
    this.log('🔐 Generating secure secrets...');
    
    const secrets = {
      NEXTAUTH_SECRET: crypto.randomBytes(32).toString('hex'),
      STRIPE_WEBHOOK_SECRET: `whsec_${crypto.randomBytes(32).toString('hex')}`,
      API_SECRET: crypto.randomBytes(24).toString('base64'),
      ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex')
    };

    const secretsPath = path.join(__dirname, 'config/generated-secrets.json');
    const configDir = path.dirname(secretsPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 2));
    this.log(`🔐 Secure secrets generated: ${secretsPath}`);
    this.log('⚠️ Remember to use these secrets in your production environment', 'WARN');
  }

  async createEnvironmentTemplates() {
    this.log('📝 Creating environment templates...');
    
    const templates = {
      '.env.local': this.createDevelopmentTemplate(),
      '.env.staging': this.createStagingTemplate(),
      '.env.production': this.createProductionTemplate()
    };

    const templatesDir = path.join(__dirname, 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    for (const [filename, content] of Object.entries(templates)) {
      const templatePath = path.join(templatesDir, filename);
      fs.writeFileSync(templatePath, content);
      this.log(`📝 Template created: ${filename}`);
    }
  }

  createDevelopmentTemplate() {
    return `# Development Environment Configuration
# Copy this file to party-tribe/.env.local and update values

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/partytribe?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${crypto.randomBytes(32).toString('hex')}"

# OAuth Providers (Optional - add real values when ready)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""

# External Services (Optional - add real values when ready)
# STRIPE_SECRET_KEY=""
# STRIPE_WEBHOOK_SECRET=""
# SENDGRID_API_KEY=""

# File Storage (Optional - add real values when ready)
# AWS_S3_BUCKET=""
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_REGION="us-east-1"

# Development Settings
NODE_ENV="development"
VERCEL_ENV="development"
`;
  }

  createStagingTemplate() {
    return `# Staging Environment Configuration
# Use this for staging/preview deployments

# Database
DATABASE_URL="postgresql://user:password@staging-db.example.com:5432/partytribe_staging"

# NextAuth
NEXTAUTH_URL="https://staging.partytribe.com"
NEXTAUTH_SECRET="your-staging-secret-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-staging-google-client-id"
GOOGLE_CLIENT_SECRET="your-staging-google-client-secret"
GITHUB_CLIENT_ID="your-staging-github-client-id"
GITHUB_CLIENT_SECRET="your-staging-github-client-secret"

# External Services
STRIPE_SECRET_KEY="sk_test_your-staging-stripe-key"
STRIPE_WEBHOOK_SECRET="whsec_your-staging-webhook-secret"
SENDGRID_API_KEY="SG.your-staging-sendgrid-key"

# File Storage
AWS_S3_BUCKET="party-tribe-staging"
AWS_ACCESS_KEY_ID="your-staging-aws-key"
AWS_SECRET_ACCESS_KEY="your-staging-aws-secret"
AWS_REGION="us-east-1"

# Staging Settings
NODE_ENV="production"
VERCEL_ENV="preview"
`;
  }

  createProductionTemplate() {
    return `# Production Environment Configuration
# Use this for production deployments

# Database
DATABASE_URL="postgresql://user:password@production-db.example.com:5432/partytribe"

# NextAuth
NEXTAUTH_URL="https://partytribe.com"
NEXTAUTH_SECRET="your-production-secret-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
GITHUB_CLIENT_ID="your-production-github-client-id"
GITHUB_CLIENT_SECRET="your-production-github-client-secret"

# External Services
STRIPE_SECRET_KEY="sk_live_your-production-stripe-key"
STRIPE_WEBHOOK_SECRET="whsec_your-production-webhook-secret"
SENDGRID_API_KEY="SG.your-production-sendgrid-key"

# File Storage
AWS_S3_BUCKET="party-tribe-production"
AWS_ACCESS_KEY_ID="your-production-aws-key"
AWS_SECRET_ACCESS_KEY="your-production-aws-secret"
AWS_REGION="us-east-1"

# Production Settings
NODE_ENV="production"
VERCEL_ENV="production"
`;
  }

  async validateVercelEnvironment() {
    this.log('☁️ Validating Vercel environment configuration...');
    
    const vercelJsonPath = path.join(this.projectRoot, 'vercel.json');
    if (!fs.existsSync(vercelJsonPath)) {
      this.log('❌ vercel.json not found', 'ERROR');
      return;
    }

    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    
    const vercelChecks = [];
    
    // Check environment variables in vercel.json
    if (vercelConfig.env) {
      for (const [key, value] of Object.entries(vercelConfig.env)) {
        if (typeof value === 'string' && value.startsWith('@')) {
          vercelChecks.push({
            type: 'success',
            message: `Environment variable ${key} configured with secret reference`
          });
        } else {
          vercelChecks.push({
            type: 'warning',
            message: `Environment variable ${key} should use secret reference (@variable)`
          });
        }
      }
    } else {
      vercelChecks.push({
        type: 'warning',
        message: 'No environment variables configured in vercel.json'
      });
    }

    // Check build configuration
    if (vercelConfig.buildCommand) {
      vercelChecks.push({
        type: 'success',
        message: 'Custom build command configured'
      });
    }

    if (vercelConfig.installCommand) {
      vercelChecks.push({
        type: 'success',
        message: 'Custom install command configured'
      });
    }

    this.envConfig.validation.vercelChecks = vercelChecks;
    this.log(`☁️ Vercel validation complete: ${vercelChecks.length} checks performed`);
  }

  async generateEnvironmentReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      agent: 'Environment Setup Agent',
      version: '1.0.0',
      environments: Object.keys(this.envConfig).filter(key => key !== 'validation'),
      validation: this.envConfig.validation,
      recommendations: this.generateEnvironmentRecommendations(),
      summary: {
        environmentFiles: Object.keys(this.envConfig).length - 1,
        securityIssues: this.envConfig.validation.securityChecks?.filter(c => c.type === 'error').length || 0,
        configuredVariables: Object.keys(this.envConfig.development || {}).length
      }
    };

    const reportPath = path.join(__dirname, 'reports/environment-setup-report.json');
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📊 Environment setup report generated: ${reportPath}`);
    this.log(`🎉 Environment setup completed in ${duration}s`);
    
    return report;
  }

  generateEnvironmentRecommendations() {
    const recommendations = [];
    
    if (!this.envConfig.development.DATABASE_URL || 
        this.envConfig.development.DATABASE_URL.includes('user:password')) {
      recommendations.push('Set up a real database connection for development');
    }

    if (!this.envConfig.development.NEXTAUTH_SECRET || 
        this.envConfig.development.NEXTAUTH_SECRET === 'your-nextauth-secret-here') {
      recommendations.push('Generate a secure NEXTAUTH_SECRET for development');
    }

    const securityErrors = this.envConfig.validation.securityChecks?.filter(c => c.type === 'error') || [];
    if (securityErrors.length > 0) {
      recommendations.push('Fix security issues found in environment configuration');
    }

    if (!this.envConfig.development.GOOGLE_CLIENT_ID) {
      recommendations.push('Configure OAuth providers for authentication');
    }

    recommendations.push('Set up Vercel environment variables for production deployment');
    recommendations.push('Review and update environment templates for your specific needs');
    recommendations.push('Implement environment variable validation in your application startup');
    
    return recommendations;
  }

  async setup() {
    try {
      this.log('🚀 Starting Environment Setup Agent...');
      
      await this.validateRequiredVariables();
      await this.scanEnvironmentFiles();
      await this.validateEnvironmentSecurity();
      await this.generateSecureSecrets();
      await this.createEnvironmentTemplates();
      await this.validateVercelEnvironment();
      
      const report = await this.generateEnvironmentReport();
      
      return { success: true, report };
    } catch (error) {
      this.log(`💥 Environment setup failed: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }
}

// CLI execution
if (require.main === module) {
  const agent = new EnvironmentSetupAgent();
  agent.setup()
    .then(result => {
      if (result.success) {
        console.log('✅ Environment Setup Agent completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Environment Setup Agent failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error.message);
      process.exit(1);
    });
}

module.exports = EnvironmentSetupAgent;