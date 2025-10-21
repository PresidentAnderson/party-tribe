#!/usr/bin/env node

/**
 * Platform Deployment Verification Agent
 * Complete end-to-end deployment validation and orchestration of all agents
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Import other agents
const BackendDeploymentAgent = require('./backend-deployment');
const FrontendDebuggingAgent = require('./frontend-debugging');
const DatabaseConfigurationAgent = require('./database-configuration');
const EnvironmentSetupAgent = require('./environment-setup');
const IntegrationTestingAgent = require('./integration-testing');

class PlatformDeploymentVerificationAgent {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
    this.partyTribeRoot = path.join(this.projectRoot, 'party-tribe');
    this.logFile = path.join(__dirname, 'logs/platform-deployment-verification.log');
    this.startTime = Date.now();
    this.agentResults = {};
    this.deploymentUrl = null;
    this.verificationResults = {
      agents: {},
      endpoints: {},
      performance: {},
      security: {},
      monitoring: {}
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

  async runAllAgents() {
    this.log('🚀 Running all deployment agents...');
    
    const agents = [
      { name: 'Environment Setup', agent: EnvironmentSetupAgent },
      { name: 'Database Configuration', agent: DatabaseConfigurationAgent },
      { name: 'Backend Deployment', agent: BackendDeploymentAgent },
      { name: 'Frontend Debugging', agent: FrontendDebuggingAgent },
      { name: 'Integration Testing', agent: IntegrationTestingAgent }
    ];

    for (const { name, agent: AgentClass } of agents) {
      this.log(`🔄 Running ${name} Agent...`);
      
      try {
        const agent = new AgentClass();
        const method = this.getAgentMethod(AgentClass);
        const result = await agent[method]();
        
        this.agentResults[name] = result;
        this.verificationResults.agents[name] = {
          status: result.success ? 'PASS' : 'FAIL',
          message: result.success ? 'Agent completed successfully' : result.error,
          report: result.report || null
        };
        
        this.log(`${result.success ? '✅' : '❌'} ${name} Agent: ${result.success ? 'PASS' : 'FAIL'}`);
        
        if (!result.success) {
          this.log(`Error: ${result.error}`, 'ERROR');
        }
      } catch (error) {
        this.agentResults[name] = { success: false, error: error.message };
        this.verificationResults.agents[name] = {
          status: 'ERROR',
          message: `Agent execution failed: ${error.message}`,
          report: null
        };
        this.log(`💥 ${name} Agent: ERROR - ${error.message}`, 'ERROR');
      }
    }
  }

  getAgentMethod(AgentClass) {
    // Map agent classes to their main methods
    if (AgentClass === EnvironmentSetupAgent) return 'setup';
    if (AgentClass === DatabaseConfigurationAgent) return 'configure';
    if (AgentClass === BackendDeploymentAgent) return 'deploy';
    if (AgentClass === FrontendDebuggingAgent) return 'debug';
    if (AgentClass === IntegrationTestingAgent) return 'runTests';
    return 'run'; // default method
  }

  async performDeployment() {
    this.log('🚀 Performing platform deployment...');
    
    try {
      // First, ensure all packages are built
      this.log('📦 Building all packages...');
      execSync('pnpm install --no-frozen-lockfile', { 
        cwd: this.partyTribeRoot,
        stdio: 'inherit'
      });
      
      execSync('pnpm build', { 
        cwd: this.partyTribeRoot,
        stdio: 'inherit'
      });

      // Deploy to Vercel
      this.log('☁️ Deploying to Vercel...');
      const deployOutput = execSync('vercel --prod --yes', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Extract deployment URL
      const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
      if (urlMatch) {
        this.deploymentUrl = urlMatch[0];
        this.log(`🌐 Deployment URL: ${this.deploymentUrl}`);
      } else {
        throw new Error('Could not extract deployment URL from Vercel output');
      }

      return { success: true, url: this.deploymentUrl };
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }

  async verifyDeploymentEndpoints() {
    if (!this.deploymentUrl) {
      this.log('⚠️ No deployment URL available, skipping endpoint verification', 'WARN');
      return;
    }

    this.log('🔍 Verifying deployment endpoints...');
    
    const endpoints = [
      { name: 'Homepage', path: '/', expectedStatus: 200 },
      { name: 'API Health', path: '/api/health', expectedStatus: [200, 404] }, // 404 is ok if not implemented
      { name: 'Authentication', path: '/api/auth/signin', expectedStatus: 200 },
      { name: 'tRPC API', path: '/api/trpc/user.getSession', expectedStatus: [200, 401] },
      { name: 'Events Page', path: '/events', expectedStatus: 200 },
      { name: 'Tribes Page', path: '/tribes', expectedStatus: 200 },
      { name: 'Organizers Page', path: '/organizers', expectedStatus: 200 }
    ];

    for (const endpoint of endpoints) {
      try {
        const url = `${this.deploymentUrl}${endpoint.path}`;
        const response = await this.makeHttpRequest(url);
        
        const expectedStatuses = Array.isArray(endpoint.expectedStatus) 
          ? endpoint.expectedStatus 
          : [endpoint.expectedStatus];
        
        const isValid = expectedStatuses.includes(response.statusCode);
        
        this.verificationResults.endpoints[endpoint.name] = {
          url,
          status: response.statusCode,
          valid: isValid,
          responseTime: response.responseTime
        };
        
        this.log(`${isValid ? '✅' : '❌'} ${endpoint.name}: ${response.statusCode} (${response.responseTime}ms)`);
      } catch (error) {
        this.verificationResults.endpoints[endpoint.name] = {
          url: `${this.deploymentUrl}${endpoint.path}`,
          status: 'ERROR',
          valid: false,
          error: error.message
        };
        this.log(`❌ ${endpoint.name}: ERROR - ${error.message}`, 'ERROR');
      }
    }
  }

  async makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const client = url.startsWith('https') ? https : http;
      
      const request = client.get(url, { timeout: 10000 }, (response) => {
        const responseTime = Date.now() - startTime;
        
        // Consume response data to free up memory
        response.on('data', () => {});
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            responseTime,
            headers: response.headers
          });
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async verifyPerformanceMetrics() {
    if (!this.deploymentUrl) {
      this.log('⚠️ No deployment URL available, skipping performance verification', 'WARN');
      return;
    }

    this.log('⚡ Verifying performance metrics...');
    
    try {
      // Test homepage load time
      const homepageStart = Date.now();
      await this.makeHttpRequest(this.deploymentUrl);
      const homepageLoadTime = Date.now() - homepageStart;

      // Test multiple requests for consistency
      const requestTimes = [];
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await this.makeHttpRequest(this.deploymentUrl);
        requestTimes.push(Date.now() - start);
      }

      const avgResponseTime = requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length;
      const maxResponseTime = Math.max(...requestTimes);
      const minResponseTime = Math.min(...requestTimes);

      this.verificationResults.performance = {
        homepageLoadTime: `${homepageLoadTime}ms`,
        averageResponseTime: `${avgResponseTime.toFixed(0)}ms`,
        maxResponseTime: `${maxResponseTime}ms`,
        minResponseTime: `${minResponseTime}ms`,
        consistency: maxResponseTime - minResponseTime < 1000 ? 'Good' : 'Variable'
      };

      this.log(`⚡ Performance metrics: ${avgResponseTime.toFixed(0)}ms avg, ${homepageLoadTime}ms homepage`);
    } catch (error) {
      this.log(`❌ Performance verification failed: ${error.message}`, 'ERROR');
    }
  }

  async verifySecurityHeaders() {
    if (!this.deploymentUrl) {
      this.log('⚠️ No deployment URL available, skipping security verification', 'WARN');
      return;
    }

    this.log('🔒 Verifying security headers...');
    
    try {
      const response = await this.makeHttpRequest(this.deploymentUrl);
      const headers = response.headers;

      const securityChecks = {
        'X-Frame-Options': headers['x-frame-options'] ? 'Present' : 'Missing',
        'X-Content-Type-Options': headers['x-content-type-options'] ? 'Present' : 'Missing',
        'Strict-Transport-Security': headers['strict-transport-security'] ? 'Present' : 'Missing',
        'Content-Security-Policy': headers['content-security-policy'] ? 'Present' : 'Missing',
        'X-XSS-Protection': headers['x-xss-protection'] ? 'Present' : 'Missing'
      };

      const presentHeaders = Object.values(securityChecks).filter(status => status === 'Present').length;
      const totalHeaders = Object.keys(securityChecks).length;

      this.verificationResults.security = {
        headers: securityChecks,
        score: `${presentHeaders}/${totalHeaders}`,
        https: this.deploymentUrl.startsWith('https') ? 'Enabled' : 'Disabled'
      };

      this.log(`🔒 Security headers: ${presentHeaders}/${totalHeaders} present`);
    } catch (error) {
      this.log(`❌ Security verification failed: ${error.message}`, 'ERROR');
    }
  }

  async setupMonitoring() {
    this.log('📊 Setting up monitoring configuration...');
    
    const monitoringConfig = {
      vercelAnalytics: {
        enabled: true,
        configured: this.checkVercelAnalyticsConfig()
      },
      errorTracking: {
        recommendation: 'Set up Sentry or similar error tracking service',
        configured: false
      },
      uptime: {
        recommendation: 'Set up uptime monitoring (UptimeRobot, Pingdom)',
        configured: false
      },
      performance: {
        recommendation: 'Configure Core Web Vitals monitoring',
        vercelSpeedInsights: 'Available in Vercel dashboard'
      },
      logs: {
        vercelLogs: 'Available in Vercel dashboard',
        recommendation: 'Set up log aggregation for production'
      }
    };

    this.verificationResults.monitoring = monitoringConfig;
    
    // Create monitoring setup guide
    const monitoringGuide = this.createMonitoringGuide();
    const guidePath = path.join(__dirname, 'config/monitoring-setup-guide.md');
    const configDir = path.dirname(guidePath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(guidePath, monitoringGuide);
    this.log(`📊 Monitoring setup guide created: ${guidePath}`);
  }

  checkVercelAnalyticsConfig() {
    try {
      const layoutPath = path.join(this.partyTribeRoot, 'apps/web/src/app/layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf8');
      return content.includes('@vercel/analytics');
    } catch {
      return false;
    }
  }

  createMonitoringGuide() {
    return `# Party Tribe™ Monitoring Setup Guide

## Vercel Analytics (Already Configured ✅)
Your application already includes Vercel Analytics for basic usage tracking.

## Recommended Monitoring Services

### 1. Error Tracking
- **Sentry**: https://sentry.io
- **LogRocket**: https://logrocket.com
- **Bugsnag**: https://bugsnag.com

### 2. Uptime Monitoring
- **UptimeRobot**: https://uptimerobot.com
- **Pingdom**: https://pingdom.com
- **StatusCake**: https://statuscake.com

### 3. Performance Monitoring
- **Vercel Speed Insights** (Built-in)
- **Google PageSpeed Insights**
- **GTmetrix**: https://gtmetrix.com

### 4. User Analytics
- **Google Analytics 4**
- **Mixpanel**: https://mixpanel.com
- **Hotjar**: https://hotjar.com

## Setup Instructions

### Environment Variables for Monitoring
Add these to your Vercel environment variables:

\`\`\`bash
# Error Tracking
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Analytics
GOOGLE_ANALYTICS_ID=GA-XXXXXX
MIXPANEL_TOKEN=your-mixpanel-token
\`\`\`

### Alert Configuration
Set up alerts for:
- Response time > 2 seconds
- Error rate > 1%
- 5xx status codes
- Database connection failures
- Memory usage > 80%

### Dashboard URLs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Database Monitoring**: Your database provider dashboard
- **Custom Dashboards**: Set up Grafana or DataDog

## Monitoring Checklist
- [ ] Set up error tracking
- [ ] Configure uptime monitoring
- [ ] Enable performance monitoring
- [ ] Set up log aggregation
- [ ] Create alert rules
- [ ] Test notification channels
- [ ] Document incident response procedures
`;
  }

  async generateComprehensiveReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    // Calculate overall success rate
    const agentStatuses = Object.values(this.verificationResults.agents);
    const passedAgents = agentStatuses.filter(agent => agent.status === 'PASS').length;
    const totalAgents = agentStatuses.length;
    
    const endpointStatuses = Object.values(this.verificationResults.endpoints);
    const validEndpoints = endpointStatuses.filter(endpoint => endpoint.valid).length;
    const totalEndpoints = endpointStatuses.length;

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      agent: 'Platform Deployment Verification Agent',
      version: '1.0.0',
      deployment: {
        url: this.deploymentUrl,
        status: this.deploymentUrl ? 'SUCCESS' : 'FAILED'
      },
      summary: {
        agentSuccess: `${passedAgents}/${totalAgents}`,
        endpointSuccess: `${validEndpoints}/${totalEndpoints}`,
        overallStatus: (passedAgents === totalAgents && validEndpoints >= totalEndpoints * 0.8) ? 'PASS' : 'PARTIAL',
        deploymentReady: this.deploymentUrl && passedAgents >= totalAgents * 0.8
      },
      results: this.verificationResults,
      agentResults: this.agentResults,
      recommendations: this.generateFinalRecommendations(),
      nextSteps: this.generateNextSteps()
    };

    const reportPath = path.join(__dirname, 'reports/platform-deployment-verification-report.json');
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Also create a human-readable summary
    const summaryPath = path.join(__dirname, 'reports/deployment-summary.md');
    const summary = this.createDeploymentSummary(report);
    fs.writeFileSync(summaryPath, summary);

    this.log(`📊 Comprehensive deployment report generated: ${reportPath}`);
    this.log(`📋 Deployment summary created: ${summaryPath}`);
    this.log(`🎉 Platform deployment verification completed in ${duration}s`);
    
    return report;
  }

  createDeploymentSummary(report) {
    const status = report.summary.overallStatus;
    const statusEmoji = status === 'PASS' ? '✅' : status === 'PARTIAL' ? '⚠️' : '❌';
    
    return `# Party Tribe™ Deployment Summary

${statusEmoji} **Overall Status**: ${status}

## Deployment Information
- **URL**: ${report.deployment.url || 'Not deployed'}
- **Status**: ${report.deployment.status}
- **Timestamp**: ${report.timestamp}
- **Duration**: ${report.duration}

## Agent Results
${Object.entries(report.results.agents).map(([name, result]) => 
  `- ${result.status === 'PASS' ? '✅' : '❌'} **${name}**: ${result.status}`
).join('\n')}

## Endpoint Verification
${Object.entries(report.results.endpoints).map(([name, result]) => 
  `- ${result.valid ? '✅' : '❌'} **${name}**: ${result.status} ${result.responseTime ? `(${result.responseTime}ms)` : ''}`
).join('\n')}

## Performance Metrics
${report.results.performance.averageResponseTime ? `
- **Average Response Time**: ${report.results.performance.averageResponseTime}
- **Homepage Load Time**: ${report.results.performance.homepageLoadTime}
- **Consistency**: ${report.results.performance.consistency}
` : 'Performance metrics not available'}

## Security
${report.results.security.score ? `
- **Security Headers**: ${report.results.security.score}
- **HTTPS**: ${report.results.security.https}
` : 'Security verification not available'}

## Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps
${report.nextSteps.map(step => `- ${step}`).join('\n')}

---
*Generated by Platform Deployment Verification Agent v${report.version}*
`;
  }

  generateFinalRecommendations() {
    const recommendations = [];
    
    const failedAgents = Object.entries(this.verificationResults.agents)
      .filter(([name, result]) => result.status !== 'PASS')
      .map(([name]) => name);
    
    if (failedAgents.length > 0) {
      recommendations.push(`Fix failing agents: ${failedAgents.join(', ')}`);
    }

    const failedEndpoints = Object.entries(this.verificationResults.endpoints)
      .filter(([name, result]) => !result.valid)
      .map(([name]) => name);
    
    if (failedEndpoints.length > 0) {
      recommendations.push(`Fix failing endpoints: ${failedEndpoints.join(', ')}`);
    }

    if (!this.deploymentUrl) {
      recommendations.push('Complete Vercel deployment setup');
    }

    if (this.verificationResults.performance.averageResponseTime) {
      const avgTime = parseInt(this.verificationResults.performance.averageResponseTime);
      if (avgTime > 2000) {
        recommendations.push('Optimize performance - response times exceed 2 seconds');
      }
    }

    if (this.verificationResults.security.score) {
      const [present, total] = this.verificationResults.security.score.split('/').map(Number);
      if (present < total) {
        recommendations.push('Configure additional security headers');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Platform is deployment-ready! Consider setting up monitoring and alerts');
    }

    return recommendations;
  }

  generateNextSteps() {
    const nextSteps = [];
    
    if (this.deploymentUrl) {
      nextSteps.push('Set up production environment variables in Vercel dashboard');
      nextSteps.push('Configure custom domain if needed');
      nextSteps.push('Set up database with production credentials');
      nextSteps.push('Configure OAuth providers for production');
      nextSteps.push('Set up monitoring and alerting');
      nextSteps.push('Implement backup and disaster recovery procedures');
      nextSteps.push('Set up CI/CD pipeline for automated deployments');
    } else {
      nextSteps.push('Fix deployment issues and retry deployment');
      nextSteps.push('Verify Vercel CLI authentication');
      nextSteps.push('Check build configuration in vercel.json');
    }

    return nextSteps;
  }

  async verify() {
    try {
      this.log('🚀 Starting Platform Deployment Verification Agent...');
      
      // Run all agents
      await this.runAllAgents();
      
      // Perform deployment
      const deploymentResult = await this.performDeployment();
      
      if (deploymentResult.success) {
        // Verify the deployment
        await this.verifyDeploymentEndpoints();
        await this.verifyPerformanceMetrics();
        await this.verifySecurityHeaders();
      }
      
      // Set up monitoring
      await this.setupMonitoring();
      
      // Generate comprehensive report
      const report = await this.generateComprehensiveReport();
      
      return { success: true, report };
    } catch (error) {
      this.log(`💥 Platform deployment verification failed: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }
}

// CLI execution
if (require.main === module) {
  const agent = new PlatformDeploymentVerificationAgent();
  agent.verify()
    .then(result => {
      if (result.success) {
        console.log('✅ Platform Deployment Verification Agent completed successfully');
        if (result.report.deployment.url) {
          console.log(`🌐 Deployment URL: ${result.report.deployment.url}`);
        }
        process.exit(0);
      } else {
        console.error('❌ Platform Deployment Verification Agent failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error.message);
      process.exit(1);
    });
}

module.exports = PlatformDeploymentVerificationAgent;