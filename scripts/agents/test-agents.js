#!/usr/bin/env node

/**
 * Test All Agents
 * Simple test runner to verify all agents can be instantiated and run
 */

const fs = require('fs');
const path = require('path');

class AgentTester {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(logMessage);
  }

  async testAgent(agentName, agentPath) {
    this.log(`🧪 Testing ${agentName}...`);
    
    try {
      // Check if file exists
      if (!fs.existsSync(agentPath)) {
        throw new Error('Agent file not found');
      }

      // Try to require the agent
      const AgentClass = require(agentPath);
      
      // Instantiate the agent
      const agent = new AgentClass();
      
      // Check if agent has required properties
      if (typeof agent.log !== 'function') {
        throw new Error('Agent missing log method');
      }

      this.testResults.push({
        name: agentName,
        status: 'PASS',
        message: 'Agent loaded and instantiated successfully'
      });
      
      this.log(`✅ ${agentName}: PASS`);
      return true;
    } catch (error) {
      this.testResults.push({
        name: agentName,
        status: 'FAIL',
        message: error.message
      });
      
      this.log(`❌ ${agentName}: FAIL - ${error.message}`, 'ERROR');
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting agent tests...');
    
    const agents = [
      { name: 'Backend Deployment Agent', path: './backend-deployment.js' },
      { name: 'Frontend Debugging Agent', path: './frontend-debugging.js' },
      { name: 'Database Configuration Agent', path: './database-configuration.js' },
      { name: 'Environment Setup Agent', path: './environment-setup.js' },
      { name: 'Integration Testing Agent', path: './integration-testing.js' },
      { name: 'Platform Deployment Verification Agent', path: './platform-deployment-verification.js' }
    ];

    const results = [];
    for (const agent of agents) {
      const success = await this.testAgent(agent.name, agent.path);
      results.push(success);
    }

    const passedTests = results.filter(r => r).length;
    const totalTests = results.length;
    
    this.log('');
    this.log('📊 Test Results Summary:');
    this.log(`✅ Passed: ${passedTests}/${totalTests}`);
    this.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
      this.log('🎉 All agents tests passed!');
      return true;
    } else {
      this.log('⚠️ Some agent tests failed', 'WARN');
      return false;
    }
  }

  async generateTestReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      testRunner: 'Agent Tester',
      version: '1.0.0',
      results: this.testResults,
      summary: {
        totalTests: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length
      }
    };

    // Ensure reports directory exists
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, 'agent-tests-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📊 Test report generated: ${reportPath}`);
    return report;
  }
}

// CLI execution
if (require.main === module) {
  const tester = new AgentTester();
  tester.runAllTests()
    .then(async (success) => {
      await tester.generateTestReport();
      
      if (success) {
        console.log('✅ All agent tests completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Some agent tests failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error.message);
      process.exit(1);
    });
}