import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateCompletion } from '@/lib/llm/openrouter-client';
import { z } from 'zod';

const schema = z.object({
  summaryZh: z.string().min(1),
});

const SYSTEM_PROMPT = `You are a professional business translator specializing in B2B international trade content. Translate the provided Chinese business summary into professional English.

Requirements:
- Maintain the professional and business-oriented tone
- Preserve all specific details (company names, products, markets, percentages)
- Use industry-standard B2B terminology
- Output only the translated English text, no additional commentary`;

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { summaryZh } = parsed.data;

  const prompt = `Please translate the following Chinese business summary into professional English:\n\n${summaryZh}`;

  const summaryEn = await generateCompletion(prompt, SYSTEM_PROMPT, 'openai/gpt-4o');

  return NextResponse.json({ summaryEn });
}
