export interface SerpResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  displayedLink?: string;
}

export interface SerpInsights {
  query: string;
  topResults: SerpResult[];
  relatedSearches: string[];
  peopleAlsoAsk: string[];
}

export async function searchGoogle(
  query: string,
  options?: { num?: number; hl?: string; gl?: string }
): Promise<SerpInsights> {
  const params = new URLSearchParams({
    api_key: process.env.SERPAPI_KEY!,
    engine: 'google',
    q: query,
    num: String(options?.num ?? 10),
    hl: options?.hl ?? 'en',
    gl: options?.gl ?? 'us',
  });

  const response = await fetch(`https://serpapi.com/search?${params}`);

  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.statusText}`);
  }

  const data = await response.json() as {
    organic_results?: Array<{
      position: number;
      title: string;
      link: string;
      snippet: string;
      displayed_link?: string;
    }>;
    related_searches?: Array<{ query: string }>;
    people_also_ask?: Array<{ question: string }>;
  };

  return {
    query,
    topResults: (data.organic_results ?? []).slice(0, 10).map((r) => ({
      position: r.position,
      title: r.title,
      link: r.link,
      snippet: r.snippet,
      displayedLink: r.displayed_link,
    })),
    relatedSearches: (data.related_searches ?? []).map((r) => r.query),
    peopleAlsoAsk: (data.people_also_ask ?? []).map((r) => r.question),
  };
}

export function extractInsights(results: SerpInsights): string {
  const lines: string[] = [];

  lines.push(`## SERP Analysis: "${results.query}"\n`);
  lines.push('### Top 10 Results:\n');

  results.topResults.forEach((r, i) => {
    lines.push(`${i + 1}. **${r.title}**`);
    lines.push(`   URL: ${r.link}`);
    lines.push(`   Snippet: ${r.snippet}\n`);
  });

  if (results.peopleAlsoAsk.length > 0) {
    lines.push('\n### People Also Ask:');
    results.peopleAlsoAsk.forEach((q) => lines.push(`- ${q}`));
  }

  if (results.relatedSearches.length > 0) {
    lines.push('\n### Related Searches:');
    results.relatedSearches.forEach((s) => lines.push(`- ${s}`));
  }

  return lines.join('\n');
}
