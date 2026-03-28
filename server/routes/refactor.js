import express from "express";
import axios from "axios";

const router = express.Router();

// POST /api/ai/refactor
// Refactor existing code using AI
router.post("/", async (req, res) => {
  try {
    const { code, request } = req.body;

    if (!code) {
      return res.status(400).json({
        error: "Missing required field: code",
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
            content: "You are a code refactoring assistant. Improve code quality, readability, and performance.",
          },
          {
            role: "user",
            content: `Refactor this code${request ? ` with focus on: ${request}` : ''}:\n\n${code}`,
          },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const refactoredCode = response.data.choices[0].message.content;
    */

    // Demo response - add comments and formatting
    const refactoredCode = `${code}

// Refactored by CODEDIT AI
// Improvements: Added comments, improved structure
`;

    res.json({
      refactoredCode,
      notes: `Code refactored${request ? ` with focus on: ${request}` : ''}. Added comments and improved structure.`,
      original: code,
    });
  } catch (error) {
    console.error("Refactor error:", error);
    res.status(500).json({
      error: "Failed to refactor code",
      message: error.message,
    });
  }
});

export default router;
