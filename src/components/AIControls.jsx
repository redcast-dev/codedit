import { useState } from "react";
import { aiRequest } from "../lib/aiClient";

export default function AIControls({ code, language, onInsert }) {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setLog("Generating...");
    try {
      const res = await aiRequest("generate", { prompt: `Generate a ${language} code sample`, language });
      setLog(res.explanation || "Generated");
      onInsert(res.code, `${language}-generated.${language}`);
    } catch (e) {
      console.error(e);
      setLog("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefactor() {
    setLoading(true);
    setLog("Refactoring...");
    try {
      const res = await aiRequest("refactor", { code });
      setLog(res.notes || "Refactored");
      onInsert(res.refactoredCode, `refactor.${language}`);
    } catch (e) {
      console.error(e);
      setLog("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleExecute() {
    setLoading(true);
    setLog("Executing...");
    try {
      const res = await aiRequest("execute", { language, code });
      setLog(`stdout: ${res.stdout}`);
    } catch (e) {
      setLog("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-2 border-t">
      <div className="flex gap-2">
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          onClick={handleGenerate}
          disabled={loading}
        >
          Generate
        </button>
        <button
          className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
          onClick={handleRefactor}
          disabled={loading}
        >
          Refactor
        </button>
        <button
          className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
          onClick={handleExecute}
          disabled={loading}
        >
          Execute
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-600 min-h-[20px]">{log}</div>
    </div>
  );
}
