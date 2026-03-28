// AI Provider implementations for multiple services

class AIProvider {
  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(messages, options = {}) {
    throw new Error('chat() must be implemented by subclass');
  }

  async generateProject(description, options = {}) {
    throw new Error('generateProject() must be implemented by subclass');
  }
}

// OpenAI (ChatGPT) Provider
export class OpenAIProvider extends AIProvider {
  constructor(apiKey, model = 'gpt-4-turbo-preview') {
    super(apiKey, model);
    this.baseURL = 'https://api.openai.com/v1';
  }

  async chat(messages, options = {}) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  }

  async generateProject(description, options = {}) {
    const systemPrompt = `You are an expert full-stack developer. Generate a complete project structure with all necessary files based on the user's description. 

Return your response in this EXACT JSON format:
{
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "content": "file content here"
    }
  ],
  "explanation": "Brief explanation of the project structure"
}

Generate production-ready code with proper structure, dependencies, and best practices.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a complete project for: ${description}` }
    ];

    const result = await this.chat(messages, { maxTokens: 8000 });
    return this.parseProjectResponse(result.content);
  }

  parseProjectResponse(content) {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```\n([\s\S]*?)\n```/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try to parse directly
      return JSON.parse(content);
    } catch (e) {
      // Fallback: extract code blocks manually
      const codeBlocks = content.match(/```[\w]*\n([\s\S]*?)```/g) || [];
      const files = codeBlocks.map((block, idx) => {
        const content = block.replace(/```[\w]*\n/, '').replace(/```$/, '').trim();
        const ext = this.detectLanguage(content);
        return {
          path: `file${idx + 1}.${ext}`,
          content: content
        };
      });

      return {
        files,
        explanation: 'Generated project files from AI response'
      };
    }
  }

  detectLanguage(content) {
    if (content.includes('<!DOCTYPE html') || content.includes('<html')) return 'html';
    if (content.includes('import React') || content.includes('export default')) return 'jsx';
    if (content.includes('function') || content.includes('const ')) return 'js';
    if (content.includes('{') && content.includes(':')) return 'json';
    return 'txt';
  }
}

// Anthropic (Claude) Provider
export class AnthropicProvider extends AIProvider {
  constructor(apiKey, model = 'claude-3-5-sonnet-20241022') {
    super(apiKey, model);
    this.baseURL = 'https://api.anthropic.com/v1';
  }

  async chat(messages, options = {}) {
    // Convert messages format for Claude
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens || 4000,
        system: systemMessage?.content || '',
        messages: conversationMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Anthropic API request failed');
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: data.usage,
    };
  }

  async generateProject(description, options = {}) {
    const systemPrompt = `You are an expert full-stack developer. Generate a complete project structure with all necessary files based on the user's description. 

Return your response in this EXACT JSON format:
{
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "content": "file content here"
    }
  ],
  "explanation": "Brief explanation of the project structure"
}

Generate production-ready code with proper structure, dependencies, and best practices.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a complete project for: ${description}` }
    ];

    const result = await this.chat(messages, { maxTokens: 8000 });
    return OpenAIProvider.prototype.parseProjectResponse.call(this, result.content);
  }
}

// Google (Gemini) Provider
export class GoogleProvider extends AIProvider {
  constructor(apiKey, model = 'gemini-1.5-pro') {
    super(apiKey, model);
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async chat(messages, options = {}) {
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 4000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Google API request failed');
    }

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      usage: data.usageMetadata,
    };
  }

  async generateProject(description, options = {}) {
    const systemPrompt = `You are an expert full-stack developer. Generate a complete project structure with all necessary files based on the user's description. 

Return your response in this EXACT JSON format:
{
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "content": "file content here"
    }
  ],
  "explanation": "Brief explanation of the project structure"
}

Generate production-ready code with proper structure, dependencies, and best practices.`;

    const messages = [
      { role: 'user', content: systemPrompt + '\n\n' + `Generate a complete project for: ${description}` }
    ];

    const result = await this.chat(messages, { maxTokens: 8000 });
    return OpenAIProvider.prototype.parseProjectResponse.call(this, result.content);
  }
}

// Groq Provider (Fast inference)
export class GroqProvider extends AIProvider {
  constructor(apiKey, model = 'llama-3.1-70b-versatile') {
    super(apiKey, model);
    this.baseURL = 'https://api.groq.com/openai/v1';
  }

  async chat(messages, options = {}) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Groq API request failed');
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  }

  async generateProject(description, options = {}) {
    const systemPrompt = `You are an expert full-stack developer. Generate a complete project structure with all necessary files based on the user's description. 

Return your response in this EXACT JSON format:
{
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "content": "file content here"
    }
  ],
  "explanation": "Brief explanation of the project structure"
}

Generate production-ready code with proper structure, dependencies, and best practices.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a complete project for: ${description}` }
    ];

    const result = await this.chat(messages, { maxTokens: 8000 });
    return OpenAIProvider.prototype.parseProjectResponse.call(this, result.content);
  }
}

// Provider factory
export function createAIProvider(providerName, apiKey, model) {
  switch (providerName.toLowerCase()) {
    case 'openai':
    case 'chatgpt':
      return new OpenAIProvider(apiKey, model);
    case 'anthropic':
    case 'claude':
      return new AnthropicProvider(apiKey, model);
    case 'google':
    case 'gemini':
      return new GoogleProvider(apiKey, model);
    case 'groq':
      return new GroqProvider(apiKey, model);
    default:
      throw new Error(`Unknown AI provider: ${providerName}`);
  }
}

// Get available providers
export function getAvailableProviders() {
  const providers = [];
  
  // Prioritize Claude (Anthropic) as the first option
  if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
    providers.push({ id: 'anthropic', name: 'Claude 3.5 Sonnet (Anthropic)', model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022' });
  }
  
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    providers.push({ id: 'openai', name: 'ChatGPT (OpenAI)', model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview' });
  }
  
  if (import.meta.env.VITE_GOOGLE_API_KEY) {
    providers.push({ id: 'google', name: 'Gemini (Google)', model: import.meta.env.VITE_GOOGLE_MODEL || 'gemini-1.5-pro' });
  }
  
  if (import.meta.env.VITE_GROQ_API_KEY) {
    providers.push({ id: 'groq', name: 'Groq (Fast)', model: import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-70b-versatile' });
  }
  
  return providers;
}

// Get API key for provider
export function getAPIKey(providerName) {
  switch (providerName.toLowerCase()) {
    case 'openai':
    case 'chatgpt':
      return import.meta.env.VITE_OPENAI_API_KEY;
    case 'anthropic':
    case 'claude':
      return import.meta.env.VITE_ANTHROPIC_API_KEY;
    case 'google':
    case 'gemini':
      return import.meta.env.VITE_GOOGLE_API_KEY;
    case 'groq':
      return import.meta.env.VITE_GROQ_API_KEY;
    default:
      return null;
  }
}
