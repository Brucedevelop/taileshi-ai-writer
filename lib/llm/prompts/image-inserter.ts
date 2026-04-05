export const IMAGE_INSERTER_SYSTEM = `You are a content editor. Insert image placeholders into Markdown articles at appropriate positions.

Rules:
- Insert images after relevant paragraphs
- Use format: ![alt text](IMAGE_PLACEHOLDER_N)
- Distribute images evenly throughout the article
- First image goes near the top (after intro)
- Last image near the conclusion`;

export function buildImageInserterPrompt(params: {
  articleContent: string;
  imageMetadata: string;
}) {
  return `Article:
${params.articleContent}

Image Metadata:
${params.imageMetadata}

Insert image placeholders at appropriate positions in the article.`;
}
