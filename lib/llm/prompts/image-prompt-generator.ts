export const IMAGE_PROMPT_SYSTEM = `You are an expert at creating Recraft.ai image prompts for B2B manufacturing blog articles. Generate professional, realistic image prompts.

Requirements:
- Generate 5 article parts × 2 scene variations = 10 total prompts
- Style: Professional, realistic product/industrial photography
- Format: Detailed English prompts suitable for Recraft.ai
- Include: Lighting, angle, mood, background details
- Avoid: Text in images, logos, people's faces`;

export function buildImagePromptQuery(params: {
  topic: string;
  articleContent: string;
}) {
  return `Article Topic: ${params.topic}

Article Content Summary:
${params.articleContent.substring(0, 1000)}

Generate 10 image prompts (5 article sections × 2 variations each) for professional B2B blog illustrations.`;
}
