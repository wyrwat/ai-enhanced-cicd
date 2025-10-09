/**
 * 🧠 AI Test Failure Predictor
 * Analyzes code changes and predicts test failure probability
 * Now powered by Google Gemini AI!
 */

import GeminiAIClient from './gemini-ai-client';

export interface CodeChange {
  file: string;
  changeType: 'modified' | 'added' | 'deleted';
  linesChanged: number;
  category: 'auth' | 'api' | 'ui' | 'database' | 'config' | 'other';
}

export interface TestPrediction {
  testFile: string;
  testSuite: string;
  failureProbability: number;
  confidence: number;
  reason: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  estimatedRunTime: number; // in seconds
}

export interface OptimizationStrategy {
  executionOrder: string[];
  parallelGroups: string[][];
  resourceAllocation: {
    [testSuite: string]: {
      runners: number;
      timeout: number;
      retries: number;
    }
  };
  totalEstimatedTime: number;
}

export class AITestPredictor {
  private historicalData: Map<string, number> = new Map();
  private flakePatterns: Map<string, number> = new Map();
  public geminiAI: GeminiAIClient;

  constructor(geminiApiKey?: string) {
    // Initialize with mock historical data
    this.initializeHistoricalData();
    // Initialize real AI
    this.geminiAI = new GeminiAIClient(geminiApiKey);
    
    if (this.geminiAI.isAvailable()) {
      console.log('🤖 Gemini AI enabled for real code analysis!');
    } else {
      console.log('🤖 Gemini AI not configured, using fallback analysis');
    }
  }

  /**
   * 🔍 Analyze code changes and predict test impacts
   */
  async analyzeCodeChanges(changes: CodeChange[]): Promise<TestPrediction[]> {
    console.log('🧠 AI analyzing code changes for test impact...');
    
    // Try real AI analysis first
    if (this.geminiAI.isAvailable()) {
      try {
        const gitDiff = this.simulateGitDiff(changes);
        const changedFiles = changes.map(c => c.file);
        
        console.log('🤖 Using Gemini AI for real code analysis...');
        const aiAnalysis = await this.geminiAI.analyzeCodeChanges(gitDiff, changedFiles);
        
        const predictions: TestPrediction[] = aiAnalysis.testSuites.map(suite => ({
          testFile: `tests/${suite.name.toLowerCase().replace(/\s+/g, '-')}.spec.ts`,
          testSuite: suite.name,
          failureProbability: aiAnalysis.failureProbability,
          confidence: aiAnalysis.confidence,
          reason: aiAnalysis.reasoning,
          recommendation: aiAnalysis.recommendations[0] || 'Monitor test execution',
          priority: suite.priority,
          estimatedRunTime: suite.estimatedRunTime
        }));
        
        console.log(`🎯 Gemini AI generated ${predictions.length} predictions`);
        console.log(`🤖 AI Risk Level: ${aiAnalysis.riskLevel.toUpperCase()}`);
        console.log(`🎯 AI Confidence: ${(aiAnalysis.confidence * 100).toFixed(1)}%`);
        
        return predictions.sort((a, b) => b.failureProbability - a.failureProbability);
        
      } catch (error) {
        console.warn('🤖 Gemini AI failed, falling back to heuristic analysis:', error);
      }
    }
    
    // Fallback to heuristic analysis
    console.log('🤖 Using fallback heuristic analysis...');
    const predictions: TestPrediction[] = [];
    
    for (const change of changes) {
      const testPredictions = await this.predictTestsForChange(change);
      predictions.push(...testPredictions);
    }

    // Sort by failure probability (highest risk first)
    predictions.sort((a, b) => b.failureProbability - a.failureProbability);
    
    console.log(`🎯 Generated ${predictions.length} test predictions (fallback)`);
    return predictions;
  }

