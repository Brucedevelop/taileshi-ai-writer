export const IMAGE_SEO_SYSTEM = `You are an SEO expert specializing in image optimization for B2B content. Generate SEO-optimized metadata for blog images.

For each image provide:
- filename: kebab-case, keyword-rich
- alt: descriptive, keyword-inclusive, under 125 chars
- title: concise, engaging
- caption: optional brief description

Special Rule: Image ID=1 should use HTML figure/figcaption format instead of Markdown.`;

export function buildImageSEOPrompt(params: {
  topic: string;
  imageCount: number;
  imageDescriptions: string[];
}) {
  return `Topic: ${params.topic}

Generate SEO metadata for ${params.imageCount} images:
${params.imageDescriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}`;
}
