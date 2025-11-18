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
   * 📊 Analyze performance metrics with real AI
   */
  async analyzePerformance(metrics: any): Promise<any> {
    if (!this.isEnabled || !this.genAI) {
      return this.fallbackPerformanceAnalysis(metrics);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      const prompt = `Analyze these system performance metrics and provide insights:

Performance Data:
- Response Time: ${metrics.responseTime}s
- Throughput: ${metrics.throughput} requests/second
- Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%
- CPU Usage: ${metrics.cpuUsage}%
- Memory Usage: ${metrics.memoryUsage}%

Please provide:
1. Performance score (0-100, where 100 is optimal)
2. List any anomalies or concerns
3. 2-3 specific optimization recommendations
4. Your confidence level (0.0-1.0)

Format your response clearly with these sections.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parsePerformanceResponse(response, metrics);
      
    } catch (error) {
      console.warn('🤖 Gemini AI performance analysis failed:', error);
      return this.fallbackPerformanceAnalysis(metrics);
    }
  }

  /**
   * 🛠️ AI-powered self-healing analysis
   */
  async analyzeSelfHealing(systemIssues: string[]): Promise<{
    shouldHeal: boolean;
    strategy: 'aggressive' | 'conservative';
    confidence: number;
    reasoning: string;
    actions: string[];
  }> {
    if (!this.isEnabled || !this.genAI) {
      return this.fallbackSelfHealingAnalysis(systemIssues);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      const prompt = `Analyze these system issues and recommend self-healing strategy:

System Issues:
${systemIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

Determine:
1. Should we perform automated healing? (yes/no)
2. Strategy: aggressive or conservative?
3. Your confidence level (0.0-1.0)
4. Brief reasoning (max 50 words)
5. List 3-5 specific healing actions

Respond in clear format.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseSelfHealingResponse(response, systemIssues);
      
    } catch (error) {
      console.warn('🤖 Gemini AI self-healing analysis failed:', error);
      return this.fallbackSelfHealingAnalysis(systemIssues);
    }
  }

  /**
   * 🔍 AI-powered code review analysis
   */
  async analyzeCodeForReview(filePath: string, code: string): Promise<{
    securityIssues: string[];
    performanceConcerns: string[];
    codeQualityIssues: string[];
    recommendations: string[];
    confidence: number;
    lineNumbers: { [key: string]: number };
  }> {
    if (!this.isEnabled || !this.genAI) {
      return this.fallbackCodeReviewAnalysis(filePath, code);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      const prompt = `Review this TypeScript/JavaScript code file and identify specific issues with line numbers:

File: ${filePath}
Code (with line numbers):
${this.addLineNumbers(code)}

Analyze and provide specific feedback:
1. SECURITY: Security vulnerabilities (mention line numbers if possible)
2. PERFORMANCE: Performance issues (mention line numbers if possible)  
3. CODE QUALITY: Type safety, error handling issues (mention line numbers if possible)
4. RECOMMENDATIONS: Specific improvements with locations

For each issue, try to identify the approximate line number where the problem occurs.
Be specific about what to fix and where to fix it.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseCodeReviewResponse(response);
      
    } catch (error) {
      console.warn('🤖 Gemini AI code review failed:', error);
      return this.fallbackCodeReviewAnalysis(filePath, code);
    }
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

  private parsePerformanceResponse(text: string, metrics: any): any {
    try {
      // Parse AI response for performance insights
      const scoreMatch = text.match(/score[:\s]*(\d+)/i);
      const confidenceMatch = text.match(/confidence[:\s]*([\d.]+)/i);
      
      const score = scoreMatch ? parseInt(scoreMatch[1]) : Math.max(0, 100 - (metrics.responseTime * 20) - (metrics.errorRate * 15));
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.8;
      
      // Extract anomalies
      const anomalies: string[] = [];
      if (text.toLowerCase().includes('high response time') || metrics.responseTime > 2.0) {
        anomalies.push('High response time detected');
      }
      if (text.toLowerCase().includes('error rate') || metrics.errorRate > 0.05) {
        anomalies.push('Elevated error rate');
      }
      if (text.toLowerCase().includes('cpu') || metrics.cpuUsage > 80) {
        anomalies.push('High CPU utilization');
      }
      
      // Extract recommendations from AI response
      const lines = text.split('\n');
      const recommendations = lines
        .filter(line => {
          const trimmed = line.trim();
          // Skip empty lines, markdown headers, and table formatting
          if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('|') || trimmed.includes(':---')) {
            return false;
          }
          // Look for recommendation keywords or bullet points
          return trimmed.includes('recommend') || 
                 trimmed.includes('suggest') || 
                 trimmed.includes('optimize') ||
                 trimmed.includes('consider') ||
                 trimmed.includes('improve') ||
                 (trimmed.startsWith('-') && trimmed.length > 5) || 
                 (trimmed.startsWith('•') && trimmed.length > 5);
        })
        .slice(0, 3)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(rec => rec.length > 10 && rec.length < 100); // Reasonable length

      if (recommendations.length === 0) {
        recommendations.push('Monitor performance trends', 'Consider caching strategies', 'Review resource allocation');
      }

      return {
        score: Math.max(0, Math.min(100, score)),
        anomalies,
        recommendations: recommendations.slice(0, 3),
        confidence: Math.max(0, Math.min(1, confidence))
      };
      
    } catch (error) {
      console.warn('Failed to parse AI performance response, using fallback');
      return this.fallbackPerformanceAnalysis(metrics);
    }
  }

  private fallbackPerformanceAnalysis(metrics: any): any {
    const score = Math.max(0, 100 - (metrics.responseTime * 20) - (metrics.errorRate * 15));
    const anomalies = [];
    
    if (metrics.responseTime > 2.0) anomalies.push('High response time');
    if (metrics.errorRate > 0.05) anomalies.push('Elevated error rate');
    if (metrics.cpuUsage > 80) anomalies.push('High CPU usage');
    
    return {
      score: Math.round(score),
      anomalies,
      recommendations: ['Monitor performance trends', 'Consider caching strategies', 'Review resource allocation'],
      confidence: 0.7
    };
  }

  private parseSelfHealingResponse(text: string, systemIssues: string[]): {
    shouldHeal: boolean;
    strategy: 'aggressive' | 'conservative';
    confidence: number;
    reasoning: string;
    actions: string[];
  } {
    try {
      const shouldHealMatch = text.toLowerCase().match(/automated healing[?:\s]*(yes|no)/);
      const strategyMatch = text.toLowerCase().match(/strategy[:\s]*(aggressive|conservative)/);
      const confidenceMatch = text.match(/confidence[:\s]*([\d.]+)/);
      
      const shouldHeal = shouldHealMatch ? shouldHealMatch[1] === 'yes' : true;
      const strategy = strategyMatch ? strategyMatch[1] as 'aggressive' | 'conservative' : 'conservative';
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.8;
      
      // Extract reasoning
      const reasoningMatch = text.match(/reasoning[:\s]*([^.]+)/i);
      const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'AI recommends automated healing based on issue patterns';
      
      // Extract actions
      const lines = text.split('\n');
      const actions = lines
        .filter(line => {
          const trimmed = line.trim();
          return (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.includes('action')) &&
                 !trimmed.includes(':') && trimmed.length > 10 && trimmed.length < 80;
        })
        .slice(0, 5)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(action => action.length > 5);

      if (actions.length === 0) {
        actions.push(
          'Clear system caches and restart services',
          'Optimize resource allocation',
          'Update configuration parameters'
        );
      }

      return {
        shouldHeal,
        strategy,
        confidence: Math.max(0, Math.min(1, confidence)),
        reasoning: reasoning.slice(0, 100),
        actions: actions.slice(0, 5)
      };
      
    } catch (error) {
      console.warn('Failed to parse AI self-healing response');
      return this.fallbackSelfHealingAnalysis(systemIssues);
    }
  }

  private fallbackSelfHealingAnalysis(systemIssues: string[]): {
    shouldHeal: boolean;
    strategy: 'aggressive' | 'conservative';
    confidence: number;
    reasoning: string;
    actions: string[];
  } {
    // Analyze system issues with heuristics
    const hasCriticalIssues = systemIssues.some(issue => 
      issue.toLowerCase().includes('critical') || 
      issue.toLowerCase().includes('failure') ||
      issue.toLowerCase().includes('error')
    );
    
    const hasPerformanceIssues = systemIssues.some(issue =>
      issue.toLowerCase().includes('slow') ||
      issue.toLowerCase().includes('timeout') ||
      issue.toLowerCase().includes('memory')
    );

    const shouldHeal = hasCriticalIssues || hasPerformanceIssues;
    const strategy: 'aggressive' | 'conservative' = hasCriticalIssues ? 'aggressive' : 'conservative';
    
    const actions = strategy === 'aggressive' ? [
      'AI-optimized browser cache clearing',
      'Intelligent test selector refinement', 
      'Dynamic timeout adjustment',
      'Smart browser instance recycling',
      'AI-guided dependency update'
    ] : [
      'Basic system health check',
      'Log collection for analysis',
      'Gradual performance monitoring increase',
      'Conservative resource reallocation'
    ];

    return {
      shouldHeal,
      strategy,
      confidence: 0.75,
      reasoning: `Heuristic analysis: ${strategy} healing recommended based on issue patterns`,
      actions
    };
  }

  private parseCodeReviewResponse(text: string): {
    securityIssues: string[];
    performanceConcerns: string[];
    codeQualityIssues: string[];
    recommendations: string[];
    confidence: number;
    lineNumbers: { [key: string]: number };
  } {
    try {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      const securityIssues: string[] = [];
      const performanceConcerns: string[] = [];
      const codeQualityIssues: string[] = [];
      const recommendations: string[] = [];
      const lineNumbers: { [key: string]: number } = {};
      
      let currentCategory = '';
      
      for (const line of lines) {
        // Detect categories
        if (line.toLowerCase().includes('security')) {
          currentCategory = 'security';
          continue;
        } else if (line.toLowerCase().includes('performance')) {
          currentCategory = 'performance';
          continue;
        } else if (line.toLowerCase().includes('code quality') || line.toLowerCase().includes('quality')) {
          currentCategory = 'quality';
          continue;
        } else if (line.toLowerCase().includes('recommendation')) {
          currentCategory = 'recommendations';
          continue;
        }
        
        // Extract bullet points or numbered items
        if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
          const cleanLine = line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim();
          
          if (cleanLine.length > 10) { // Filter out short/meaningless items
            // Extract line numbers from the text
            const lineNumberMatch = cleanLine.match(/line\s*(\d+)/i);
            const lineNumber = lineNumberMatch ? parseInt(lineNumberMatch[1]) : null;
            
            // Format with file and line info
            const formattedIssue = lineNumber 
              ? `Line ${lineNumber}: ${cleanLine}`
              : cleanLine;
            
            switch (currentCategory) {
              case 'security':
                securityIssues.push(formattedIssue);
                if (lineNumber) lineNumbers[formattedIssue] = lineNumber;
                break;
              case 'performance':
                performanceConcerns.push(formattedIssue);
                if (lineNumber) lineNumbers[formattedIssue] = lineNumber;
                break;
              case 'quality':
                codeQualityIssues.push(formattedIssue);
                if (lineNumber) lineNumbers[formattedIssue] = lineNumber;
                break;
              case 'recommendations':
                recommendations.push(formattedIssue);
                if (lineNumber) lineNumbers[formattedIssue] = lineNumber;
                break;
              default:
                // If no category, treat as general recommendation
                recommendations.push(formattedIssue);
                if (lineNumber) lineNumbers[formattedIssue] = lineNumber;
            }
          }
        }
      }
      
      // If no structured response, extract any meaningful lines
      if (securityIssues.length === 0 && performanceConcerns.length === 0 && 
          codeQualityIssues.length === 0 && recommendations.length === 0) {
        
        const meaningfulLines = lines.filter(line => 
          line.length > 20 && 
          !line.includes('analyze') && 
          !line.includes('provide') &&
          !line.includes('format') &&
          (line.includes('consider') || line.includes('should') || line.includes('could') || 
           line.includes('recommend') || line.includes('improve') || line.includes('add') ||
           line.includes('remove') || line.includes('fix') || line.includes('update'))
        );
        
        recommendations.push(...meaningfulLines.slice(0, 5));
      }
      
      return {
        securityIssues: securityIssues.slice(0, 3),
        performanceConcerns: performanceConcerns.slice(0, 3),
        codeQualityIssues: codeQualityIssues.slice(0, 3),
        recommendations: recommendations.slice(0, 5),
        confidence: 0.85,
        lineNumbers
      };
      
    } catch (error) {
      return {
        securityIssues: [],
        performanceConcerns: [],
        codeQualityIssues: [],
        recommendations: ['AI analysis completed with general recommendations'],
        confidence: 0.6,
        lineNumbers: {}
      };
    }
  }

  private fallbackCodeReviewAnalysis(filePath: string, code: string): {
    securityIssues: string[];
    performanceConcerns: string[];
    codeQualityIssues: string[];
    recommendations: string[];
    confidence: number;
    lineNumbers: { [key: string]: number };
  } {
    const securityIssues: string[] = [];
    const performanceConcerns: string[] = [];
    const codeQualityIssues: string[] = [];
    const recommendations: string[] = [];
    const lineNumbers: { [key: string]: number } = {};
    
    const lines = code.split('\n');
    
    // Heuristic analysis with line numbers
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      if (line.includes('eval(')) {
        const issue = `${filePath}:${lineNum} - Avoid using eval() - potential security risk`;
        securityIssues.push(issue);
        lineNumbers[issue] = lineNum;
      }
      if (line.includes('innerHTML') && !line.includes('sanitize')) {
        const issue = `${filePath}:${lineNum} - Consider sanitizing HTML content to prevent XSS`;
        securityIssues.push(issue);
        lineNumbers[issue] = lineNum;
      }
      if (line.includes('password') && !line.includes('hash') && !line.includes('encrypt')) {
        const issue = `${filePath}:${lineNum} - Consider proper password handling with hashing`;
        securityIssues.push(issue);
        lineNumbers[issue] = lineNum;
      }
      
      if (line.includes('console.log') && filePath.includes('src/')) {
        const issue = `${filePath}:${lineNum} - Remove debug console.log statements from production code`;
        codeQualityIssues.push(issue);
        lineNumbers[issue] = lineNum;
      }
      if (line.includes(': any') && filePath.endsWith('.ts')) {
        const issue = `${filePath}:${lineNum} - Replace "any" types with specific TypeScript types`;
        codeQualityIssues.push(issue);
        lineNumbers[issue] = lineNum;
      }
      if (line.includes('setTimeout') && !line.includes('clearTimeout')) {
        const issue = `${filePath}:${lineNum} - Consider cleanup for setTimeout to prevent memory leaks`;
        performanceConcerns.push(issue);
        lineNumbers[issue] = lineNum;
      }
    });
    
    // General recommendations
    if (code.includes('async') && !code.includes('try')) {
      recommendations.push('Add error handling for async operations');
    }
    if (code.length > 5000) {
      recommendations.push('Consider breaking down large files into smaller modules');
    }
    
    // Default recommendations if nothing found
    if (securityIssues.length === 0 && performanceConcerns.length === 0 && 
        codeQualityIssues.length === 0 && recommendations.length === 0) {
      recommendations.push('Code structure appears well-organized');
      recommendations.push('Consider adding more comprehensive error handling');
      recommendations.push('Review TypeScript types for better type safety');
    }
    
    return {
      securityIssues,
      performanceConcerns,
      codeQualityIssues,
      recommendations,
      confidence: 0.75,
      lineNumbers
    };
  }

  private addLineNumbers(code: string): string {
    const lines = code.split('\n');
    return lines.map((line, index) => `${(index + 1).toString().padStart(3, ' ')}| ${line}`).join('\n');
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
