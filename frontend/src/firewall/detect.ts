// detect.ts
import { DetectionResult, DetectionPattern, LinguisticMarker } from '../types';

class MaliciousInputDetector {
  private jailbreakPatterns: DetectionPattern[] = [
    {
      pattern: /ignore previous instructions|forget everything|act as|pretend to be|roleplay as/i,
      category: 'jailbreak',
      weight: 0.8,
      description: 'Role manipulation attempt'
    },
    {
      pattern: /developer mode|debug mode|admin mode|god mode/i,
      category: 'jailbreak',
      weight: 0.7,
      description: 'Privilege escalation attempt'
    },
    {
      pattern: /system prompt|initial instructions|base instructions/i,
      category: 'jailbreak',
      weight: 0.6,
      description: 'System prompt extraction'
    }
  ];

  private systemCommandPatterns: DetectionPattern[] = [
    {
      pattern: /rm -rf|del \/s|format c:|sudo rm/i,
      category: 'system',
      weight: 0.9,
      description: 'Destructive system command'
    },
    {
      pattern: /exec|eval|system\(|shell_exec|passthru/i,
      category: 'system',
      weight: 0.8,
      description: 'Code execution attempt'
    },
    {
      pattern: /\$\(.*\)|`.*`|\|\||&&/,
      category: 'system',
      weight: 0.7,
      description: 'Command injection pattern'
    }
  ];

  private sensitiveDataPatterns: DetectionPattern[] = [
    {
      pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
      category: 'sensitive',
      weight: 0.8,
      description: 'Credit card number pattern'
    },
    {
      pattern: /\b\d{3}-\d{2}-\d{4}\b/,
      category: 'sensitive',
      weight: 0.8,
      description: 'SSN pattern'
    },
    {
      pattern: /password|api[_\s]?key|secret[_\s]?key|private[_\s]?key/i,
      category: 'sensitive',
      weight: 0.6,
      description: 'Credential-related content'
    }
  ];

  // Dad-joke detection with specific regex as requested
  private dadJokePattern = /tell a joke|say something funny|dad joke/i;

  private humorKeywords: LinguisticMarker = {
    keywords: ['funny', 'joke', 'humor', 'laugh', 'comedy', 'hilarious', 'amusing'],
    weight: 0.1,
    category: 'humor'
  };

  private enabledCategories = {
    jailbreak: true,
    system: true,
    sensitive: true,
  };

  detectMalice(input: string): DetectionResult {
    let totalScore = 0;
    const detectedReasons: string[] = [];
    let primaryCategory: 'jailbreak' | 'system' | 'sensitive' | 'safe' = 'safe';

    // Dad-joke detection layer - highest priority as requested
    if (this.dadJokePattern.test(input)) {
      return {
        isMalicious: true,
        message: "Blocked: Dad joke attempt—safety first!",
        confidence: 0.6,
        category: 'jailbreak',
        reasons: ['Dad joke detected'],
        timestamp: new Date()
      };
    }

    // Check jailbreak patterns if enabled
    if (this.enabledCategories.jailbreak) {
      for (const pattern of this.jailbreakPatterns) {
        if (pattern.pattern.test(input)) {
          totalScore += pattern.weight;
          detectedReasons.push(pattern.description);
          primaryCategory = 'jailbreak';
        }
      }
    }

    // Check system command patterns if enabled
    if (this.enabledCategories.system) {
      for (const pattern of this.systemCommandPatterns) {
        if (pattern.pattern.test(input)) {
          totalScore += pattern.weight;
          detectedReasons.push(pattern.description);
          if (primaryCategory === 'safe') primaryCategory = 'system';
        }
      }
    }

    // Check sensitive data patterns if enabled
    if (this.enabledCategories.sensitive) {
      for (const pattern of this.sensitiveDataPatterns) {
        if (pattern.pattern.test(input)) {
          totalScore += pattern.weight;
          detectedReasons.push(pattern.description);
          if (primaryCategory === 'safe') primaryCategory = 'sensitive';
        }
      }
    }

    // Analyze linguistic patterns for humor-related content
    const linguisticScore = this.analyzeLinguisticPatterns(input);
    totalScore += linguisticScore.score;
    if (linguisticScore.reasons.length > 0) {
      detectedReasons.push(...linguisticScore.reasons);
    }

    // Enhanced scoring for dad-joke adjacent content
    if (linguisticScore.humorDetected) {
      totalScore += 0.3; // Increase confidence weight as requested
      detectedReasons.push('Humor-related content detected');
    }

    const isMalicious = totalScore >= 0.5;
    const confidence = Math.min(totalScore, 1.0);

    return {
      isMalicious,
      message: isMalicious 
        ? `Potentially malicious input detected (${Math.round(confidence * 100)}% confidence)`
        : 'Input appears safe',
      confidence,
      category: primaryCategory,
      reasons: detectedReasons,
      timestamp: new Date()
    };
  }

  private analyzeLinguisticPatterns(input: string): { 
    score: number; 
    reasons: string[]; 
    humorDetected: boolean 
  } {
    let score = 0;
    const reasons: string[] = [];
    let humorDetected = false;

    // Check for humor-related keywords with boosted scoring
    const lowerInput = input.toLowerCase();
    let humorKeywordCount = 0;
    
    for (const keyword of this.humorKeywords.keywords) {
      if (lowerInput.includes(keyword)) {
        score += this.humorKeywords.weight;
        humorKeywordCount++;
        humorDetected = true;
      }
    }

    if (humorKeywordCount > 0) {
      reasons.push(`Humor keywords detected (${humorKeywordCount} matches)`);
    }

    // Check for excessive capitalization (potential shouting/emphasis)
    const capsRatio = (input.match(/[A-Z]/g) || []).length / input.length;
    if (capsRatio > 0.5 && input.length > 10) {
      score += 0.2;
      reasons.push('Excessive capitalization detected');
    }

    // Check for repeated characters (potential obfuscation)
    if (/(.)\1{3,}/.test(input)) {
      score += 0.15;
      reasons.push('Character repetition pattern detected');
    }

    // Check for mixed scripts (potential unicode obfuscation)
    if (/[^\x00-\x7F]/.test(input) && /[a-zA-Z]/.test(input)) {
      score += 0.1;
      reasons.push('Mixed character encoding detected');
    }

    return { score, reasons, humorDetected };
  }

  // Method to add custom patterns dynamically
  addCustomPattern(pattern: DetectionPattern): void {
    switch (pattern.category) {
      case 'jailbreak':
        this.jailbreakPatterns.push(pattern);
        break;
      case 'system':
        this.systemCommandPatterns.push(pattern);
        break;
      case 'sensitive':
        this.sensitiveDataPatterns.push(pattern);
        break;
    }
  }

  // Method to toggle detection categories
  public toggleDetection(category: 'jailbreak' | 'system' | 'sensitive', enabled: boolean) {
    this.enabledCategories[category] = enabled;
  }

  // Method to update detection settings
  public updateDetectionSettings(settings: { jailbreak: boolean; system: boolean; sensitive: boolean }) {
    this.enabledCategories = { ...this.enabledCategories, ...settings };
  }

  // Method to get detection statistics
  getDetectionStats(): {
    totalPatterns: number;
    patternsByCategory: Record<string, number>;
  } {
    return {
      totalPatterns: this.jailbreakPatterns.length + 
                    this.systemCommandPatterns.length + 
                    this.sensitiveDataPatterns.length,
      patternsByCategory: {
        jailbreak: this.jailbreakPatterns.length,
        system: this.systemCommandPatterns.length,
        sensitive: this.sensitiveDataPatterns.length
      }
    };
  }
}

// Export the detector instance for use throughout the application
export const detector = new MaliciousInputDetector();
export default MaliciousInputDetector;