import { AIResponse } from "@/lib/types/ai";

/**
 * sendAIRequest - Sends a prompt to the AI assistant and receives a response.
 *
 * @param prompt - The user's input message
 * @returns AIResponse object
 */
export async function sendAIRequest(prompt: string): Promise<AIResponse> {
  const res = await fetch("http://localhost:8000/api/v1/ai_assistant/requests", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`AI request failed: ${res.status} ${res.statusText} - ${errorText}`);
  }

  return res.json();
}
