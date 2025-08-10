import { Textarea } from '@/components/ui/textarea';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        System Prompt
        <span className="text-xs text-muted-foreground ml-2">
          (Paste your current system prompt here)
        </span>
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="You are an AI assistant that helps users with..."
        className="glass-card-bright hover-lift min-h-[300px] resize-none font-mono text-sm leading-relaxed"
        rows={12}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{value.length} characters</span>
        <span>{value.split('\n').length} lines</span>
      </div>
    </div>
  );
}