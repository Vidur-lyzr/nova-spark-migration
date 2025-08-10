import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProviderSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const providers = [
  { id: 'openai', name: 'OpenAI', icon: '🤖' },
  { id: 'anthropic', name: 'Anthropic', icon: '🧠' },
  { id: 'google', name: 'Google', icon: '🔍' }
];

export function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Current AI Provider
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="glass-card-bright hover-lift h-12">
          <SelectValue placeholder="Select your current AI provider" />
        </SelectTrigger>
        <SelectContent className="glass-card border-white/20">
          {providers.map((provider) => (
            <SelectItem key={provider.id} value={provider.id} className="hover:bg-white/10">
              <div className="flex items-center gap-3">
                <span className="text-lg">{provider.icon}</span>
                <span>{provider.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}