import OpenAI from 'openai';

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export async function generateCompletion(
  prompt: string,
  systemPrompt: string,
  model: string = 'openai/gpt-4o',
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await openrouter.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4000,
  });
  return response.choices[0].message.content ?? '';
}
