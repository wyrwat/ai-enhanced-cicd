/**
 * 🤖 Google Gemini AI Client - Real AI Integration
 * Free tier: 15 requests per minute, 1500 requests per day
 */

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export interface AICodeAnalysis {
  riskLevel: 'high' | 'medium' | 'low';
  failureProbability: number;
  confidence: number;
  reasoning: string;
  recommendations: string[];
  testSuites: {
    name: string;
    priority: 'high' | 'medium' | 'low';
    estimatedRunTime: number;
  }[];
}

export interface AITestFailureAnalysis {
  isFlaky: boolean;
  shouldRetry: boolean;
  confidence: number;
  reasoning: string;
  recommendedDelay: number;
}

export interface AIPerformanceAnalysis {
  score: number;
  anomalies: string[];
  recommendations: string[];
  confidence: number;
  trends: {
    responseTime: 'improving' | 'stable' | 'degrading';
    throughput: 'improving' | 'stable' | 'degrading';
    errors: 'improving' | 'stable' | 'degrading';
  };
}

export class GeminiAIClient {
  private genAI!: GoogleGenerativeAI;
  private model!: GenerativeModel;
  private isEnabled: boolean;

  constructor(apiKey?: string) {
    this.isEnabled = !!(apiKey || process.env.GEMINI_API_KEY);
    
    if (this.isEnabled) {
      this.genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY!);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent results
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      });
    }
  }

  /**
   * 🧠 Real AI analysis of code changes
   */
  async analyzeCodeChanges(gitDiff: string, changedFiles: string[]): Promise<AICodeAnalysis> {
    if (!this.isEnabled) {
      console.log('🤖 Gemini AI not configured, using fallback analysis');
      return this.fallbackCodeAnalysis(changedFiles);
    }

    try {
      const prompt = `You are an expert DevOps AI analyzing code changes for CI/CD optimization.

CHANGED FILES: ${changedFiles.join(', ')}

GIT DIFF:
${gitDiff.slice(0, 2000)} ${gitDiff.length > 2000 ? '...(truncated)' : ''}

Analyze this code change and provide a JSON response with:

1. riskLevel: "high", "medium", or "low" for test failure risk
2. failureProbability: number between 0.0 and 1.0
3. confidence: your confidence in this assessment (0.0 to 1.0)
4. reasoning: brief explanation (max 100 chars)
5. recommendations: array of 2-3 specific actionable recommendations
6. testSuites: array of test suites that should be prioritized, each with:
   - name: test suite name
   - priority: "high", "medium", or "low"
   - estimatedRunTime: estimated seconds

Focus on:
- Authentication changes (high risk)
- API/database changes (medium-high risk)
- UI changes (medium risk)
- Configuration changes (low-medium risk)

Respond ONLY with valid JSON:`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return this.parseCodeAnalysisResponse(text, changedFiles);
      
    } catch (error) {
      console.warn('🤖 Gemini AI analysis failed, using fallback:', error);
      return this.fallbackCodeAnalysis(changedFiles);
    }
  }

  /**
   * 🔍 Real AI analysis of test failures
   */
  async analyzeTestFailure(testName: string, errorMessage: string, attemptNumber: number): Promise<AITestFailureAnalysis> {
    if (!this.isEnabled) {
      return this.fallbackFailureAnalysis(errorMessage, attemptNumber);
    }

    try {
      const prompt = `Analyze this test failure to determine if it's flaky or a real issue:

TEST NAME: ${testName}
ATTEMPT NUMBER: ${attemptNumber}
ERROR MESSAGE: ${errorMessage.slice(0, 500)}

Common flaky test patterns:
- Network timeouts, connection resets
- Race conditions, timing issues
- Browser/DOM not ready
- External service unavailability
- File system locks

Real failure patterns:
- Syntax errors, type errors
- Logic errors, assertion failures
- Missing dependencies
- Configuration issues

Respond with ONLY valid JSON:
{
  "isFlaky": boolean,
  "shouldRetry": boolean,
  "confidence": number (0.0-1.0),
  "reasoning": "brief explanation (max 80 chars)",
  "recommendedDelay": number (milliseconds for retry delay)
}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return this.parseFailureAnalysisResponse(text, errorMessage, attemptNumber);
      
    } catch (error) {
      console.warn('🤖 Gemini AI failure analysis failed, using fallback:', error);
      return this.fallbackFailureAnalysis(errorMessage, attemptNumber);
    }
  }

  /**
   * 📊 Real AI performance analysis
   */
  async analyzePerformance(metrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    cpuUsage?: number;
    memoryUsage?: number;
  }): Promise<AIPerformanceAnalysis> {
    if (!this.isEnabled) {
      return this.fallbackPerformanceAnalysis(metrics);
    }

    try {
      const prompt = `Analyze these performance metrics and provide insights:

CURRENT METRICS:
- Response Time: ${metrics.responseTime}s
- Throughput: ${metrics.throughput} requests/min
- Error Rate: ${metrics.errorRate}%
- CPU Usage: ${metrics.cpuUsage || 'N/A'}%
- Memory Usage: ${metrics.memoryUsage || 'N/A'}%

PERFORMANCE BENCHMARKS:
- Excellent response time: < 1s
- Good response time: 1-2s
- Poor response time: > 3s
- Low error rate: < 1%
- High error rate: > 5%

Respond with ONLY valid JSON:
{
  "score": number (0-100, performance score),
  "anomalies": array of strings (detected issues),
  "recommendations": array of strings (2-3 optimization suggestions),
  "confidence": number (0.0-1.0),
  "trends": {
    "responseTime": "improving|stable|degrading",
    "throughput": "improving|stable|degrading", 
    "errors": "improving|stable|degrading"
  }
}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return this.parsePerformanceAnalysisResponse(text, metrics);
      
    } catch (error) {
      console.warn('🤖 Gemini AI performance analysis failed, using fallback:', error);
      return this.fallbackPerformanceAnalysis(metrics);
    }
  }

  /**
   * 🔧 Check if Gemini AI is available
   */
  isAvailable(): boolean {
    return this.isEnabled;
  }

  /**
   * 📊 Get API usage info
   */
  getUsageInfo(): {
    provider: string;
    freeLimit: string;
    costAfterLimit: string;
    estimatedMonthlyCost: string;
  } {
    return {
      provider: 'Google Gemini Pro',
      freeLimit: '15 requests/minute, 1500 requests/day',
      costAfterLimit: '$0.0005 per 1K characters',
      estimatedMonthlyCost: '$0 (within free tier for typical CI/CD usage)'
    };
  }

  // Private helper methods
  private parseCodeAnalysisResponse(text: string, changedFiles: string[]): AICodeAnalysis {
    try {
      // Log response for debugging
      console.log('🔍 AI Response length:', text.length);
      console.log('🔍 AI Response preview:', text.slice(0, 200));
      
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = text;
      
      // Remove markdown code blocks if present
      const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
        console.log('🔍 Found JSON in markdown block');
      } else {
        // Try to find raw JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
          console.log('🔍 Found raw JSON');
        }
      }
      
      console.log('🔍 Parsing JSON:', jsonText.slice(0, 100) + '...');
      const parsed = JSON.parse(jsonText);
        
        return {
          riskLevel: this.validateRiskLevel(parsed.riskLevel),
          failureProbability: Math.max(0, Math.min(1, Number(parsed.failureProbability) || 0.3)),
          confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.8)),
          reasoning: String(parsed.reasoning || 'AI analysis completed').slice(0, 100),
          recommendations: Array.isArray(parsed.recommendations) 
            ? parsed.recommendations.slice(0, 3) 
            : ['Review test coverage', 'Monitor deployment'],
          testSuites: Array.isArray(parsed.testSuites) 
            ? parsed.testSuites.map((suite: any) => ({
                name: String(suite.name || 'Integration Tests'),
                priority: this.validateRiskLevel(suite.priority),
                estimatedRunTime: Math.max(10, Number(suite.estimatedRunTime) || 60)
              }))
            : this.generateDefaultTestSuites(changedFiles)
        };
      }
    } catch (error) {
      console.warn('Failed to parse Gemini response:', error);
    }
    
    return this.fallbackCodeAnalysis(changedFiles);
  }

  private parseFailureAnalysisResponse(text: string, errorMessage: string, attemptNumber: number): AITestFailureAnalysis {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          isFlaky: Boolean(parsed.isFlaky),
          shouldRetry: Boolean(parsed.shouldRetry) && attemptNumber < 3,
          confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.7)),
          reasoning: String(parsed.reasoning || 'AI analysis completed').slice(0, 80),
          recommendedDelay: Math.max(1000, Math.min(10000, Number(parsed.recommendedDelay) || 2000))
        };
      }
    } catch (error) {
      console.warn('Failed to parse Gemini failure response:', error);
    }
    
    return this.fallbackFailureAnalysis(errorMessage, attemptNumber);
  }

  private parsePerformanceAnalysisResponse(text: string, metrics: any): AIPerformanceAnalysis {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          score: Math.max(0, Math.min(100, Number(parsed.score) || 75)),
          anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies.slice(0, 3) : [],
          recommendations: Array.isArray(parsed.recommendations) 
            ? parsed.recommendations.slice(0, 3) 
            : ['Monitor trends', 'Optimize queries'],
          confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.8)),
          trends: {
            responseTime: this.validateTrend(parsed.trends?.responseTime),
            throughput: this.validateTrend(parsed.trends?.throughput),
            errors: this.validateTrend(parsed.trends?.errors)
          }
        };
      }
    } catch (error) {
      console.warn('Failed to parse Gemini performance response:', error);
    }
    
    return this.fallbackPerformanceAnalysis(metrics);
  }

  // Fallback methods
  private fallbackCodeAnalysis(changedFiles: string[]): AICodeAnalysis {
    const hasAuthChanges = changedFiles.some(f => f.toLowerCase().includes('auth'));
    const hasAPIChanges = changedFiles.some(f => f.toLowerCase().includes('api'));
    
    let riskLevel: 'high' | 'medium' | 'low' = 'low';
    let failureProbability = 0.15;
    
    if (hasAuthChanges) {
      riskLevel = 'high';
      failureProbability = 0.75;
    } else if (hasAPIChanges) {
      riskLevel = 'medium';
      failureProbability = 0.45;
    }

    return {
      riskLevel,
      failureProbability,
      confidence: 0.6,
      reasoning: 'Heuristic analysis - Gemini AI unavailable',
      recommendations: [
        'Run affected test suites first',
        'Monitor for integration issues',
        'Consider additional validation'
      ],
      testSuites: this.generateDefaultTestSuites(changedFiles)
    };
  }

  private fallbackFailureAnalysis(errorMessage: string, attemptNumber: number): AITestFailureAnalysis {
    const isNetworkError = errorMessage.toLowerCase().includes('timeout') || 
                          errorMessage.toLowerCase().includes('network') ||
                          errorMessage.toLowerCase().includes('econnreset');
    
    return {
      isFlaky: isNetworkError,
      shouldRetry: isNetworkError && attemptNumber < 3,
      confidence: 0.7,
      reasoning: 'Heuristic analysis - network patterns detected',
      recommendedDelay: 2000 * attemptNumber
    };
  }

  private fallbackPerformanceAnalysis(metrics: any): AIPerformanceAnalysis {
    const score = Math.max(0, 100 - (metrics.responseTime * 20) - (metrics.errorRate * 15));
    const anomalies: string[] = [];
    
    if (metrics.responseTime > 3) anomalies.push('High response time detected');
    if (metrics.errorRate > 5) anomalies.push('High error rate detected');
    
    return {
      score: Math.round(score),
      anomalies,
      recommendations: [
        'Monitor performance trends',
        'Consider implementing caching',
        'Optimize database queries'
      ],
      confidence: 0.6,
      trends: {
        responseTime: 'stable',
        throughput: 'stable',
        errors: 'stable'
      }
    };
  }

  private generateDefaultTestSuites(changedFiles: string[]): AICodeAnalysis['testSuites'] {
    const suites: AICodeAnalysis['testSuites'] = [];
    
    if (changedFiles.some(f => f.includes('auth'))) {
      suites.push({ name: 'Authentication Tests', priority: 'high', estimatedRunTime: 45 });
    }
    if (changedFiles.some(f => f.includes('api'))) {
      suites.push({ name: 'API Integration Tests', priority: 'high', estimatedRunTime: 60 });
    }
    if (changedFiles.some(f => f.includes('ui') || f.includes('component'))) {
      suites.push({ name: 'UI Component Tests', priority: 'medium', estimatedRunTime: 90 });
    }
    
    if (suites.length === 0) {
      suites.push({ name: 'Integration Tests', priority: 'low', estimatedRunTime: 120 });
    }
    
    return suites;
  }

  private validateRiskLevel(level: any): 'high' | 'medium' | 'low' {
    if (level === 'high' || level === 'medium' || level === 'low') {
      return level;
    }
    return 'medium';
  }

  private validateTrend(trend: any): 'improving' | 'stable' | 'degrading' {
    if (trend === 'improving' || trend === 'stable' || trend === 'degrading') {
      return trend;
    }
    return 'stable';
  }
}

export default GeminiAIClient;
