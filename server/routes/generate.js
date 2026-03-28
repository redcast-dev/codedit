import express from "express";
import axios from "axios";

const router = express.Router();

// POST /api/ai/generate
// Generate code from a prompt using AI
router.post("/", async (req, res) => {
  try {
    const { prompt, language, context, files } = req.body;

    if (!prompt || !language) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["prompt", "language"],
      });
    }

    // TODO: Replace with actual AI provider call
    // Example with OpenAI:
    /*
    const response = await axios.post(
      `${process.env.AI_PROVIDER_URL}/chat/completions`,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a code generation assistant. Generate ${language} code based on user prompts.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedCode = response.data.choices[0].message.content;
    */

    // Demo response
    const generatedCode = `// Generated ${language} code
// Prompt: ${prompt}

function example() {
  console.log('This is AI-generated ${language} code');
  // Add your implementation here
}

example();
`;

    res.json({
      code: generatedCode,
      explanation: `Generated ${language} code based on: "${prompt}"`,
      language,
    });
  } catch (error) {
    console.error("Generate error:", error);
    res.status(500).json({
      error: "Failed to generate code",
      message: error.message,
    });
  }
});

export default router;
