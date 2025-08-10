import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModelSelectorProps {
  provider: string;
  value: string;
  onChange: (value: string) => void;
}

const modelsByProvider: Record<string, Array<{ id: string; name: string; description: string }>> = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest GPT-4 Optimized' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Fast and capable' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Cost-effective' }
  ],
  anthropic: [
    { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most powerful' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and efficient' }
  ],
  google: [
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s best model' },
    { id: 'gemini-ultra', name: 'Gemini Ultra', description: 'Most capable' }
  ]
};

export function ModelSelector({ provider, value, onChange }: ModelSelectorProps) {
  const models = modelsByProvider[provider] || [];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Current Model
      </label>
      <Select value={value} onValueChange={onChange} disabled={!provider}>
        <SelectTrigger className="glass-card-bright hover-lift h-12">
          <SelectValue placeholder={provider ? "Select your current model" : "Select a provider first"} />
        </SelectTrigger>
        <SelectContent className="glass-card border-white/20">
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id} className="hover:bg-white/10">
              <div className="flex flex-col items-start">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}