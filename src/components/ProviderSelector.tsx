import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProviderSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const providers = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google' }
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
              <span>{provider.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}