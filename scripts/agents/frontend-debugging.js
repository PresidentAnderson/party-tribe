#!/usr/bin/env node

/**
 * Frontend Debugging Agent
 * Monitors client-side performance, errors, and user experience metrics
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class FrontendDebuggingAgent {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
    this.partyTribeRoot = path.join(this.projectRoot, 'party-tribe');
    this.webAppRoot = path.join(this.partyTribeRoot, 'apps/web');
    this.logFile = path.join(__dirname, 'logs/frontend-debugging.log');
    this.startTime = Date.now();
    this.metrics = {
      errors: [],
      warnings: [],
      performance: {},
      accessibility: {},
      seo: {}
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

  async analyzeBuildArtifacts() {
    this.log('🔍 Analyzing build artifacts...');
    
    const nextBuildDir = path.join(this.webAppRoot, '.next');
    if (!fs.existsSync(nextBuildDir)) {
      this.log('❌ Next.js build directory not found', 'ERROR');
      throw new Error('Frontend not built. Run build first.');
    }

    // Analyze bundle sizes
    const staticDir = path.join(nextBuildDir, 'static');
    if (fs.existsSync(staticDir)) {
      const bundleStats = this.analyzeBundleSizes(staticDir);
      this.metrics.performance.bundleStats = bundleStats;
      this.log(`📦 Bundle analysis complete: ${bundleStats.totalSize} total`);
    }

    // Check for build warnings/errors in build manifest
    const buildManifest = path.join(nextBuildDir, 'build-manifest.json');
    if (fs.existsSync(buildManifest)) {
      const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
      this.log(`✅ Build manifest validated - ${Object.keys(manifest.pages).length} pages`);
    }
  }

  analyzeBundleSizes(staticDir) {
    const stats = {
      jsFiles: [],
      cssFiles: [],
      totalSize: 0,
      largestFiles: []
    };

    const analyzeDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          analyzeDirectory(itemPath);
        } else {
          const size = stat.size;
          const ext = path.extname(item);
          const fileInfo = { name: item, size, path: itemPath };
          
          if (ext === '.js') {
            stats.jsFiles.push(fileInfo);
          } else if (ext === '.css') {
            stats.cssFiles.push(fileInfo);
          }
          
          stats.totalSize += size;
          stats.largestFiles.push(fileInfo);
        }
      }
    };

    analyzeDirectory(staticDir);
    
    // Sort by size and get top 10 largest files
    stats.largestFiles.sort((a, b) => b.size - a.size);
    stats.largestFiles = stats.largestFiles.slice(0, 10);
    
    return stats;
  }

  async validateComponents() {
    this.log('🧩 Validating React components...');
    
    const srcDir = path.join(this.webAppRoot, 'src');
    const componentIssues = [];

    const validateDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          validateDirectory(itemPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
          const issues = this.validateComponent(itemPath);
          if (issues.length > 0) {
            componentIssues.push({ file: itemPath, issues });
          }
        }
      }
    };

    if (fs.existsSync(srcDir)) {
      validateDirectory(srcDir);
    }

    this.metrics.errors = componentIssues;
    
    if (componentIssues.length === 0) {
      this.log('✅ All components validated successfully');
    } else {
      this.log(`⚠️ Found ${componentIssues.length} component(s) with issues`, 'WARN');
    }
  }

  validateComponent(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for common React issues
    const checks = [
      {
        name: 'Missing key prop in lists',
        pattern: /\.map\([^}]*<[^>]*(?!.*key=)/g,
        severity: 'warning'
      },
      {
        name: 'Console.log statements',
        pattern: /console\.log\(/g,
        severity: 'warning'
      },
      {
        name: 'Inline styles (should use CSS modules/Tailwind)',
        pattern: /style=\{\{/g,
        severity: 'info'
      },
      {
        name: 'Missing alt attribute on images',
        pattern: /<img(?![^>]*alt=)/g,
        severity: 'warning'
      },
      {
        name: 'Unsafe innerHTML usage',
        pattern: /dangerouslySetInnerHTML/g,
        severity: 'error'
      }
    ];

    for (const check of checks) {
      const matches = content.match(check.pattern);
      if (matches) {
        issues.push({
          type: check.name,
          severity: check.severity,
          count: matches.length
        });
      }
    }

    return issues;
  }

  async checkAccessibility() {
    this.log('♿ Checking accessibility compliance...');
    
    const accessibilityChecks = {
      semanticHtml: 0,
      ariaLabels: 0,
      colorContrast: 'not-checked',
      keyboardNavigation: 'not-checked'
    };

    // Check for semantic HTML usage
    const layoutPath = path.join(this.webAppRoot, 'src/app/layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, 'utf8');
      
      // Check for semantic elements
      const semanticElements = ['main', 'nav', 'header', 'footer', 'section', 'article'];
      for (const element of semanticElements) {
        if (content.includes(`<${element}`)) {
          accessibilityChecks.semanticHtml++;
        }
      }

      // Check for aria-labels
      const ariaMatches = content.match(/aria-\w+=/g);
      accessibilityChecks.ariaLabels = ariaMatches ? ariaMatches.length : 0;
    }

    this.metrics.accessibility = accessibilityChecks;
    this.log(`✅ Accessibility check complete - ${accessibilityChecks.semanticHtml} semantic elements found`);
  }

  async validateSEO() {
    this.log('🔍 Validating SEO configuration...');
    
    const seoChecks = {
      metaTags: 0,
      openGraph: 0,
      structuredData: 0,
      robotsTxt: false,
      sitemap: false
    };

    // Check layout.tsx for meta tags
    const layoutPath = path.join(this.webAppRoot, 'src/app/layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, 'utf8');
      
      // Count meta configurations
      if (content.includes('title:')) seoChecks.metaTags++;
      if (content.includes('description:')) seoChecks.metaTags++;
      if (content.includes('keywords:')) seoChecks.metaTags++;
      if (content.includes('openGraph')) seoChecks.openGraph++;
    }

    // Check for robots.txt
    const robotsPath = path.join(this.webAppRoot, 'public/robots.txt');
    seoChecks.robotsTxt = fs.existsSync(robotsPath);

    // Check for sitemap
    const sitemapPath = path.join(this.webAppRoot, 'public/sitemap.xml');
    seoChecks.sitemap = fs.existsSync(sitemapPath);

    this.metrics.seo = seoChecks;
    this.log(`✅ SEO validation complete - ${seoChecks.metaTags} meta tags configured`);
  }

  async performLinting() {
    this.log('🔧 Running ESLint checks...');
    
    try {
      // Run ESLint on the web app
      const eslintResult = execSync('pnpm lint', {
        cwd: this.webAppRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.log('✅ ESLint checks passed');
      return { success: true, output: eslintResult };
    } catch (error) {
      this.log(`⚠️ ESLint found issues: ${error.message}`, 'WARN');
      return { success: false, output: error.stdout || error.message };
    }
  }

  async checkTypeScript() {
    this.log('📝 Running TypeScript type checks...');
    
    try {
      const tscResult = execSync('pnpm type-check', {
        cwd: this.webAppRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.log('✅ TypeScript type checks passed');
      return { success: true, output: tscResult };
    } catch (error) {
      this.log(`❌ TypeScript errors found: ${error.message}`, 'ERROR');
      return { success: false, output: error.stdout || error.message };
    }
  }

  async generateDebuggingReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      agent: 'Frontend Debugging Agent',
      version: '1.0.0',
      metrics: this.metrics,
      summary: {
        totalErrors: this.metrics.errors.length,
        bundleSize: this.metrics.performance.bundleStats?.totalSize || 0,
        accessibilityScore: this.calculateAccessibilityScore(),
        seoScore: this.calculateSEOScore()
      },
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(__dirname, 'reports/frontend-debugging-report.json');
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📊 Frontend debugging report generated: ${reportPath}`);
    this.log(`🎉 Frontend debugging completed in ${duration}s`);
    
    return report;
  }

  calculateAccessibilityScore() {
    const { semanticHtml, ariaLabels } = this.metrics.accessibility;
    const maxScore = 100;
    const semanticScore = Math.min(semanticHtml * 20, 60); // Max 60 points for semantic HTML
    const ariaScore = Math.min(ariaLabels * 10, 40); // Max 40 points for ARIA labels
    return Math.min(semanticScore + ariaScore, maxScore);
  }

  calculateSEOScore() {
    const { metaTags, openGraph, robotsTxt, sitemap } = this.metrics.seo;
    let score = 0;
    score += metaTags * 20; // 20 points per meta tag
    score += openGraph * 10; // 10 points for Open Graph
    score += robotsTxt ? 15 : 0; // 15 points for robots.txt
    score += sitemap ? 15 : 0; // 15 points for sitemap
    return Math.min(score, 100);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.errors.length > 0) {
      recommendations.push('Fix component validation issues for better code quality');
    }
    
    if (this.metrics.accessibility.semanticHtml < 5) {
      recommendations.push('Add more semantic HTML elements for better accessibility');
    }
    
    if (this.metrics.seo.metaTags < 3) {
      recommendations.push('Add more meta tags for better SEO');
    }
    
    if (!this.metrics.seo.robotsTxt) {
      recommendations.push('Add robots.txt file for search engine optimization');
    }
    
    if (this.metrics.performance.bundleStats?.totalSize > 1000000) {
      recommendations.push('Consider bundle optimization - total size exceeds 1MB');
    }
    
    return recommendations;
  }

  async debug() {
    try {
      this.log('🚀 Starting Frontend Debugging Agent...');
      
      await this.analyzeBuildArtifacts();
      await this.validateComponents();
      await this.checkAccessibility();
      await this.validateSEO();
      await this.performLinting();
      await this.checkTypeScript();
      
      const report = await this.generateDebuggingReport();
      
      return { success: true, report };
    } catch (error) {
      this.log(`💥 Debugging failed: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }
}

// CLI execution
if (require.main === module) {
  const agent = new FrontendDebuggingAgent();
  agent.debug()
    .then(result => {
      if (result.success) {
        console.log('✅ Frontend Debugging Agent completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Frontend Debugging Agent failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error.message);
      process.exit(1);
    });
}

module.exports = FrontendDebuggingAgent;