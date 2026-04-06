import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateCompletion } from '@/lib/llm/openrouter-client';
import { z } from 'zod';

const schema = z.object({
  name: z.string().optional().nullable(),
  bizName: z.string().optional().nullable(),
  bizEmail: z.string().optional().nullable(),
  bizWebsite: z.string().optional().nullable(),
  brandName: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  mainProducts: z.string().optional().nullable(),
  businessModel: z.string().optional().nullable(),
  companyStatus: z.string().optional().nullable(),
  exportCountries: z.string().optional().nullable(),
  customerPosition: z.string().optional().nullable(),
  customerType: z.string().optional().nullable(),
  advantages: z.string().optional().nullable(),
  mainChannels: z.string().optional().nullable(),
  personaName: z.string().optional().nullable(),
  personaCountry: z.string().optional().nullable(),
  personaAge: z.string().optional().nullable(),
  personaTraits: z.string().optional().nullable(),
  personaProducts: z.string().optional().nullable(),
  personaPreferences: z.string().optional().nullable(),
  personaRole: z.string().optional().nullable(),
  personaSourcingRegion: z.string().optional().nullable(),
  personaBusinessModel: z.string().optional().nullable(),
  personaFindSuppliers: z.string().optional().nullable(),
  personaRequirements: z.string().optional().nullable(),
  personaPainPoints: z.string().optional().nullable(),
});

const SYSTEM_PROMPT = `你是一位专业的外贸企业品牌文案顾问。请根据用户提供的企业信息和客户画像，生成一段专业、简洁的中文商业摘要。

摘要应包含：
1. 企业概述（公司名称、主营产品、业务模式）
2. 主要目标市场和出口地区
3. 核心竞争优势
4. 目标客户画像（角色、国家、采购习惯、痛点）
5. 内容营销方向建议

摘要字数控制在300-500字，语言专业流畅，突出企业优势和客户价值。直接输出摘要内容，不要添加标题或分点符号。`;

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const fields = [
    data.bizName && `公司名称：${data.bizName}`,
    data.brandName && `品牌名称：${data.brandName}`,
    data.country && `所在国家：${data.country}`,
    data.companyStatus && `公司类型：${data.companyStatus}`,
    data.mainProducts && `主要产品：${data.mainProducts}`,
    data.businessModel && `业务模式：${data.businessModel}`,
    data.exportCountries && `出口国家：${data.exportCountries}`,
    data.customerPosition && `目标客户职位：${data.customerPosition}`,
    data.customerType && `客户类型：${data.customerType}`,
    data.advantages && `核心优势：${data.advantages}`,
    data.mainChannels && `主要销售渠道：${data.mainChannels}`,
    data.bizEmail && `联系邮箱：${data.bizEmail}`,
    data.bizWebsite && `官方网站：${data.bizWebsite}`,
    data.personaName && `客户画像名称：${data.personaName}`,
    data.personaCountry && `客户所在国家：${data.personaCountry}`,
    data.personaAge && `客户年龄段：${data.personaAge}`,
    data.personaRole && `客户职位：${data.personaRole}`,
    data.personaTraits && `客户特征：${data.personaTraits}`,
    data.personaProducts && `客户采购产品：${data.personaProducts}`,
    data.personaPreferences && `客户偏好：${data.personaPreferences}`,
    data.personaSourcingRegion && `客户采购地区：${data.personaSourcingRegion}`,
    data.personaBusinessModel && `客户经营模式：${data.personaBusinessModel}`,
    data.personaFindSuppliers && `客户寻找供应商方式：${data.personaFindSuppliers}`,
    data.personaRequirements && `客户核心需求：${data.personaRequirements}`,
    data.personaPainPoints && `客户痛点：${data.personaPainPoints}`,
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `请根据以下企业信息和客户画像，生成一段专业的中文商业摘要：\n\n${fields}`;

  const summaryZh = await generateCompletion(prompt, SYSTEM_PROMPT, 'openai/gpt-4o');

  return NextResponse.json({ summaryZh });
}
