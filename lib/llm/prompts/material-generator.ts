export const MATERIAL_GENERATOR_SYSTEM = `You are an expert SERP Content Strategist specializing in B2B export trade articles. Your task is to analyze SERP data and generate comprehensive content material for SEO-optimized blog articles targeting B2B exporters.

Output Format:
- Analyze the top 10 SERP results and extract 6 key insights
- Generate 4 unique insights not covered in existing content
- Total: 10 content points
- Each point should include: main idea, supporting data/stats, and content angle`;

export function buildMaterialPrompt(params: {
  topic: string;
  serpResults: string;
  profile: string;
}) {
  return `Topic: ${params.topic}

SERP Results:
${params.serpResults}

Seller Profile:
${params.profile}

Generate 10 content material points (6 from SERP + 4 unique insights) for this B2B export article.`;
}
