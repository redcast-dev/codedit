import express from "express";
import { exec } from "child_process";
import { promisify } from "util";

const router = express.Router();
const execAsync = promisify(exec);

// POST /api/ai/execute
// Execute code securely (DEMO ONLY - NOT PRODUCTION SAFE)
router.post("/", async (req, res) => {
  try {
    const { language, code, stdin } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["language", "code"],
      });
    }

    // WARNING: This is a DEMO implementation only
    // In production, use containerized execution (Docker, Firecracker, etc.)
    // or a remote sandbox service (Judge0, Piston, etc.)

    console.log(`Execution request for ${language} (DEMO MODE)`);

    // Demo response - don't actually execute user code
    res.json({
      stdout: `(DEMO) Code execution simulated for ${language}\nOutput would appear here in production\n`,
      stderr: "",
      exitCode: 0,
      warning: "This is a demo response. Real execution requires secure containerization.",
    });

    // Example production implementation with Docker:
    /*
    const response = await axios.post(
      `${process.env.EXECUTION_SERVICE_URL}/execute`,
      {
        language,
        code,
        stdin,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.EXECUTION_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      stdout: response.data.stdout,
      stderr: response.data.stderr,
      exitCode: response.data.exitCode,
    });
    */
  } catch (error) {
    console.error("Execute error:", error);
    res.status(500).json({
      error: "Failed to execute code",
      message: error.message,
    });
  }
});

export default router;