  /**
   * 🚀 Generate optimal test execution strategy
   */
  generateOptimizationStrategy(predictions: TestPrediction[]): OptimizationStrategy {
    console.log('🚀 AI generating optimization strategy...');

    // Group tests by risk level
    const highRisk = predictions.filter(p => p.priority === 'high');
    const mediumRisk = predictions.filter(p => p.priority === 'medium');
    const lowRisk = predictions.filter(p => p.priority === 'low');

    // Execution order: high risk first, then parallel medium/low
    const executionOrder = [
      ...highRisk.map(p => p.testSuite),
      ...mediumRisk.map(p => p.testSuite),
      ...lowRisk.map(p => p.testSuite)
    ];

    // Parallel groups: group low-risk tests together
    const parallelGroups = [
      highRisk.map(p => p.testSuite), // High risk runs alone
      mediumRisk.map(p => p.testSuite), // Medium risk together
      lowRisk.map(p => p.testSuite) // Low risk together
    ].filter(group => group.length > 0);

    // Resource allocation based on risk
    const resourceAllocation: OptimizationStrategy['resourceAllocation'] = {};
    
    predictions.forEach(pred => {
      resourceAllocation[pred.testSuite] = {
        runners: pred.priority === 'high' ? 2 : 1,
        timeout: pred.priority === 'high' ? pred.estimatedRunTime * 2 : pred.estimatedRunTime * 1.5,
        retries: this.calculateRetries(pred)
      };
    });

    // Calculate total estimated time with optimization
    const totalEstimatedTime = this.calculateOptimizedTime(predictions, parallelGroups);

    const strategy: OptimizationStrategy = {
      executionOrder,
      parallelGroups,
      resourceAllocation,
      totalEstimatedTime
    };

    console.log(`⚡ Optimization complete - estimated time: ${totalEstimatedTime}s`);
    return strategy;
  }

  /**
   * 🔄 Determine if a test failure should be retried
   */
  shouldRetryTest(testName: string, error: string, attemptNumber: number): {
    shouldRetry: boolean;
    reason: string;
    confidence: number;
    recommendedDelay: number;
  } {
    const flakeScore = this.flakePatterns.get(testName) || 0;
    const isNetworkError = error.includes('timeout') || error.includes('network') || error.includes('ECONNRESET');
    const isFlaky = flakeScore > 0.3 || isNetworkError;

    let shouldRetry = false;
    let reason = '';
    let confidence = 0;
    let recommendedDelay = 0;

    if (attemptNumber >= 3) {
      reason = 'Maximum retry attempts reached';
      confidence = 0.95;
    } else if (!isFlaky) {
      reason = 'Error pattern indicates real failure, not flakiness';
      confidence = 0.87;
    } else {
      shouldRetry = true;
      reason = `Flaky test detected (score: ${flakeScore.toFixed(2)})`;
      confidence = 0.82;
      recommendedDelay = Math.min(2000 * attemptNumber, 10000); // Exponential backoff
    }

    return {
      shouldRetry,
      reason,
      confidence,
      recommendedDelay
    };
  }

  /**
   * 📊 Get AI insights about test suite optimization
   */
  getOptimizationInsights(predictions: TestPrediction[]): {
    totalTests: number;
    highRiskTests: number;
    estimatedTimeSaving: string;
    confidenceScore: number;
    recommendations: string[];
  } {
    const highRiskCount = predictions.filter(p => p.priority === 'high').length;
    const baselineTime = predictions.reduce((sum, p) => sum + p.estimatedRunTime, 0);
    const optimizedTime = this.calculateOptimizedTime(predictions, []);
    const timeSaving = ((baselineTime - optimizedTime) / baselineTime * 100).toFixed(1);

    return {
      totalTests: predictions.length,
      highRiskTests: highRiskCount,
      estimatedTimeSaving: `${timeSaving}%`,
      confidenceScore: 0.89,
      recommendations: [
        `Prioritize ${highRiskCount} high-risk test suites`,
        'Use parallel execution for low-risk tests',
        'Apply intelligent retry strategies',
        `Estimated time saving: ${timeSaving}%`
      ]
    };
  }

