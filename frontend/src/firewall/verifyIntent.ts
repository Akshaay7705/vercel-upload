interface VerificationResult {
  matches: boolean;
  confidence: number;
  explanation: string;
}

interface IntentKeywords {
  [key: string]: string[];
}

class IntentVerifier {
  private intentKeywords: IntentKeywords = {
    translate: ['translation', 'translate', 'language', 'convert', 'interpret', 'render'],
    summarize: ['summary', 'summarize', 'brief', 'overview', 'condensed', 'key points'],
    explain: ['explanation', 'explain', 'clarify', 'describe', 'define', 'elaborate'],
    code: ['code', 'programming', 'function', 'script', 'implementation', 'syntax'],
    analyze: ['analysis', 'analyze', 'examine', 'evaluate', 'assess', 'review'],
    create: ['create', 'generate', 'build', 'make', 'develop', 'produce'],
    fix: ['fix', 'repair', 'correct', 'resolve', 'debug', 'troubleshoot'],
    optimize: ['optimize', 'improve', 'enhance', 'refactor', 'streamline', 'efficient']
  };

  verifyIntent(input: string, output: string): VerificationResult {
    const normalizedInput = input.toLowerCase().trim();
    const normalizedOutput = output.toLowerCase();

    // Extract potential intent from input
    const detectedIntent = this.extractIntent(normalizedInput);
    
    if (!detectedIntent) {
      return {
        matches: true,
        confidence: 0.7,
        explanation: "No specific intent detected - general response assumed valid"
      };
    }

    // Calculate confidence based on keyword matching
    const confidence = this.calculateConfidence(detectedIntent, normalizedInput, normalizedOutput);
    
    // Determine if intent matches
    const matches = confidence >= 0.5;

    // Generate explanation
    const explanation = this.generateExplanation(detectedIntent, confidence, matches);

    return {
      matches,
      confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
      explanation
    };
  }

  private extractIntent(input: string): string | null {
    // Check for explicit intent keywords
    for (const intent of Object.keys(this.intentKeywords)) {
      if (input.includes(intent)) {
        return intent;
      }
    }

    // Check for implicit intents based on context
    if (input.includes('what is') || input.includes('how to') || input.includes('explain')) {
      return 'explain';
    }
    
    if (input.includes('make') || input.includes('build') || input.includes('create')) {
      return 'create';
    }

    if (input.includes('show me') || input.includes('give me')) {
      return 'create';
    }

    return null;
  }

  private calculateConfidence(intent: string, input: string, output: string): number {
    const keywords = this.intentKeywords[intent] || [];
    let score = 0;
    let maxScore = 0;

    // Base score for intent recognition
    maxScore += 0.3;
    score += 0.3;

    // Keyword matching in output
    let keywordMatches = 0;
    keywords.forEach(keyword => {
      maxScore += 0.1;
      if (output.includes(keyword)) {
        score += 0.1;
        keywordMatches++;
      }
    });

    // Contextual scoring based on intent type
    maxScore += 0.4;
    const contextScore = this.getContextualScore(intent, input, output);
    score += contextScore * 0.4;

    // Length and detail bonus (longer responses often indicate more effort)
    if (output.length > 100) {
      score += 0.1;
      maxScore += 0.1;
    }

    // Normalize score
    const confidence = Math.min(score / maxScore, 1.0);

    // Apply intent-specific adjustments
    return this.applyIntentAdjustments(intent, confidence, keywordMatches, output);
  }

  private getContextualScore(intent: string, input: string, output: string): number {
    switch (intent) {
      case 'translate':
        // Enhanced check: Weight non-ASCII (e.g., "Hola") and translation context
        const hasNonAscii = output.match(/[^\x00-\x7F]+/) ? 0.6 : 0;
        const hasLanguageHint = output.includes('in') || output.includes('is') ? 0.3 : 0; // e.g., "in Spanish"
        return Math.max(hasNonAscii + hasLanguageHint, 0.2); // At least 0.2, up to 0.9
      case 'code':
        return output.includes('{') || output.includes('function') || output.includes('const') ? 0.9 : 0.1;
      case 'summarize':
        const words = output.split(' ').length;
        return words < 200 && (output.includes('summary') || output.includes('brief')) ? 0.8 : 0.3;
      case 'explain':
        return output.includes('because') || output.includes('reason') || output.includes('explanation') ? 0.7 : 0.4;
      default:
        return 0.5;
    }
  }

  private applyIntentAdjustments(intent: string, baseConfidence: number, keywordMatches: number, output: string): number {
    let adjustedConfidence = baseConfidence;

    // High keyword match bonus
    if (keywordMatches >= 3) {
      adjustedConfidence = Math.min(adjustedConfidence + 0.1, 1.0);
    }

    // Penalty for very short responses to complex intents
    if (['code', 'explain', 'analyze'].includes(intent) && output.length < 50) {
      adjustedConfidence *= 0.7;
    }

    // Bonus for detailed responses
    if (output.length > 500) {
      adjustedConfidence = Math.min(adjustedConfidence + 0.05, 1.0);
    }

    return adjustedConfidence;
  }

  private generateExplanation(intent: string, confidence: number, matches: boolean): string {
    if (!matches) {
      if (confidence < 0.2) {
        return `Very low confidence (${(confidence * 100).toFixed(0)}%) - Output appears unrelated to intended "${intent}" action`;
      } else if (confidence < 0.5) {
        return `Low confidence (${(confidence * 100).toFixed(0)}%) - Output partially matches "${intent}" intent but lacks key indicators`;
      }
    }

    if (confidence > 0.8) {
      return `High confidence (${(confidence * 100).toFixed(0)}%) - Output strongly aligns with "${intent}" intent`;
    } else if (confidence > 0.6) {
      return `Good confidence (${(confidence * 100).toFixed(0)}%) - Output adequately matches "${intent}" intent`;
    } else {
      return `Moderate confidence (${(confidence * 100).toFixed(0)}%) - Output shows some alignment with "${intent}" intent`;
    }
  }
}

// Export singleton instance
export const intentVerifier = new IntentVerifier();