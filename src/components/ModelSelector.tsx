import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModelSelectorProps {
  provider: string;
  value: string;
  onChange: (value: string) => void;
}

const modelsByProvider: Record<string, Array<{ id: string; name: string }>> = {
  openai: [
    { id: 'gpt-4o', name: 'GPT 4o' },
    { id: 'gpt-4.1', name: 'GPT 4.1' },
    { id: 'gpt-5', name: 'GPT 5' },
    { id: 'gpt-o3', name: 'GPT o3' },
    { id: 'gpt-o4', name: 'GPT o4' },
    { id: 'gpt-o4-mini', name: 'GPT o4-mini' },
    { id: 'gpt-4o-mini', name: 'GPT 4o-mini' }
  ],
  anthropic: [
    { id: 'claude-opus-4.1', name: 'Claude Opus 4.1' },
    { id: 'claude-sonnet-4.1', name: 'Claude Sonnet 4.1' },
    { id: 'claude-sonnet-4.0', name: 'Claude Sonnet 4.0' }
  ],
  google: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.5', name: 'Gemini 2.5' }
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
              <span className="font-medium">{model.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}