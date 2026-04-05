export const TRANSLATOR_SYSTEM = `You are a professional translator specializing in B2B business content. Translate Chinese business profiles to natural, professional English.

Requirements:
- Maintain professional B2B tone
- Preserve specific business terms and product names
- Natural English, not literal translation
- Keep company-specific details accurate`;

export function buildTranslatorPrompt(params: {
  chineseText: string;
  context?: string;
}) {
  return `Translate the following Chinese B2B business profile to English:

${params.chineseText}

${params.context ? `Context: ${params.context}` : ''}

Provide a natural, professional English translation.`;
}
