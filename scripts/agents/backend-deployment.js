#!/usr/bin/env node

/**
 * Backend Deployment Agent
 * Handles API routes, database migrations, and server-side logic deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BackendDeploymentAgent {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
    this.partyTribeRoot = path.join(this.projectRoot, 'party-tribe');
    this.logFile = path.join(__dirname, 'logs/backend-deployment.log');
    this.startTime = Date.now();
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

  async checkPrerequisites() {
    this.log('🔍 Checking deployment prerequisites...');
    
    const checks = [
      { name: 'Node.js', command: 'node --version' },
      { name: 'pnpm', command: 'pnpm --version' },
      { name: 'Git', command: 'git --version' },
      { name: 'Vercel CLI', command: 'vercel --version' }
    ];

    for (const check of checks) {
      try {
        const version = execSync(check.command, { encoding: 'utf8' }).trim();
        this.log(`✅ ${check.name}: ${version}`);
      } catch (error) {
        this.log(`❌ ${check.name} not found or not working`, 'ERROR');
        throw new Error(`Missing prerequisite: ${check.name}`);
      }
    }
  }

  async validateEnvironment() {
    this.log('🔧 Validating environment configuration...');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    const envPath = path.join(this.partyTribeRoot, '.env.local');
    if (!fs.existsSync(envPath)) {
      this.log('⚠️ .env.local not found, using example values', 'WARN');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const envVar of requiredEnvVars) {
      if (!envContent.includes(envVar)) {
        this.log(`❌ Missing environment variable: ${envVar}`, 'ERROR');
        throw new Error(`Missing required environment variable: ${envVar}`);
      } else {
        this.log(`✅ Environment variable found: ${envVar}`);
      }
    }
  }

  async buildDatabase() {
    this.log('🗄️ Building database layer...');
    
    try {
      // Generate Prisma client
      this.log('Generating Prisma client...');
      execSync('pnpm prisma generate', { 
        cwd: path.join(this.partyTribeRoot, 'packages/db'),
        stdio: 'inherit'
      });

      // Build database package
      this.log('Building database package...');
      execSync('pnpm build', { 
        cwd: path.join(this.partyTribeRoot, 'packages/db'),
        stdio: 'inherit'
      });

      this.log('✅ Database layer built successfully');
    } catch (error) {
      this.log(`❌ Database build failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async buildApiLayer() {
    this.log('🔌 Building API layer...');
    
    try {
      // Build API package
      execSync('pnpm build', { 
        cwd: path.join(this.partyTribeRoot, 'packages/api'),
        stdio: 'inherit'
      });

      this.log('✅ API layer built successfully');
    } catch (error) {
      this.log(`❌ API build failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async buildWebApplication() {
    this.log('🌐 Building web application...');
    
    try {
      // Install dependencies
      this.log('Installing dependencies...');
      execSync('pnpm install --no-frozen-lockfile', { 
        cwd: this.partyTribeRoot,
        stdio: 'inherit'
      });

      // Build the entire project
      this.log('Building project...');
      execSync('pnpm build', { 
        cwd: this.partyTribeRoot,
        stdio: 'inherit'
      });

      this.log('✅ Web application built successfully');
    } catch (error) {
      this.log(`❌ Web application build failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async performHealthChecks() {
    this.log('🏥 Performing health checks...');
    
    const healthChecks = [
      {
        name: 'Package.json validation',
        check: () => {
          const packagePath = path.join(this.partyTribeRoot, 'package.json');
          const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          return pkg.name === 'party-tribe';
        }
      },
      {
        name: 'Build artifacts existence',
        check: () => {
          const buildPaths = [
            path.join(this.partyTribeRoot, 'packages/db/dist'),
            path.join(this.partyTribeRoot, 'packages/api/dist'),
            path.join(this.partyTribeRoot, 'apps/web/.next')
          ];
          return buildPaths.every(p => fs.existsSync(p));
        }
      },
      {
        name: 'Prisma client generation',
        check: () => {
          const clientPath = path.join(this.partyTribeRoot, 'node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client');
          try {
            execSync(`ls ${clientPath}`, { stdio: 'pipe' });
            return true;
          } catch {
            return false;
          }
        }
      }
    ];

    for (const healthCheck of healthChecks) {
      try {
        const result = healthCheck.check();
        if (result) {
          this.log(`✅ ${healthCheck.name}: PASS`);
        } else {
          this.log(`❌ ${healthCheck.name}: FAIL`, 'ERROR');
          throw new Error(`Health check failed: ${healthCheck.name}`);
        }
      } catch (error) {
        this.log(`❌ ${healthCheck.name}: ERROR - ${error.message}`, 'ERROR');
        throw error;
      }
    }
  }

  async generateDeploymentReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      status: 'SUCCESS',
      agent: 'Backend Deployment Agent',
      version: '1.0.0',
      checks: [
        'Prerequisites validation',
        'Environment configuration',
        'Database layer build',
        'API layer build',
        'Web application build',
        'Health checks'
      ]
    };

    const reportPath = path.join(__dirname, 'reports/backend-deployment-report.json');
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📊 Deployment report generated: ${reportPath}`);
    this.log(`🎉 Backend deployment completed successfully in ${duration}s`);
  }

  async deploy() {
    try {
      this.log('🚀 Starting Backend Deployment Agent...');
      
      await this.checkPrerequisites();
      await this.validateEnvironment();
      await this.buildDatabase();
      await this.buildApiLayer();
      await this.buildWebApplication();
      await this.performHealthChecks();
      await this.generateDeploymentReport();
      
      return { success: true, message: 'Backend deployment completed successfully' };
    } catch (error) {
      this.log(`💥 Deployment failed: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }
}

// CLI execution
if (require.main === module) {
  const agent = new BackendDeploymentAgent();
  agent.deploy()
    .then(result => {
      if (result.success) {
        console.log('✅ Backend Deployment Agent completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Backend Deployment Agent failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error.message);
      process.exit(1);
    });
}

module.exports = BackendDeploymentAgent;