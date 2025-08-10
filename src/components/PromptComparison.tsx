import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PromptComparisonProps {
  originalPrompt: string;
  finalPrompt: string;
  improvements: string[];
  onCopy?: () => void;
  onDownload?: () => void;
}

export function PromptComparison({ 
  originalPrompt, 
  finalPrompt, 
  improvements,
  onCopy,
  onDownload 
}: PromptComparisonProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'comparison' | 'improvements'>('comparison');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalPrompt);
      toast({
        title: "Copied to clipboard",
        description: "Nova-optimized prompt has been copied to your clipboard."
      });
      onCopy?.();
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please select and copy manually.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold gradient-text">Migration Results</h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'comparison' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('comparison')}
            className="text-xs"
          >
            Comparison
          </Button>
          <Button
            variant={activeTab === 'improvements' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('improvements')}
            className="text-xs"
          >
            Improvements
          </Button>
        </div>
      </div>

      {activeTab === 'comparison' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Original Prompt */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground">Original Prompt</h4>
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {originalPrompt.length} chars
              </span>
            </div>
            <ScrollArea className="h-64 w-full rounded-md border border-white/10">
              <div className="p-4 font-mono text-sm text-muted-foreground whitespace-pre-wrap">
                {originalPrompt || 'No original prompt provided'}
              </div>
            </ScrollArea>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="w-8 h-8 text-primary" />
          </div>

          {/* Nova-Optimized Prompt */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-accent">Nova-Optimized Prompt</h4>
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                {finalPrompt.length} chars
              </span>
            </div>
            <ScrollArea className="h-64 w-full rounded-md border border-accent/20 bg-accent/5">
              <div className="p-4 font-mono text-sm text-foreground whitespace-pre-wrap">
                {finalPrompt || 'Generating optimized prompt...'}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {activeTab === 'improvements' && (
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Applied Improvements</h4>
          {improvements.length > 0 ? (
            <div className="space-y-3">
              {improvements.map((improvement, index) => (
                <div key={index} className="glass-card-bright p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-foreground">{improvement}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No specific improvements identified.</p>
              <p className="text-xs mt-1">The prompt was already well-optimized for Nova.</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        <Button 
          onClick={handleCopy}
          className="flex items-center gap-2 hover-lift"
          disabled={!finalPrompt}
        >
          <Copy className="w-4 h-4" />
          Copy Nova Prompt
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onDownload}
          className="flex items-center gap-2 hover-lift"
          disabled={!finalPrompt}
        >
          <Download className="w-4 h-4" />
          Download Report
        </Button>
        
        <div className="ml-auto text-xs text-muted-foreground">
          Ready to use with Amazon Nova
        </div>
      </div>
    </div>
  );
}