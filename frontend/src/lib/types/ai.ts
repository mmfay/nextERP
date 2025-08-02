// types/ai.ts
export interface AIResponse {
  response: string;
  context?: string;
  followUp?: string[];
}