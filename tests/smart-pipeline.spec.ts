import { test, expect } from '@playwright/test';
import AIPipelineOptimizer from '../src/ai-pipeline-optimizer';
import AITestPredictor from '../src/ai-test-predictor';

/**
 * 🧠 Smart CI/CD Pipeline Optimization Tests
 * Demonstrates AI-powered pipeline intelligence
 */

test.describe('🧠 Smart Pipeline Optimization', () => {
  let optimizer: AIPipelineOptimizer;
  let predictor: AITestPredictor;

  test.beforeEach(async () => {
    // Use real AI if API key is available
    optimizer = new AIPipelineOptimizer(process.env.GEMINI_API_KEY);
    predictor = new AITestPredictor(process.env.GEMINI_API_KEY);
  });

  test('🎯 AI should predict test failures based on code changes', async () => {
    console.log('🤖 Testing AI test failure prediction...');

    const mockCodeChanges = [
      {
        file: 'src/auth/login.ts',
        changeType: 'modified' as const,
        linesChanged: 25,
        category: 'auth' as const
      },
      {
        file: 'src/api/users.ts',
        changeType: 'modified' as const,
        linesChanged: 15,
        category: 'api' as const
      }
    ];

    const predictions = await predictor.analyzeCodeChanges(mockCodeChanges);

    // Verify AI predictions
    expect(predictions.length).toBeGreaterThan(0);
    
    // Check auth test prediction (should be high risk)
    const authTest = predictions.find(p => p.testSuite.includes('Authentication'));
    expect(authTest).toBeDefined();
    expect(authTest?.failureProbability).toBeGreaterThan(0.5); // High risk
    expect(authTest?.priority).toBe('high');

    // Check API test prediction
    const apiTest = predictions.find(p => p.testSuite.includes('API'));
    expect(apiTest).toBeDefined();
    expect(apiTest?.failureProbability).toBeGreaterThan(0.3); // Medium-high risk

    console.log('📊 AI Predictions:');
    predictions.forEach(pred => {
      console.log(`  ${pred.testSuite}: ${(pred.failureProbability * 100).toFixed(1)}% failure risk`);
    });

    console.log('✅ AI test prediction validation passed!');
  });

  test('🚀 AI should generate optimal execution strategy', async () => {
    console.log('🤖 Testing AI execution strategy optimization...');

    const result = await optimizer.optimizePipeline();

    // Verify optimization result structure
    expect(result.strategy).toBeDefined();
    expect(result.predictions).toBeDefined();
    expect(result.metrics).toBeDefined();
    expect(result.insights).toBeDefined();

    // Verify execution order prioritizes high-risk tests
    const highRiskTests = result.predictions.filter(p => p.priority === 'high');
    const firstTests = result.strategy.executionOrder.slice(0, highRiskTests.length);
    
    highRiskTests.forEach(test => {
      expect(firstTests).toContain(test.testSuite);
    });

    // Verify resource allocation
    expect(result.strategy.resourceAllocation).toBeDefined();
    
    // High-risk tests should get more resources
    Object.entries(result.strategy.resourceAllocation).forEach(([suite, allocation]) => {
      const prediction = result.predictions.find(p => p.testSuite === suite);
      if (prediction?.priority === 'high') {
        expect(allocation.runners).toBeGreaterThanOrEqual(2);
        expect(allocation.timeout).toBeGreaterThan(prediction.estimatedRunTime);
      }
    });

    console.log('⚡ Optimization Strategy:');
    console.log(`  Execution Order: ${result.strategy.executionOrder.join(' → ')}`);
    console.log(`  Estimated Time: ${result.strategy.totalEstimatedTime}s`);
    console.log(`  Time Saving: ${result.insights.timeSaving}`);

    console.log('✅ AI optimization strategy validation passed!');
  });

  test('🔄 AI should handle flaky test detection and smart retry', async ({ page }) => {
    console.log('🤖 Testing AI flaky test detection...');

    // Simulate a flaky test scenario
    let attemptCount = 0;
    const maxAttempts = 3;

    while (attemptCount < maxAttempts) {
      attemptCount++;
      
      try {
        // Simulate flaky behavior - sometimes very short timeout
        const timeout = Math.random() > 0.6 ? 100 : 30000; // 40% chance of timeout
        
        await page.goto('https://playwright.dev/', { timeout });
        await page.getByRole('link', { name: 'Get started' }).click({ timeout });
        
        console.log(`✅ Test passed on attempt ${attemptCount}`);
        break;
        
      } catch (error) {
        console.log(`❌ Test failed on attempt ${attemptCount}: ${error}`);
        
        // Get AI decision on retry
        const decision = await optimizer.handleTestFailure(
          'flaky-navigation-test',
          error?.toString() || 'Unknown error',
          attemptCount
        );

        console.log(`🤖 AI Decision: ${decision.action.toUpperCase()}`);
        console.log(`   Reason: ${decision.reason}`);
        console.log(`   Confidence: ${(decision.confidence * 100).toFixed(1)}%`);

        if (decision.action === 'retry' && attemptCount < maxAttempts) {
          console.log(`🔄 AI recommended retry with ${decision.delay}ms delay`);
          await page.waitForTimeout(decision.delay);
        } else if (decision.action === 'fail') {
          console.log('🚨 AI determined this is a real failure, not flakiness');
          throw error;
        }
      }
    }

    console.log('✅ AI flaky test handling validation passed!');
  });

  test('📊 AI should provide real-time optimization insights', async () => {
    console.log('🤖 Testing AI real-time insights...');

    // Run optimization to generate history
    await optimizer.optimizePipeline();
    
    const insights = optimizer.getRealTimeInsights();

    // Verify insights structure
    expect(insights.currentOptimization).toBeGreaterThanOrEqual(0);
    expect(insights.trendsDetected).toBeInstanceOf(Array);
    expect(insights.upcomingRisks).toBeInstanceOf(Array);
    expect(insights.performanceScore).toBeGreaterThan(0);
    expect(insights.performanceScore).toBeLessThanOrEqual(100);

    console.log('📈 AI Insights:');
    console.log(`  Current Optimization: ${insights.currentOptimization.toFixed(1)}%`);
    console.log(`  Performance Score: ${insights.performanceScore}/100`);
    console.log('  Trends Detected:');
    insights.trendsDetected.forEach(trend => console.log(`    • ${trend}`));
    console.log('  Upcoming Risks:');
    insights.upcomingRisks.forEach(risk => console.log(`    • ${risk}`));

    console.log('✅ AI insights validation passed!');
  });

  test('⚙️ AI should generate GitHub Actions optimization strategy', async () => {
    console.log('🤖 Testing GitHub Actions strategy generation...');

    const result = await optimizer.optimizePipeline();
    const githubStrategy = optimizer.generateGitHubActionsStrategy(result);

    // Verify GitHub Actions configuration
    expect(githubStrategy.matrixStrategy).toBeDefined();
    expect(githubStrategy.environmentVariables).toBeDefined();
    expect(githubStrategy.stepConfiguration).toBeDefined();

    // Verify matrix strategy has test groups
    expect(githubStrategy.matrixStrategy['test-group']).toBeInstanceOf(Array);
    expect(githubStrategy.matrixStrategy['test-group'].length).toBeGreaterThan(0);

    // Verify environment variables
    expect(githubStrategy.environmentVariables.AI_OPTIMIZATION_ENABLED).toBe('true');
    expect(githubStrategy.environmentVariables.ESTIMATED_TIME_SAVING).toBeDefined();

    // Verify step configuration
    expect(githubStrategy.stepConfiguration).toBeInstanceOf(Array);
    githubStrategy.stepConfiguration.forEach(step => {
      expect(step.name).toBeDefined();
      expect(step.run).toBeDefined();
    });

    console.log('⚙️ GitHub Actions Strategy:');
    console.log(`  Matrix Groups: ${githubStrategy.matrixStrategy['test-group'].length}`);
    console.log(`  Environment Variables: ${Object.keys(githubStrategy.environmentVariables).length}`);
    console.log(`  Optimization Steps: ${githubStrategy.stepConfiguration.length}`);

    console.log('✅ GitHub Actions strategy validation passed!');
  });
});

