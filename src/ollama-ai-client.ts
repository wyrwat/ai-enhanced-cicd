/**
 * 🤖 Ollama AI Client - Free Local AI Integration
 * Uses CodeLlama for real code analysis
 */

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export interface AICodeAnalysis {
  riskLevel: 'high' | 'medium' | 'low';
  failureProbability: number;
  confidence: number;
  reasoning: string;
  recommendations: string[];
}

export class OllamaAIClient {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = 'http://localhost:11434', model = 'codellama') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  /**
   * 🔍 Analyze git diff with real AI
   */
  async analyzeCodeChanges(gitDiff: string, changedFiles: string[]): Promise<AICodeAnalysis> {
    const prompt = `
You are an expert DevOps engineer analyzing code changes for CI/CD optimization.

CHANGED FILES: ${changedFiles.join(', ')}

GIT DIFF:
${gitDiff}

Analyze this code change and provide:
1. Risk level (high/medium/low) for test failures
2. Failure probability (0.0 to 1.0)
3. Your confidence in this assessment (0.0 to 1.0)
4. Brief reasoning (max 50 words)
5. 2-3 specific recommendations

Respond in this JSON format:
{
  "riskLevel": "high|medium|low",
  "failureProbability": 0.0-1.0,
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation...",
  "recommendations": ["rec1", "rec2", "rec3"]
}
`;

    try {
      const response = await this.callOllama(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.warn('🤖 AI analysis failed, falling back to heuristics:', error);
      return this.fallbackAnalysis(changedFiles);
    }
  }

  /**
   * 🧠 Analyze test failure patterns
   */
  async analyzeTestFailure(testName: string, errorMessage: string, attemptNumber: number): Promise<{
    isFlaky: boolean;
    shouldRetry: boolean;
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `
Analyze this test failure to determine if it's flaky or a real issue:

TEST: ${testName}
ATTEMPT: ${attemptNumber}
ERROR: ${errorMessage}

Based on the error pattern, determine:
1. Is this likely a flaky test? (true/false)
2. Should we retry? (true/false)  
3. Your confidence (0.0 to 1.0)
4. Brief reasoning (max 30 words)

Respond in JSON:
{
  "isFlaky": true|false,
  "shouldRetry": true|false,
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation..."
}
`;

    try {
      const response = await this.callOllama(prompt);
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      // Fallback logic
      const isNetworkError = errorMessage.includes('timeout') || errorMessage.includes('network');
      return {
        isFlaky: isNetworkError,
        shouldRetry: isNetworkError && attemptNumber < 3,
        confidence: 0.7,
        reasoning: 'Heuristic analysis - network patterns detected'
      };
    }
  }

  /**
   * 📊 Performance analysis with AI
   */
  async analyzePerformance(metrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    cpuUsage: number;
  }): Promise<{
    score: number;
    anomalies: string[];
    recommendations: string[];
    confidence: number;
  }> {
    const prompt = `
Analyze these performance metrics:

Response Time: ${metrics.responseTime}s
Throughput: ${metrics.throughput} req/min
Error Rate: ${metrics.errorRate}%
CPU Usage: ${metrics.cpuUsage}%

Provide:
1. Performance score (0-100)
2. Any anomalies detected
3. 2-3 optimization recommendations
4. Confidence in analysis

JSON format:
{
  "score": 0-100,
  "anomalies": ["anomaly1", "anomaly2"],
  "recommendations": ["rec1", "rec2"],
  "confidence": 0.0-1.0
}
`;

    try {
      const response = await this.callOllama(prompt);
      return JSON.parse(response);
    } catch (error) {
      // Fallback scoring
      const score = Math.max(0, 100 - (metrics.responseTime * 10) - (metrics.errorRate * 20));
      return {
        score: Math.round(score),
        anomalies: metrics.responseTime > 3 ? ['High response time'] : [],
        recommendations: ['Monitor trends', 'Consider caching', 'Optimize queries'],
        confidence: 0.6
      };
    }
  }

  private async callOllama(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1, // Low temperature for consistent results
          top_p: 0.9
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  }

  private parseAIResponse(response: string): AICodeAnalysis {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          riskLevel: parsed.riskLevel || 'medium',
          failureProbability: Number(parsed.failureProbability) || 0.3,
          confidence: Number(parsed.confidence) || 0.8,
          reasoning: parsed.reasoning || 'AI analysis completed',
          recommendations: parsed.recommendations || ['Monitor test results', 'Review code changes']
        };
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.warn('Failed to parse AI response, using fallback');
      return this.fallbackAnalysis([]);
    }
  }

  private fallbackAnalysis(changedFiles: string[]): AICodeAnalysis {
    // Simple heuristic fallback
    const hasAuthChanges = changedFiles.some(f => f.includes('auth'));
    const hasAPIChanges = changedFiles.some(f => f.includes('api'));
    
    let riskLevel: 'high' | 'medium' | 'low' = 'low';
    let failureProbability = 0.1;
    
    if (hasAuthChanges) {
      riskLevel = 'high';
      failureProbability = 0.7;
    } else if (hasAPIChanges) {
      riskLevel = 'medium';
      failureProbability = 0.4;
    }

    return {
      riskLevel,
      failureProbability,
      confidence: 0.6,
      reasoning: 'Heuristic analysis based on file patterns',
      recommendations: [
        'Run affected test suites first',
        'Monitor for integration issues',
        'Consider additional validation'
      ]
    };
  }

  /**
   * 🔧 Check if Ollama is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        timeout: 5000
      } as any);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 📦 Install CodeLlama model if not present
   */
  async ensureModel(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.model })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default OllamaAIClient;
