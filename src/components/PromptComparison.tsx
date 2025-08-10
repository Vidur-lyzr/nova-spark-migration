import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OptimizationPopup } from './OptimizationPopup';

interface PromptComparisonProps {
  originalPrompt: string;
  finalPrompt: string;
  optimizations: string[];
  rawFinalResponse?: any;
  onCopy?: () => void;
}

export function PromptComparison({ originalPrompt, finalPrompt, optimizations, rawFinalResponse, onCopy }: PromptComparisonProps) {
  const [activeTab, setActiveTab] = useState('comparison');
  const [showOptimizations, setShowOptimizations] = useState(false);
  const { toast } = useToast();

  // Use the same extraction logic as Agent5Display
  let extractedPrompt = finalPrompt || '';
  
  // If we have rawFinalResponse, use it first (same as Agent5Display)
  if (rawFinalResponse) {
    if (typeof rawFinalResponse === 'string') {
      extractedPrompt = rawFinalResponse;
    } else if (rawFinalResponse.improved_prompt) {
      extractedPrompt = rawFinalResponse.improved_prompt;
    } else if (rawFinalResponse.response) {
      extractedPrompt = rawFinalResponse.response;
    }
  }
  
  // Extract the actual prompt content if it's in a JSON structure (same as Agent5Display)
  let displayFinalPrompt = extractedPrompt;
  try {
    const parsed = JSON.parse(extractedPrompt);
    if (parsed.improved_prompt) {
      displayFinalPrompt = parsed.improved_prompt;
    }
  } catch (e) {
    // Not JSON, use as-is
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayFinalPrompt);
      toast({
        title: "Copied to clipboard",
        description: "The Nova-optimized prompt has been copied to your clipboard.",
      });
      onCopy?.();
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the prompt to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold gradient-text">Migration Results</h3>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-48 grid-cols-2">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="mt-6">
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Original Prompt</h4>
                  <span className="text-xs text-muted-foreground">
                    {originalPrompt.length} chars
                  </span>
                </div>
                <ScrollArea className="h-64 w-full rounded-md border border-white/10">
                  <div className="p-4 font-mono text-sm">
                    <pre className="whitespace-pre-wrap text-muted-foreground">
                      {originalPrompt}
                    </pre>
                  </div>
                </ScrollArea>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-6 h-6 text-accent" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-accent">Nova-Optimized Prompt</h4>
                   <span className="text-xs text-muted-foreground">
                     {displayFinalPrompt.length} chars
                  </span>
                </div>
                <ScrollArea className="h-64 w-full rounded-md border border-accent/30">
                  <div className="p-4 font-mono text-sm">
                     <pre className="whitespace-pre-wrap text-foreground">
                       {displayFinalPrompt}
                    </pre>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimizations" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Applied Optimizations</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOptimizations(true)}
                  className="text-accent border-accent/30 hover:bg-accent/10"
                >
                  View Details
                </Button>
              </div>
              {optimizations.length === 0 ? (
                <p className="text-muted-foreground">No optimizations were applied.</p>
              ) : (
                <div className="grid gap-3 max-h-48 overflow-y-auto">
                  {optimizations.slice(0, 3).map((optimization, index) => (
                    <Card key={index} className="p-3 glass-card-bright">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-accent text-xs font-medium">{index + 1}</span>
                        </div>
                        <p className="text-sm text-foreground">{optimization}</p>
                      </div>
                    </Card>
                  ))}
                  {optimizations.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      and {optimizations.length - 3} more optimizations...
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-sm text-muted-foreground">
            Ready to use with Amazon Nova
          </div>
          
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Nova Prompt
          </Button>
        </div>
      </Card>

      <OptimizationPopup
        isOpen={showOptimizations}
        onClose={() => setShowOptimizations(false)}
        optimizations={optimizations}
      />
    </>
  );
}