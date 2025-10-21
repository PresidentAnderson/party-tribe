#!/usr/bin/env node

/**
 * Database Configuration Agent
 * Manages Prisma schema, migrations, and database health monitoring
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DatabaseConfigurationAgent {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
    this.partyTribeRoot = path.join(this.projectRoot, 'party-tribe');
    this.dbPackageRoot = path.join(this.partyTribeRoot, 'packages/db');
    this.logFile = path.join(__dirname, 'logs/database-configuration.log');
    this.startTime = Date.now();
    this.dbHealth = {
      connection: false,
      migrations: [],
      schema: {},
      performance: {}
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

  async validatePrismaSchema() {
    this.log('📋 Validating Prisma schema...');
    
    const schemaPath = path.join(this.dbPackageRoot, 'prisma/schema.prisma');
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Prisma schema file not found');
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Parse schema for validation
    const models = this.parseSchemaModels(schemaContent);
    const enums = this.parseSchemaEnums(schemaContent);
    
    this.dbHealth.schema = {
      models: models.length,
      enums: enums.length,
      modelNames: models.map(m => m.name),
      enumNames: enums.map(e => e.name)
    };

    // Validate schema syntax
    try {
      execSync('pnpm prisma validate', {
        cwd: this.dbPackageRoot,
        stdio: 'pipe'
      });
      this.log('✅ Prisma schema validation passed');
    } catch (error) {
      this.log(`❌ Prisma schema validation failed: ${error.message}`, 'ERROR');
      throw error;
    }

    // Check for common schema issues
    this.validateSchemaBestPractices(schemaContent);
  }

  parseSchemaModels(schemaContent) {
    const modelRegex = /model\s+(\w+)\s*{([^}]*)}/g;
    const models = [];
    let match;

    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const modelBody = match[2];
      const fields = this.parseModelFields(modelBody);
      
      models.push({
        name: modelName,
        fields: fields.length,
        fieldNames: fields.map(f => f.name)
      });
    }

    return models;
  }

  parseSchemaEnums(schemaContent) {
    const enumRegex = /enum\s+(\w+)\s*{([^}]*)}/g;
    const enums = [];
    let match;

    while ((match = enumRegex.exec(schemaContent)) !== null) {
      const enumName = match[1];
      const enumBody = match[2];
      const values = enumBody.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'));
      
      enums.push({
        name: enumName,
        values: values.length,
        valueNames: values
      });
    }

    return enums;
  }

  parseModelFields(modelBody) {
    const fieldLines = modelBody.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//') && !line.startsWith('@@'));

    return fieldLines.map(line => {
      const parts = line.split(/\s+/);
      return {
        name: parts[0],
        type: parts[1] || 'unknown'
      };
    });
  }

  validateSchemaBestPractices(schemaContent) {
    const issues = [];

    // Check for missing id fields
    const models = this.parseSchemaModels(schemaContent);
    for (const model of models) {
      if (!model.fieldNames.includes('id')) {
        issues.push(`Model ${model.name} is missing an id field`);
      }
      if (!model.fieldNames.includes('createdAt')) {
        issues.push(`Model ${model.name} is missing createdAt timestamp`);
      }
      if (!model.fieldNames.includes('updatedAt')) {
        issues.push(`Model ${model.name} is missing updatedAt timestamp`);
      }
    }

    // Check for missing indexes on foreign keys
    const foreignKeyPattern = /(\w+)Id\s+String/g;
    let match;
    while ((match = foreignKeyPattern.exec(schemaContent)) !== null) {
      if (!schemaContent.includes(`@@index([${match[1]}Id])`)) {
        issues.push(`Missing index on foreign key: ${match[1]}Id`);
      }
    }

    if (issues.length > 0) {
      this.log(`⚠️ Schema best practice issues found:`, 'WARN');
      issues.forEach(issue => this.log(`  - ${issue}`, 'WARN'));
    } else {
      this.log('✅ Schema follows best practices');
    }

    return issues;
  }

  async checkMigrationStatus() {
    this.log('🔄 Checking migration status...');
    
    try {
      const migrationStatus = execSync('pnpm prisma migrate status', {
        cwd: this.dbPackageRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Parse migration status
      if (migrationStatus.includes('Database is up to date')) {
        this.log('✅ Database migrations are up to date');
        this.dbHealth.migrations = ['up-to-date'];
      } else if (migrationStatus.includes('pending migrations')) {
        this.log('⚠️ Pending migrations found', 'WARN');
        this.dbHealth.migrations = ['pending'];
      }
    } catch (error) {
      // If database doesn't exist or no migrations yet
      if (error.message.includes('Database is not initialized')) {
        this.log('ℹ️ Database not initialized - will use db push for development', 'INFO');
        this.dbHealth.migrations = ['not-initialized'];
      } else {
        this.log(`❌ Migration status check failed: ${error.message}`, 'ERROR');
        throw error;
      }
    }
  }

  async generatePrismaClient() {
    this.log('⚙️ Generating Prisma client...');
    
    try {
      execSync('pnpm prisma generate', {
        cwd: this.dbPackageRoot,
        stdio: 'inherit'
      });
      
      this.log('✅ Prisma client generated successfully');
      
      // Verify client files exist
      const clientPath = path.join(this.partyTribeRoot, 'node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client');
      try {
        execSync(`ls ${clientPath}`, { stdio: 'pipe' });
        this.log('✅ Prisma client files verified');
      } catch {
        this.log('⚠️ Prisma client files not found in expected location', 'WARN');
      }
    } catch (error) {
      this.log(`❌ Prisma client generation failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async testDatabaseConnection() {
    this.log('🔌 Testing database connection...');
    
    const envPath = path.join(this.partyTribeRoot, '.env.local');
    if (!fs.existsSync(envPath)) {
      this.log('⚠️ No .env.local file found, skipping connection test', 'WARN');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    if (!envContent.includes('DATABASE_URL=')) {
      this.log('⚠️ No DATABASE_URL found, skipping connection test', 'WARN');
      return;
    }

    // Extract DATABASE_URL
    const dbUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (!dbUrlMatch) {
      this.log('⚠️ DATABASE_URL format invalid, skipping connection test', 'WARN');
      return;
    }

    const dbUrl = dbUrlMatch[1];
    
    // Test if it's a real database URL (not example)
    if (dbUrl.includes('user:password@localhost') || dbUrl.includes('postgresql://user')) {
      this.log('ℹ️ Using example DATABASE_URL, skipping connection test', 'INFO');
      this.dbHealth.connection = 'example-url';
      return;
    }

    try {
      // Create a simple connection test
      const testScript = `
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        async function testConnection() {
          try {
            await prisma.$connect();
            console.log('Connection successful');
            await prisma.$disconnect();
            process.exit(0);
          } catch (error) {
            console.error('Connection failed:', error.message);
            process.exit(1);
          }
        }
        
        testConnection();
      `;

      const testFile = path.join(this.dbPackageRoot, 'test-connection.js');
      fs.writeFileSync(testFile, testScript);

      execSync(`node test-connection.js`, {
        cwd: this.dbPackageRoot,
        stdio: 'pipe',
        timeout: 10000 // 10 second timeout
      });

      this.dbHealth.connection = true;
      this.log('✅ Database connection test passed');

      // Clean up test file
      fs.unlinkSync(testFile);
    } catch (error) {
      this.dbHealth.connection = false;
      this.log(`❌ Database connection test failed: ${error.message}`, 'ERROR');
      
      // Clean up test file if it exists
      const testFile = path.join(this.dbPackageRoot, 'test-connection.js');
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  }

  async performDatabasePush() {
    this.log('📤 Performing database push (development mode)...');
    
    try {
      execSync('pnpm prisma db push', {
        cwd: this.dbPackageRoot,
        stdio: 'inherit'
      });
      
      this.log('✅ Database push completed successfully');
    } catch (error) {
      this.log(`⚠️ Database push failed (expected in CI/CD): ${error.message}`, 'WARN');
      // Don't throw error for db push as it's expected to fail without real database
    }
  }

  async analyzeDatabasePerformance() {
    this.log('📊 Analyzing database schema performance...');
    
    const schemaPath = path.join(this.dbPackageRoot, 'prisma/schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    const performance = {
      indexes: 0,
      relations: 0,
      potentialSlowQueries: []
    };

    // Count indexes
    const indexMatches = schemaContent.match(/@@index\(/g);
    performance.indexes = indexMatches ? indexMatches.length : 0;

    // Count relations
    const relationMatches = schemaContent.match(/@relation\(/g);
    performance.relations = relationMatches ? relationMatches.length : 0;

    // Identify potential performance issues
    const models = this.parseSchemaModels(schemaContent);
    for (const model of models) {
      // Check for large text fields without indexes
      if (model.fieldNames.some(field => field.includes('description') || field.includes('content'))) {
        performance.potentialSlowQueries.push(`${model.name} has large text fields that might need full-text search`);
      }
      
      // Check for many-to-many relationships without proper indexing
      if (model.name.includes('Membership') || model.name.includes('Attendance')) {
        performance.potentialSlowQueries.push(`${model.name} junction table should have compound indexes`);
      }
    }

    this.dbHealth.performance = performance;
    this.log(`✅ Performance analysis complete - ${performance.indexes} indexes, ${performance.relations} relations`);
  }

  async createBackupStrategy() {
    this.log('💾 Creating backup strategy documentation...');
    
    const backupStrategy = {
      strategy: 'Vercel Postgres automatic backups + manual exports',
      frequency: 'Daily automatic, weekly manual verification',
      retention: '30 days automatic, quarterly manual archives',
      recovery: 'Point-in-time recovery available for 30 days',
      monitoring: 'Database size and performance metrics tracked',
      testingSchedule: 'Monthly backup restoration tests'
    };

    const backupPath = path.join(__dirname, 'config/database-backup-strategy.json');
    const configDir = path.dirname(backupPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(backupPath, JSON.stringify(backupStrategy, null, 2));
    this.log(`💾 Backup strategy documented: ${backupPath}`);
  }

  async generateDatabaseReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      agent: 'Database Configuration Agent',
      version: '1.0.0',
      health: this.dbHealth,
      recommendations: this.generateDatabaseRecommendations(),
      summary: {
        schemaValid: true,
        clientGenerated: true,
        modelsCount: this.dbHealth.schema.models || 0,
        enumsCount: this.dbHealth.schema.enums || 0,
        indexesCount: this.dbHealth.performance.indexes || 0
      }
    };

    const reportPath = path.join(__dirname, 'reports/database-configuration-report.json');
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📊 Database configuration report generated: ${reportPath}`);
    this.log(`🎉 Database configuration completed in ${duration}s`);
    
    return report;
  }

  generateDatabaseRecommendations() {
    const recommendations = [];
    
    if (this.dbHealth.performance.indexes < 5) {
      recommendations.push('Consider adding more indexes for frequently queried fields');
    }
    
    if (this.dbHealth.performance.potentialSlowQueries.length > 0) {
      recommendations.push('Review potential slow query patterns identified in schema');
    }
    
    if (this.dbHealth.connection === false) {
      recommendations.push('Set up production database connection for deployment');
    }
    
    if (this.dbHealth.migrations.includes('pending')) {
      recommendations.push('Apply pending migrations before deployment');
    }
    
    recommendations.push('Set up database monitoring and alerting in production');
    recommendations.push('Configure automated backups and test recovery procedures');
    
    return recommendations;
  }

  async configure() {
    try {
      this.log('🚀 Starting Database Configuration Agent...');
      
      await this.validatePrismaSchema();
      await this.checkMigrationStatus();
      await this.generatePrismaClient();
      await this.testDatabaseConnection();
      await this.performDatabasePush();
      await this.analyzeDatabasePerformance();
      await this.createBackupStrategy();
      
      const report = await this.generateDatabaseReport();
      
      return { success: true, report };
    } catch (error) {
      this.log(`💥 Database configuration failed: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }
}

// CLI execution
if (require.main === module) {
  const agent = new DatabaseConfigurationAgent();
  agent.configure()
    .then(result => {
      if (result.success) {
        console.log('✅ Database Configuration Agent completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Database Configuration Agent failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error.message);
      process.exit(1);
    });
}

module.exports = DatabaseConfigurationAgent;