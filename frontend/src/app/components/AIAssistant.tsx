"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const mockAIResponse = async (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lower = prompt.toLowerCase();

        if (lower.includes("trial balance")) {
          router.push("/general_ledger/trial_balance");
          resolve("Opening the Trial Balance report...");
        } else if (lower.includes("general ledger")) {
          router.push("/general_ledger");
          resolve("Taking you to the General Ledger...");
        } else {
          resolve(`You said: "${prompt}". I'm just a demo assistant!`);
        }
      }, 1000);
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const reply = await mockAIResponse(input);
      setResponse(reply);
    } catch (error) {
      setResponse("Something went wrong.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-80 h-96 bg-white dark:bg-neutral-900 shadow-xl rounded-xl border border-gray-300 dark:border-neutral-700 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2 text-gray-800 dark:text-gray-100">
            <span className="font-semibold">AI Assistant</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✖
            </button>
          </div>
          <div className="flex-1 overflow-y-auto text-sm text-gray-700 dark:text-gray-200">
            {loading ? (
              <p className="text-gray-400 italic">Thinking...</p>
            ) : response ? (
              <p>{response}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Ask me something!
              </p>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Type your question..."
              className="flex-1 px-2 py-1 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-black dark:text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white w-12 h-12 rounded-full shadow-xl flex items-center justify-center"
          aria-label="Open AI Assistant"
        >
          <span className="text-xl font-bold">?</span>
        </button>
      )}
    </div>
  );
}
