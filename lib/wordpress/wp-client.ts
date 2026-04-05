export interface WPPost {
  title: string;
  content: string;
  status: 'draft' | 'publish' | 'future';
  categories?: number[];
  tags?: number[];
  featuredMediaId?: number;
  date?: string;
}

export interface WPPostResult {
  id: number;
  link: string;
  status: string;
}

export interface WPMediaResult {
  id: number;
  source_url: string;
  alt_text: string;
}

export class WPClient {
  private baseUrl: string;
  private authHeader: string;

  constructor(siteUrl: string, username: string, appPassword: string) {
    this.baseUrl = siteUrl.replace(/\/$/, '') + '/wp-json/wp/v2';
    const credentials = Buffer.from(`${username}:${appPassword}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  async testConnection(): Promise<{ success: boolean; siteName?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/posts?per_page=1`, {
        headers: { Authorization: this.authHeader },
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const siteResponse = await fetch(this.baseUrl.replace('/wp-json/wp/v2', '/wp-json'));
      const siteData = await siteResponse.json() as { name?: string };

      return { success: true, siteName: siteData.name };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async createPost(post: WPPost): Promise<WPPostResult> {
    const body: Record<string, unknown> = {
      title: post.title,
      content: post.content,
      status: post.status,
    };

    if (post.categories?.length) body.categories = post.categories;
    if (post.tags?.length) body.tags = post.tags;
    if (post.featuredMediaId) body.featured_media = post.featuredMediaId;
    if (post.date) body.date = post.date;

    const response = await fetch(`${this.baseUrl}/posts`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create post: ${error}`);
    }

    const data = await response.json() as { id: number; link: string; status: string };
    return { id: data.id, link: data.link, status: data.status };
  }

  async uploadMedia(
    imageBuffer: Buffer,
    filename: string,
    mimeType: string,
    altText?: string
  ): Promise<WPMediaResult> {
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: mimeType });
    formData.append('file', blob, filename);
    if (altText) formData.append('alt_text', altText);

    const response = await fetch(`${this.baseUrl}/media`, {
      method: 'POST',
      headers: { Authorization: this.authHeader },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload media: ${error}`);
    }

    const data = await response.json() as { id: number; source_url: string; alt_text: string };
    return { id: data.id, source_url: data.source_url, alt_text: data.alt_text };
  }
}
