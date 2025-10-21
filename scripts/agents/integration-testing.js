#!/usr/bin/env node

/**
 * Integration Testing Agent
 * Automated testing across all system components including API, database, and frontend
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

class IntegrationTestingAgent {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
    this.partyTribeRoot = path.join(this.projectRoot, 'party-tribe');
    this.logFile = path.join(__dirname, 'logs/integration-testing.log');
    this.startTime = Date.now();
    this.testResults = {
      api: [],
      database: [],
      frontend: [],
      authentication: [],
      performance: {}
    };
    this.testServer = null;
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

  async testDatabaseIntegration() {
    this.log('🗄️ Testing database integration...');
    
    const dbTests = [
      {
        name: 'Prisma Client Generation',
        test: () => {
          execSync('pnpm prisma generate', {
            cwd: path.join(this.partyTribeRoot, 'packages/db'),
            stdio: 'pipe'
          });
          return { success: true, message: 'Prisma client generated successfully' };
        }
      },
      {
        name: 'Schema Validation',
        test: () => {
          execSync('pnpm prisma validate', {
            cwd: path.join(this.partyTribeRoot, 'packages/db'),
            stdio: 'pipe'
          });
          return { success: true, message: 'Schema validation passed' };
        }
      },
      {
        name: 'Database Types Export',
        test: () => {
          const dbIndexPath = path.join(this.partyTribeRoot, 'packages/db/index.ts');
          const content = fs.readFileSync(dbIndexPath, 'utf8');
          
          const requiredExports = ['User', 'Tribe', 'Event', 'prisma'];
          const missingExports = requiredExports.filter(exp => !content.includes(exp));
          
          if (missingExports.length > 0) {
            throw new Error(`Missing exports: ${missingExports.join(', ')}`);
          }
          
          return { success: true, message: 'All required types exported' };
        }
      },
      {
        name: 'Database Package Build',
        test: () => {
          execSync('pnpm build', {
            cwd: path.join(this.partyTribeRoot, 'packages/db'),
            stdio: 'pipe'
          });
          
          const distPath = path.join(this.partyTribeRoot, 'packages/db/dist');
          if (!fs.existsSync(distPath)) {
            throw new Error('Database package build artifacts not found');
          }
          
          return { success: true, message: 'Database package built successfully' };
        }
      }
    ];

    for (const dbTest of dbTests) {
      try {
        const result = dbTest.test();
        this.testResults.database.push({
          name: dbTest.name,
          status: 'PASS',
          message: result.message,
          duration: 0
        });
        this.log(`✅ ${dbTest.name}: PASS`);
      } catch (error) {
        this.testResults.database.push({
          name: dbTest.name,
          status: 'FAIL',
          message: error.message,
          duration: 0
        });
        this.log(`❌ ${dbTest.name}: FAIL - ${error.message}`, 'ERROR');
      }
    }
  }

  async testApiIntegration() {
    this.log('🔌 Testing API integration...');
    
    const apiTests = [
      {
        name: 'API Package Build',
        test: () => {
          execSync('pnpm build', {
            cwd: path.join(this.partyTribeRoot, 'packages/api'),
            stdio: 'pipe'
          });
          
          const distPath = path.join(this.partyTribeRoot, 'packages/api/dist');
          if (!fs.existsSync(distPath)) {
            throw new Error('API package build artifacts not found');
          }
          
          return { success: true, message: 'API package built successfully' };
        }
      },
      {
        name: 'tRPC Router Configuration',
        test: () => {
          const apiRootPath = path.join(this.partyTribeRoot, 'packages/api/src/root.ts');
          const content = fs.readFileSync(apiRootPath, 'utf8');
          
          const requiredRouters = ['user', 'tribe', 'event'];
          const missingRouters = requiredRouters.filter(router => !content.includes(router));
          
          if (missingRouters.length > 0) {
            throw new Error(`Missing routers: ${missingRouters.join(', ')}`);
          }
          
          return { success: true, message: 'All required routers configured' };
        }
      },
      {
        name: 'Authentication Configuration',
        test: () => {
          const authPath = path.join(this.partyTribeRoot, 'packages/api/src/auth.ts');
          if (!fs.existsSync(authPath)) {
            throw new Error('Authentication configuration not found');
          }
          
          const content = fs.readFileSync(authPath, 'utf8');
          
          if (!content.includes('NextAuth') || !content.includes('authOptions')) {
            throw new Error('NextAuth configuration incomplete');
          }
          
          return { success: true, message: 'Authentication configuration found' };
        }
      },
      {
        name: 'API Type Safety',
        test: () => {
          const result = execSync('pnpm type-check', {
            cwd: path.join(this.partyTribeRoot, 'packages/api'),
            encoding: 'utf8',
            stdio: 'pipe'
          });
          
          return { success: true, message: 'API type checking passed' };
        }
      }
    ];

    for (const apiTest of apiTests) {
      try {
        const result = apiTest.test();
        this.testResults.api.push({
          name: apiTest.name,
          status: 'PASS',
          message: result.message,
          duration: 0
        });
        this.log(`✅ ${apiTest.name}: PASS`);
      } catch (error) {
        this.testResults.api.push({
          name: apiTest.name,
          status: 'FAIL',
          message: error.message,
          duration: 0
        });
        this.log(`❌ ${apiTest.name}: FAIL - ${error.message}`, 'ERROR');
      }
    }
  }

  async testFrontendIntegration() {
    this.log('🌐 Testing frontend integration...');
    
    const frontendTests = [
      {
        name: 'Web Application Build',
        test: () => {
          execSync('pnpm build', {
            cwd: path.join(this.partyTribeRoot, 'apps/web'),
            stdio: 'pipe'
          });
          
          const nextPath = path.join(this.partyTribeRoot, 'apps/web/.next');
          if (!fs.existsSync(nextPath)) {
            throw new Error('Next.js build artifacts not found');
          }
          
          return { success: true, message: 'Web application built successfully' };
        }
      },
      {
        name: 'tRPC Client Integration',
        test: () => {
          const trpcPath = path.join(this.partyTribeRoot, 'apps/web/src/lib/trpc.ts');
          if (!fs.existsSync(trpcPath)) {
            throw new Error('tRPC client configuration not found');
          }
          
          const content = fs.readFileSync(trpcPath, 'utf8');
          
          if (!content.includes('createTRPCNext') || !content.includes('AppRouter')) {
            throw new Error('tRPC client configuration incomplete');
          }
          
          return { success: true, message: 'tRPC client properly configured' };
        }
      },
      {
        name: 'Authentication Provider',
        test: () => {
          const authProviderPath = path.join(this.partyTribeRoot, 'apps/web/src/components/providers/auth-provider.tsx');
          if (!fs.existsSync(authProviderPath)) {
            throw new Error('Authentication provider not found');
          }
          
          const content = fs.readFileSync(authProviderPath, 'utf8');
          
          if (!content.includes('SessionProvider')) {
            throw new Error('SessionProvider not configured');
          }
          
          return { success: true, message: 'Authentication provider configured' };
        }
      },
      {
        name: 'Layout and Navigation',
        test: () => {
          const layoutPath = path.join(this.partyTribeRoot, 'apps/web/src/app/layout.tsx');
          const content = fs.readFileSync(layoutPath, 'utf8');
          
          const requiredComponents = ['Navbar', 'Analytics'];
          const missingComponents = requiredComponents.filter(comp => !content.includes(comp));
          
          if (missingComponents.length > 0) {
            throw new Error(`Missing components: ${missingComponents.join(', ')}`);
          }
          
          return { success: true, message: 'Layout and navigation properly configured' };
        }
      },
      {
        name: 'TypeScript Type Checking',
        test: () => {
          execSync('pnpm type-check', {
            cwd: path.join(this.partyTribeRoot, 'apps/web'),
            stdio: 'pipe'
          });
          
          return { success: true, message: 'TypeScript type checking passed' };
        }
      }
    ];

    for (const frontendTest of frontendTests) {
      try {
        const result = frontendTest.test();
        this.testResults.frontend.push({
          name: frontendTest.name,
          status: 'PASS',
          message: result.message,
          duration: 0
        });
        this.log(`✅ ${frontendTest.name}: PASS`);
      } catch (error) {
        this.testResults.frontend.push({
          name: frontendTest.name,
          status: 'FAIL',
          message: error.message,
          duration: 0
        });
        this.log(`❌ ${frontendTest.name}: FAIL - ${error.message}`, 'ERROR');
      }
    }
  }

  async testAuthenticationFlow() {
    this.log('🔐 Testing authentication flow...');
    
    const authTests = [
      {
        name: 'NextAuth API Route',
        test: () => {
          const authRoutePath = path.join(this.partyTribeRoot, 'apps/web/src/app/api/auth/[...nextauth]/route.ts');
          if (!fs.existsSync(authRoutePath)) {
            throw new Error('NextAuth API route not found');
          }
          
          const content = fs.readFileSync(authRoutePath, 'utf8');
          
          if (!content.includes('authOptions') || !content.includes('NextAuth')) {
            throw new Error('NextAuth API route not properly configured');
          }
          
          return { success: true, message: 'NextAuth API route configured' };
        }
      },
      {
        name: 'Authentication Configuration',
        test: () => {
          const authConfigPath = path.join(this.partyTribeRoot, 'packages/api/src/auth.ts');
          const content = fs.readFileSync(authConfigPath, 'utf8');
          
          const requiredProviders = ['GoogleProvider', 'GitHubProvider'];
          const configuredProviders = requiredProviders.filter(provider => 
            content.includes(provider) || content.includes(provider.toLowerCase())
          );
          
          if (configuredProviders.length === 0) {
            throw new Error('No OAuth providers configured');
          }
          
          return { success: true, message: `${configuredProviders.length} OAuth providers configured` };
        }
      },
      {
        name: 'Database Adapter Configuration',
        test: () => {
          const authConfigPath = path.join(this.partyTribeRoot, 'packages/api/src/auth.ts');
          const content = fs.readFileSync(authConfigPath, 'utf8');
          
          if (!content.includes('PrismaAdapter')) {
            throw new Error('Prisma adapter not configured for NextAuth');
          }
          
          return { success: true, message: 'Database adapter configured' };
        }
      }
    ];

    for (const authTest of authTests) {
      try {
        const result = authTest.test();
        this.testResults.authentication.push({
          name: authTest.name,
          status: 'PASS',
          message: result.message,
          duration: 0
        });
        this.log(`✅ ${authTest.name}: PASS`);
      } catch (error) {
        this.testResults.authentication.push({
          name: authTest.name,
          status: 'FAIL',
          message: error.message,
          duration: 0
        });
        this.log(`❌ ${authTest.name}: FAIL - ${error.message}`, 'ERROR');
      }
    }
  }

  async testPerformanceMetrics() {
    this.log('⚡ Testing performance metrics...');
    
    try {
      // Analyze bundle sizes
      const webNextDir = path.join(this.partyTribeRoot, 'apps/web/.next');
      if (fs.existsSync(webNextDir)) {
        const bundleStats = this.analyzeBundleSize(webNextDir);
        this.testResults.performance.bundleSize = bundleStats;
        this.log(`📦 Bundle analysis: ${bundleStats.totalSizeMB}MB total`);
      }

      // Check build time
      const buildStartTime = Date.now();
      execSync('pnpm build', {
        cwd: path.join(this.partyTribeRoot, 'apps/web'),
        stdio: 'pipe'
      });
      const buildTime = (Date.now() - buildStartTime) / 1000;
      
      this.testResults.performance.buildTime = `${buildTime}s`;
      this.log(`⚡ Build time: ${buildTime}s`);

      // Check for large dependencies
      const packageJsonPath = path.join(this.partyTribeRoot, 'apps/web/package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencyCount = Object.keys(packageJson.dependencies || {}).length + 
                             Object.keys(packageJson.devDependencies || {}).length;
      
      this.testResults.performance.dependencyCount = dependencyCount;
      this.log(`📚 Dependencies: ${dependencyCount} packages`);

    } catch (error) {
      this.log(`⚠️ Performance metrics collection failed: ${error.message}`, 'WARN');
    }
  }

  analyzeBundleSize(nextDir) {
    const staticDir = path.join(nextDir, 'static');
    let totalSize = 0;
    const fileTypes = { js: 0, css: 0, other: 0 };

    const analyzeDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          analyzeDir(itemPath);
        } else {
          totalSize += stat.size;
          const ext = path.extname(item);
          if (ext === '.js') fileTypes.js += stat.size;
          else if (ext === '.css') fileTypes.css += stat.size;
          else fileTypes.other += stat.size;
        }
      }
    };

    analyzeDir(staticDir);

    return {
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      breakdown: {
        javascript: (fileTypes.js / 1024 / 1024).toFixed(2) + 'MB',
        css: (fileTypes.css / 1024 / 1024).toFixed(2) + 'MB',
        other: (fileTypes.other / 1024 / 1024).toFixed(2) + 'MB'
      }
    };
  }

  async testCrossPackageIntegration() {
    this.log('🔗 Testing cross-package integration...');
    
    try {
      // Test that web app can import from API package
      const webImportTest = `
        const { createTRPCNext } = require('@trpc/next');
        const { type AppRouter } = require('@party-tribe/api');
        console.log('Cross-package import successful');
      `;

      const testFile = path.join(this.partyTribeRoot, 'test-integration.js');
      fs.writeFileSync(testFile, webImportTest);

      execSync(`node test-integration.js`, {
        cwd: this.partyTribeRoot,
        stdio: 'pipe'
      });

      fs.unlinkSync(testFile);
      this.log('✅ Cross-package integration test passed');
    } catch (error) {
      this.log(`❌ Cross-package integration test failed: ${error.message}`, 'ERROR');
    }
  }

  async generateTestReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    const totalTests = [
      ...this.testResults.database,
      ...this.testResults.api,
      ...this.testResults.frontend,
      ...this.testResults.authentication
    ];

    const passedTests = totalTests.filter(test => test.status === 'PASS');
    const failedTests = totalTests.filter(test => test.status === 'FAIL');

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      agent: 'Integration Testing Agent',
      version: '1.0.0',
      summary: {
        totalTests: totalTests.length,
        passed: passedTests.length,
        failed: failedTests.length,
        passRate: `${((passedTests.length / totalTests.length) * 100).toFixed(1)}%`
      },
      results: this.testResults,
      performance: this.testResults.performance,
      recommendations: this.generateTestRecommendations(failedTests)
    };

    const reportPath = path.join(__dirname, 'reports/integration-testing-report.json');
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📊 Integration testing report generated: ${reportPath}`);
    this.log(`🎉 Integration testing completed in ${duration}s`);
    this.log(`📈 Results: ${passedTests.length}/${totalTests.length} tests passed (${report.summary.passRate})`);
    
    return report;
  }

  generateTestRecommendations(failedTests) {
    const recommendations = [];
    
    if (failedTests.length > 0) {
      recommendations.push(`Fix ${failedTests.length} failing tests before deployment`);
      
      // Specific recommendations based on failed tests
      const failedCategories = new Set(failedTests.map(test => {
        if (test.name.includes('Database')) return 'database';
        if (test.name.includes('API')) return 'api';
        if (test.name.includes('Frontend')) return 'frontend';
        if (test.name.includes('Auth')) return 'authentication';
        return 'other';
      }));

      failedCategories.forEach(category => {
        switch (category) {
          case 'database':
            recommendations.push('Review database configuration and Prisma setup');
            break;
          case 'api':
            recommendations.push('Check API package build and tRPC configuration');
            break;
          case 'frontend':
            recommendations.push('Verify frontend build process and component integration');
            break;
          case 'authentication':
            recommendations.push('Review NextAuth configuration and OAuth providers');
            break;
        }
      });
    }

    const bundleSize = this.testResults.performance.bundleSize?.totalSize || 0;
    if (bundleSize > 2 * 1024 * 1024) { // 2MB
      recommendations.push('Consider bundle optimization - size exceeds 2MB');
    }

    if (failedTests.length === 0) {
      recommendations.push('All tests passing! Consider adding more comprehensive end-to-end tests');
      recommendations.push('Set up continuous integration to run these tests automatically');
    }

    return recommendations;
  }

  async runTests() {
    try {
      this.log('🚀 Starting Integration Testing Agent...');
      
      await this.testDatabaseIntegration();
      await this.testApiIntegration();
      await this.testFrontendIntegration();
      await this.testAuthenticationFlow();
      await this.testPerformanceMetrics();
      await this.testCrossPackageIntegration();
      
      const report = await this.generateTestReport();
      
      return { success: true, report };
    } catch (error) {
      this.log(`💥 Integration testing failed: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }
}

// CLI execution
if (require.main === module) {
  const agent = new IntegrationTestingAgent();
  agent.runTests()
    .then(result => {
      if (result.success) {
        console.log('✅ Integration Testing Agent completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Integration Testing Agent failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error.message);
      process.exit(1);
    });
}

module.exports = IntegrationTestingAgent;