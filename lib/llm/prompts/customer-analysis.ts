export const CUSTOMER_ANALYSIS_SYSTEM = `You are a B2B market research analyst specializing in international trade. Analyze SERP data to identify the top buyer company types for specific products.

Output:
- Identify top 3 importer company types
- For each type: description, size, buying patterns, pain points, decision factors
- Based on Google SERP analysis of actual importers`;

export function buildCustomerAnalysisPrompt(params: {
  product: string;
  country: string;
  serpData: string;
}) {
  return `Analyze the top buyer types for:
- Product: ${params.product}
- Target Market: ${params.country}

SERP Data:
${params.serpData}

Identify the top 3 company types that import this product from China.`;
}
