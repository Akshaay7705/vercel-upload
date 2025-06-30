import axios from 'axios';

export interface LLMResponse {
  text: string;
  confidence: number;
  processingTime: number;
  model: string;
}

class MockLLMAPI {
  private apiKey = import.meta.env.VITE_GROQ_API; // Safer: Use env variable
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private model = 'llama3-70b-8192';

  // Malicious pattern detection
  private detectionPatterns: RegExp[] = [
    /ignore\s+previous\s+instructions?/i,
    /rm\s+-rf\s+\/\*?/i,
    /you\s+are\s+now\s+(a|an)\s+.*?ai/i,
    /pretend\s+to\s+be\s+.*?ai/i,
    /prompt\s*injection/i,
    /simulate\s+(bash|terminal|shell)/i,
    /run\s+(this\s+)?command/i,
    /jailbreak/i,
    /sudo\s+[a-z]+/i,
    /act\s+as\s+(a\s+)?hacker/i,
    /bypass\s+(all\s+)?security/i,
    /how\s+to\s+hack/i,
    /disable\s+(firewall|security)/i,
    /exfiltrate\s+data/i,
    /create\s+.*?(virus|malware)/i,
  ];

  private isPromptMalicious(prompt: string): { isMalicious: boolean; reason?: string } {
    const normalized = prompt.toLowerCase().replace(/\s+/g, ' ').trim();
    for (const pattern of this.detectionPatterns) {
      if (pattern.test(normalized)) {
        return { isMalicious: true, reason: pattern.source };
      }
    }
    return { isMalicious: false };
  }

  public async generateResponse(prompt: string): Promise<{ text: string }> {
    const startTime = Date.now();

    // 🔒 Detect malicious prompt
    const detection = this.isPromptMalicious(prompt);
    if (detection.isMalicious) {
      return {
        text: `❌ Prompt blocked by firewall. Detected pattern: /${detection.reason}/i`,
      };
    }

    try {
      const res = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const reply = res.data.choices[0].message.content;
      return { text: reply };
    } catch (error: any) {
      console.error('[Groq API Error]', error?.response?.data || error.message);
      return {
        text: '❌ Sorry, something went wrong while processing your request.',
      };
    }
  }

  public async generateResponseWithModel(
    prompt: string,
    model: string = this.model
  ): Promise<LLMResponse> {
    const start = Date.now();
    const base = await this.generateResponse(prompt);
    return {
      text: base.text,
      confidence: 0.85 + Math.random() * 0.15,
      processingTime: Date.now() - start,
      model,
    };
  }
}

export const mockLLM = new MockLLMAPI();
