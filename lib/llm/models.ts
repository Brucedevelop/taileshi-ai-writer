export interface AIModel {
  id: string;
  name: string;
  provider: string;
  costTier: 'budget' | 'standard' | 'premium';
  description: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    costTier: 'standard',
    description: 'General writing, balanced speed and quality',
  },
  {
    id: 'anthropic/claude-sonnet-4-20250514',
    name: 'Claude Sonnet',
    provider: 'Anthropic',
    costTier: 'standard',
    description: 'Detailed long-form writing',
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude Haiku',
    provider: 'Anthropic',
    costTier: 'budget',
    description: 'Fast tasks, translation',
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    costTier: 'standard',
    description: 'Deep research and analysis',
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini Flash',
    provider: 'Google',
    costTier: 'budget',
    description: 'Batch publishing, cheapest option',
  },
];

export const MODEL_GROUPS = AVAILABLE_MODELS.reduce(
  (groups, model) => {
    if (!groups[model.provider]) groups[model.provider] = [];
    groups[model.provider].push(model);
    return groups;
  },
  {} as Record<string, AIModel[]>
);

export const COST_TIER_LABELS: Record<AIModel['costTier'], string> = {
  budget: '💰 Budget',
  standard: '💰💰 Standard',
  premium: '💰💰💰 Premium',
};
