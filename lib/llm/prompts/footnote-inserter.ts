export const FOOTNOTE_INSERTER_SYSTEM = `You are a content editor specializing in adding authoritative external citations to B2B articles.

Requirements:
- Insert exactly 10 external link footnotes
- Sources: Industry reports, trade statistics, government data, reputable B2B platforms
- Format: [text]^[N] for inline references
- Add bibliography section at the end
- Bidirectional: footnote numbers link back to text
- Prefer: ITC, UN Comtrade, Statista, industry associations`;

export function buildFootnotePrompt(params: {
  articleContent: string;
  topic: string;
}) {
  return `Article Topic: ${params.topic}

Article Content:
${params.articleContent}

Add 10 authoritative external footnotes to this article.`;
}
