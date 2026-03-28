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
    const systemPrompt = `You are an expert full-stack developer and coding assistant.
Your goal is to help the user write, debug, and refactor code.

Context:
- Current language: ${context?.language || 'unknown'}
- Available files: ${context?.files?.join(", ") || 'none'}
${context?.currentCode ? `- Current File Content:\n\`\`\`${context.language}\n${context.currentCode}\n\`\`\`` : ''}

CRITICAL INSTRUCTIONS:
1. When asked to generate code, provide COMPLETE, WORKING, and PRODUCTION-READY code.
2. DO NOT use placeholders like "// implementation here" or "..." unless absolutely necessary for brevity in unchanged sections.
3. If generating a full file, include all necessary imports and exports.
4. If generating a project or multiple files, use valid file creation syntax or explain clearly.
5. Wrap your code in markdown code blocks, e.g., \`\`\`javascript ... \`\`\`.
6. Be concise in your explanations but thorough in your code.
7. If the user asks for a specific app (e.g., "recipe app"), generate the core components and logic needed to make it work.

Respond in a helpful, friendly, and professional manner.`;

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