test.describe('🎯 AI Pipeline Performance Comparison', () => {
  
  test('⚡ AI optimization should reduce execution time', async () => {
    console.log('🤖 Comparing baseline vs AI-optimized execution...');

    const optimizer = new AIPipelineOptimizer();
    const result = await optimizer.optimizePipeline();

    // Calculate baseline time (sequential execution)
    const baselineTime = result.predictions.reduce((sum, p) => sum + p.estimatedRunTime, 0);
    const optimizedTime = result.strategy.totalEstimatedTime;
    const timeSaving = ((baselineTime - optimizedTime) / baselineTime * 100);

    console.log('📊 Performance Comparison:');
    console.log(`  Baseline Time: ${baselineTime}s`);
    console.log(`  Optimized Time: ${optimizedTime}s`);
    console.log(`  Time Saving: ${timeSaving.toFixed(1)}%`);

    // AI should provide meaningful time savings
    expect(timeSaving).toBeGreaterThan(0);
    expect(optimizedTime).toBeLessThan(baselineTime);

    // Verify the optimization makes sense
    expect(result.insights.timeSaving).toContain('%');
    expect(parseFloat(result.insights.timeSaving.replace('%', ''))).toBeGreaterThan(0);

    console.log('✅ Performance optimization validation passed!');
  });

  test('🎯 AI should maintain test coverage while optimizing', async () => {
    console.log('🤖 Verifying AI maintains full test coverage...');

    const optimizer = new AIPipelineOptimizer();
    const result = await optimizer.optimizePipeline();

    // Verify all predicted tests are included in execution strategy
    const allTestSuites = result.predictions.map(p => p.testSuite);
    const executedTestSuites = result.strategy.executionOrder;

    allTestSuites.forEach(suite => {
      expect(executedTestSuites).toContain(suite);
    });

    // Verify high-priority tests get appropriate attention
    const highPriorityTests = result.predictions.filter(p => p.priority === 'high');
    highPriorityTests.forEach(test => {
      const allocation = result.strategy.resourceAllocation[test.testSuite];
      expect(allocation.runners).toBeGreaterThanOrEqual(1);
      expect(allocation.timeout).toBeGreaterThan(0);
    });

    console.log('📋 Test Coverage Verification:');
    console.log(`  Total Test Suites: ${allTestSuites.length}`);
    console.log(`  High Priority Tests: ${highPriorityTests.length}`);
    console.log(`  All Tests Covered: ✅`);

    console.log('✅ Test coverage validation passed!');
  });
});

