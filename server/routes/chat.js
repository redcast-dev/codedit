import express from "express";
import axios from "axios";

const router = express.Router();

// Helper to get available provider
function getProvider() {
  if (process.env.VITE_GOOGLE_API_KEY) return 'google';
  if (process.env.VITE_ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.VITE_OPENAI_API_KEY) return 'openai';
  return null;
}

// POST /api/ai/chat
// Chat with AI assistant about code
router.post("/", async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["messages"],
      });
    }

    const provider = getProvider();
    if (!provider) {
      console.error("No AI provider configured");
      // Fallback for demo purposes if no key, but warn user
      return res.json({
        content: "⚠️ No API key found. Please add VITE_GOOGLE_API_KEY, VITE_ANTHROPIC_API_KEY, or VITE_OPENAI_API_KEY to your .env file.\n\nHere is a placeholder response.",
        code: "// Please configure an API key to generate real code.\nconsole.log('No API Key configured');"
      });
    }

    // Prepare system prompt
    const systemPrompt = `You are CODEDIT AI, a world-class AI coding assistant integrated into a professional-grade IDE.
Your goal is to provide high-quality, production-ready code and deep technical insights.

Context:
- Current workspace: Professional AI Code Editor (CODEDIT)
- UI Library: React 18, Tailwind CSS, Lucide Icons, Radix UI
- Editor: Monaco Editor
- Current language: ${context?.language || 'unknown'}
- Available files in workspace: ${context?.files?.join(", ") || 'none'}
${context?.currentCode ? `- Active File Content:\n\`\`\`${context.language}\n${context.currentCode}\n\`\`\`` : ''}

GUIDELINES FOR MODEL RESPONSE:
1. **Be Agentic**: Don't just suggest changes—provide the ready-to-apply code blocks.
2. **Quality Over Everything**: Write clean, modular, and well-commented code. Follow industry best practices.
3. **Professional Tone**: Maintain a helpful, expert persona. Use standard developer terminology.
4. **Contextual Awareness**: Reference other files in the workspace if they are relevant to the user's request.
5. **No Placeholders**: Never use "// implementation here". Provide the full logic unless the user specifically asks for a snippet.
6. **Code Blocks**: Always wrap code in triple backticks with the correct language identifier.
7. **Multi-file generation**: If creating a project, clearly separate files with comments or multiple code blocks.

Remember, you are part of an elite development environment. Your responses should reflect that level of quality.`;

    let responseContent = "";
    let usage = {};

    console.log(`Using AI provider: ${provider}`);

    // Call the appropriate AI provider
    if (provider === 'google') {
      const apiKey = process.env.VITE_GOOGLE_API_KEY;
      const model = process.env.VITE_GOOGLE_MODEL || 'gemini-1.5-pro';

      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      ];

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8000,
          },
        }
      );

      if (response.data.candidates && response.data.candidates.length > 0) {
        responseContent = response.data.candidates[0].content.parts[0].text;
        usage = response.data.usageMetadata;
      } else {
        throw new Error("No candidates returned from Gemini API");
      }

    } else if (provider === 'anthropic') {
      const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
      const model = process.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

      // Anthropic messages format
      const anthropicMessages = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model,
          max_tokens: 4000,
          system: systemPrompt,
          messages: anthropicMessages,
          temperature: 0.7,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      );

      responseContent = response.data.content[0].text;
      usage = response.data.usage;

    } else if (provider === 'openai') {
      const apiKey = process.env.VITE_OPENAI_API_KEY;
      const model = process.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview';

      const openAIMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      ];

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: openAIMessages,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      responseContent = response.data.choices[0].message.content;
      usage = response.data.usage;
    }

    // Extract code block for the UI
    const codeBlockMatch = responseContent.match(/```[\w]*\n([\s\S]*?)```/);
    const code = codeBlockMatch ? codeBlockMatch[1].trim() : null;

    res.json({
      content: responseContent,
      code: code,
      usage: usage
    });

  } catch (error) {
    console.error("Chat error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to process chat request",
      message: error.message,
      details: error.response?.data
    });
  }
});

export default router;
