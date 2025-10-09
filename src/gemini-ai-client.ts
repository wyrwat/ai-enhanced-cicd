/**
 * 🤖 Google Gemini AI Client - Simple Working Version
 * Free tier: 15 requests per minute, 1500 requests per day
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

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

export class GeminiAIClient {
  private genAI: GoogleGenerativeAI | null = null;
  private isEnabled: boolean;

  constructor(apiKey?: string) {
    this.isEnabled = !!(apiKey || process.env.GEMINI_API_KEY);
    
    if (this.isEnabled) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY!);
      } catch (error) {
        console.warn('Failed to initialize Gemini AI:', error);
        this.isEnabled = false;
      }
    }
  }

  /**
   * 🧠 Analyze code changes with AI
   */
  async analyzeCodeChanges(gitDiff: string, changedFiles: string[]): Promise<AICodeAnalysis> {
    if (!this.isEnabled || !this.genAI) {
      return this.fallbackAnalysis(changedFiles);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      const prompt = `Analyze this code change and assess test failure risk.
      
Changed files: ${changedFiles.join(', ')}

Code changes:
${gitDiff.slice(0, 1000)}

Provide a brief analysis in this format:
Risk level: high/medium/low
Failure probability: 0.0-1.0
Confidence: 0.0-1.0
Brief reasoning (max 50 words)
2-3 recommendations

Keep response concise and focused.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseResponse(response, changedFiles);
      
    } catch (error) {
      console.warn('🤖 Gemini AI failed, using fallback:', error);
      return this.fallbackAnalysis(changedFiles);
    }
  }

  /**
   * 📊 Analyze performance metrics (placeholder)
   */
  async analyzePerformance(metrics: any): Promise<any> {
    // Fallback analysis
    const score = Math.max(0, 100 - (metrics.responseTime * 20) - (metrics.errorRate * 15));
    return {
      score: Math.round(score),
      anomalies: metrics.responseTime > 2.0 ? ['High response time'] : [],
      recommendations: ['Monitor trends', 'Consider caching'],
      confidence: 0.7
    };
  }

  /**
   * 🔍 Check if AI is available
   */
  isAvailable(): boolean {
    return this.isEnabled;
  }

  private parseResponse(text: string, changedFiles: string[]): AICodeAnalysis {
    try {
      // Simple parsing - look for key patterns
      const riskMatch = text.toLowerCase().match(/risk level:\s*(high|medium|low)/);
      const probMatch = text.match(/failure probability:\s*([\d.]+)/);
      const confMatch = text.match(/confidence:\s*([\d.]+)/);
      
      const riskLevel = riskMatch ? riskMatch[1] as 'high' | 'medium' | 'low' : 'medium';
      const failureProbability = probMatch ? parseFloat(probMatch[1]) : 0.5;
      const confidence = confMatch ? parseFloat(confMatch[1]) : 0.8;
      
      // Extract reasoning and recommendations
      const lines = text.split('\n');
      const reasoning = lines.find(line => 
        line.toLowerCase().includes('reasoning') || 
        line.toLowerCase().includes('because') ||
        line.toLowerCase().includes('analysis')
      ) || 'AI analysis completed';
      
      const recommendations = lines
        .filter(line => line.includes('recommend') || line.includes('suggest') || line.includes('-'))
        .slice(0, 3)
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(rec => rec.length > 10);

      if (recommendations.length === 0) {
        recommendations.push('Monitor test execution', 'Review code changes');
      }

      return {
        riskLevel,
        failureProbability: Math.max(0, Math.min(1, failureProbability)),
        confidence: Math.max(0, Math.min(1, confidence)),
        reasoning: reasoning.slice(0, 100),
        recommendations: recommendations.slice(0, 3),
        testSuites: [{ name: 'Integration Tests', priority: riskLevel, estimatedRunTime: 60 }]
      };
      
    } catch (error) {
      console.warn('Failed to parse AI response, using fallback');
      return this.fallbackAnalysis(changedFiles);
    }
  }

  private fallbackAnalysis(changedFiles: string[]): AICodeAnalysis {
    // Smart heuristic analysis
    const hasAuthChanges = changedFiles.some(f => f.toLowerCase().includes('auth'));
    const hasAPIChanges = changedFiles.some(f => f.toLowerCase().includes('api'));
    const hasUIChanges = changedFiles.some(f => f.toLowerCase().includes('ui') || f.includes('component'));
    
    let riskLevel: 'high' | 'medium' | 'low' = 'low';
    let failureProbability = 0.15;
    let reasoning = 'Heuristic analysis based on file patterns';
    
    if (hasAuthChanges) {
      riskLevel = 'high';
      failureProbability = 0.75;
      reasoning = 'Authentication changes detected - high risk for auth test failures';
    } else if (hasAPIChanges) {
      riskLevel = 'medium';
      failureProbability = 0.45;
      reasoning = 'API changes detected - moderate risk for integration test failures';
    } else if (hasUIChanges) {
      riskLevel = 'medium';
      failureProbability = 0.35;
      reasoning = 'UI changes detected - moderate risk for UI test failures';
    }

    return {
      riskLevel,
      failureProbability,
      confidence: 0.7,
      reasoning,
      recommendations: [
        'Run affected test suites first',
        'Monitor for integration issues',
        'Consider additional validation'
      ],
      testSuites: [{ name: 'Integration Tests', priority: riskLevel, estimatedRunTime: 60 }]
    };
  }
}

export default GeminiAIClient;
