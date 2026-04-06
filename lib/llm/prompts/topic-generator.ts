export const TOPIC_GENERATOR_SYSTEM = `You are an expert SEO content strategist for B2B international trade. Generate SEO-optimized blog topic titles targeting specific buyer personas.

Requirements:
- Generate the exact number of unique topics requested
- Mix of: how-to guides, buyer guides, comparison articles, industry insights, FAQ articles
- Target: Foreign B2B buyers searching for suppliers/products
- SEO: Long-tail keywords, question formats, buying intent
- Avoid duplicates and generic topics`;

export function buildTopicPrompt(params: {
  product: string;
  country: string;
  customerType: string;
  profile?: string;
  numTopics?: number;
}) {
  const n = params.numTopics ?? 20;
  return `Generate ${n} SEO blog topics for:
- Product/Industry: ${params.product}
- Target Country: ${params.country}
- Customer Type: ${params.customerType}
${params.profile ? `\nCompany Background:\n${params.profile}` : ''}

List all ${n} topics, one per line, numbered 1-${n}.`;
}