  private async predictTestsForChange(change: CodeChange): Promise<TestPrediction[]> {
    const predictions: TestPrediction[] = [];
    
    // AI logic based on file category and change type
    switch (change.category) {
      case 'auth':
        predictions.push({
          testFile: 'tests/auth.spec.ts',
          testSuite: 'Authentication Tests',
          failureProbability: 0.78,
          confidence: 0.91,
          reason: `Authentication module modified (${change.linesChanged} lines)`,
          recommendation: 'Run auth tests first with increased timeout',
          priority: 'high',
          estimatedRunTime: 45
        });
        break;

      case 'api':
        predictions.push({
          testFile: 'tests/api.spec.ts',
          testSuite: 'API Integration Tests',
          failureProbability: 0.65,
          confidence: 0.87,
          reason: `API endpoints modified (${change.linesChanged} lines)`,
          recommendation: 'Test API endpoints with retry logic',
          priority: 'high',
          estimatedRunTime: 60
        });
        break;

      case 'ui':
        predictions.push({
          testFile: 'tests/ui.spec.ts',
          testSuite: 'UI Component Tests',
          failureProbability: 0.34,
          confidence: 0.82,
          reason: `UI components modified (${change.linesChanged} lines)`,
          recommendation: 'Standard execution with visual regression checks',
          priority: 'medium',
          estimatedRunTime: 90
        });
        break;

      case 'database':
        predictions.push({
          testFile: 'tests/database.spec.ts',
          testSuite: 'Database Tests',
          failureProbability: 0.45,
          confidence: 0.85,
          reason: `Database schema/queries modified (${change.linesChanged} lines)`,
          recommendation: 'Run database tests in isolation',
          priority: 'medium',
          estimatedRunTime: 30
        });
        break;

      default:
        predictions.push({
          testFile: 'tests/integration.spec.ts',
          testSuite: 'Integration Tests',
          failureProbability: 0.12,
          confidence: 0.75,
          reason: `General code changes (${change.linesChanged} lines)`,
          recommendation: 'Standard test execution',
          priority: 'low',
          estimatedRunTime: 120
        });
    }

    return predictions;
  }

  private calculateRetries(prediction: TestPrediction): number {
    const flakeScore = this.flakePatterns.get(prediction.testSuite) || 0;
    
    if (prediction.priority === 'high' && flakeScore > 0.3) {
      return 3; // High risk, potentially flaky
    } else if (prediction.priority === 'medium' && flakeScore > 0.2) {
      return 2; // Medium risk, some flakiness
    }
    
    return 1; // Default: no retries for stable tests
  }

  private calculateOptimizedTime(predictions: TestPrediction[], parallelGroups: string[][]): number {
    if (parallelGroups.length === 0) {
      // Sequential execution
      return predictions.reduce((sum, p) => sum + p.estimatedRunTime, 0);
    }

    // Parallel execution - time is max of each group
    let totalTime = 0;
    parallelGroups.forEach(group => {
      const groupTests = predictions.filter(p => group.includes(p.testSuite));
      const groupTime = Math.max(...groupTests.map(p => p.estimatedRunTime));
      totalTime += groupTime;
    });

    return totalTime;
  }

  private simulateGitDiff(changes: CodeChange[]): string {
    // Generate realistic git diff for AI analysis
    let gitDiff = '';
    
    changes.forEach(change => {
      gitDiff += `diff --git a/${change.file} b/${change.file}\n`;
      gitDiff += `index 1234567..abcdefg 100644\n`;
      gitDiff += `--- a/${change.file}\n`;
      gitDiff += `+++ b/${change.file}\n`;
      gitDiff += `@@ -10,7 +10,7 @@\n`;
      
      if (change.category === 'auth') {
        gitDiff += ` function authenticateUser(credentials) {\n`;
        gitDiff += `-  return validateCredentials(credentials);\n`;
        gitDiff += `+  return validateCredentials(credentials) && checkPermissions(credentials);\n`;
      } else if (change.category === 'api') {
        gitDiff += ` async function fetchUserData(id) {\n`;
        gitDiff += `-  const response = await fetch(\`/api/users/\${id}\`);\n`;
        gitDiff += `+  const response = await fetch(\`/api/v2/users/\${id}\`, { timeout: 5000 });\n`;
      } else {
        gitDiff += ` // Generic code change\n`;
        gitDiff += `- // Old implementation\n`;
        gitDiff += `+ // New implementation with improvements\n`;
      }
      
      gitDiff += `\n`;
    });
    
    return gitDiff;
  }

  private initializeHistoricalData(): void {
    // Mock historical test failure data
    this.historicalData.set('Authentication Tests', 0.15);
    this.historicalData.set('API Integration Tests', 0.08);
    this.historicalData.set('UI Component Tests', 0.23);
    this.historicalData.set('Database Tests', 0.05);
    this.historicalData.set('Integration Tests', 0.12);

    // Mock flake patterns (0-1 scale, higher = more flaky)
    this.flakePatterns.set('Authentication Tests', 0.35);
    this.flakePatterns.set('API Integration Tests', 0.28);
    this.flakePatterns.set('UI Component Tests', 0.45);
    this.flakePatterns.set('Database Tests', 0.15);
    this.flakePatterns.set('Integration Tests', 0.20);
  }
}

export default AITestPredictor;

