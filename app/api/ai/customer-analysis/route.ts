import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateCompletion } from '@/lib/llm/openrouter-client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  profileId: z.string(),
  model: z.string().optional(),
});

const CUSTOMER_ANALYSIS_SYSTEM = `You are an expert B2B market research analyst specializing in international trade and export business. Analyze the given business profile and generate a comprehensive customer analysis.

Structure your analysis with these sections:
1. **Customer Persona Summary** - Key characteristics of the ideal buyer
2. **Pain Points Analysis** - Main challenges and problems they face
3. **Content Strategy Recommendations** - Topics and content types that will resonate
4. **SEO Keyword Suggestions** - 10-15 high-value keywords to target
5. **Recommended Topics** - 10 specific article topics to write about

Format your response in Markdown with clear headings and bullet points.`;

function buildCustomerAnalysisPrompt(profile: Record<string, unknown>): string {
  const fields = [
    profile.bizName && `Business Name: ${String(profile.bizName)}`,
    profile.mainProducts && `Products: ${String(profile.mainProducts)}`,
    profile.businessModel && `Business Model: ${String(profile.businessModel)}`,
    profile.country && `Country: ${String(profile.country)}`,
    profile.customerPosition && `Customer Position: ${String(profile.customerPosition)}`,
    profile.customerType && `Customer Type: ${String(profile.customerType)}`,
    profile.personaName && `Persona Name: ${String(profile.personaName)}`,
    profile.personaCountry && `Persona Country: ${String(profile.personaCountry)}`,
    profile.personaAge && `Persona Age: ${String(profile.personaAge)}`,
    profile.personaTraits && `Persona Traits: ${String(profile.personaTraits)}`,
    profile.personaProducts && `Persona Products: ${String(profile.personaProducts)}`,
    profile.personaPreferences && `Persona Preferences: ${String(profile.personaPreferences)}`,
    profile.personaRole && `Persona Role: ${String(profile.personaRole)}`,
    profile.personaPainPoints && `Pain Points: ${String(profile.personaPainPoints)}`,
    profile.personaRequirements && `Requirements: ${String(profile.personaRequirements)}`,
  ]
    .filter(Boolean)
    .join('\n');

  return `Generate a comprehensive customer analysis for this business profile:\n\n${fields}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { profileId, model } = parsed.data;

  const [profile, user] = await Promise.all([
    prisma.roleProfile.findUnique({ where: { id: profileId, userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { preferredModel: true } }),
  ]);

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const selectedModel = model ?? user?.preferredModel ?? 'openai/gpt-4o';

  const analysis = await generateCompletion(
    buildCustomerAnalysisPrompt(profile as Record<string, unknown>),
    CUSTOMER_ANALYSIS_SYSTEM,
    selectedModel
  );

  return NextResponse.json({ analysis, profileName: profile.name });
}
