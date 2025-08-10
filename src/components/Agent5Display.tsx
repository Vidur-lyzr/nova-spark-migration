import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Agent5DisplayProps {
  step: string;
  finalPrompt: string | any;
  rawFinalResponse?: any;
}

export function Agent5Display({ step, finalPrompt, rawFinalResponse }: Agent5DisplayProps) {
  const getStepStatus = (stepName: string) => {
    if (step === 'complete') return 'complete';
    if (step === 'error') return 'error';
    
    const stepOrder = ['generating', 'migrating', 'testing', 'analyzing', 'optimizing'];
    const currentIndex = stepOrder.indexOf(step);
    const targetIndex = stepOrder.indexOf(stepName);
    
    if (targetIndex < currentIndex) return 'complete';
    if (targetIndex === currentIndex) return 'active';
    return 'pending';
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'active':
        return <Clock className="w-4 h-4 text-processing animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Show loading state
  if (!finalPrompt && !rawFinalResponse) {
    return (
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <StatusIcon status={getStepStatus('optimizing')} />
          <h3 className="text-lg font-semibold gradient-text">Agent 5 - Final Optimization</h3>
        </div>
        <div className="text-center text-muted-foreground py-8">
          {getStepStatus('optimizing') === 'active' ? 'Optimizing prompt...' : 'Waiting for prompt optimization...'}
        </div>
      </Card>
    );
  }

  // Extract the improved_prompt using the same pattern as Agent 2
  let extractedPrompt = finalPrompt || '';
  
  // If we have rawFinalResponse, use it first
  if (rawFinalResponse) {
    if (typeof rawFinalResponse === 'string') {
      extractedPrompt = rawFinalResponse;
    } else if (rawFinalResponse.improved_prompt) {
      extractedPrompt = rawFinalResponse.improved_prompt;
    } else if (rawFinalResponse.response) {
      extractedPrompt = rawFinalResponse.response;
    }
  }
  
  // Extract the actual prompt content if it's in a JSON structure (same as Agent 2)
  let displayPrompt = extractedPrompt;
  try {
    const parsed = JSON.parse(extractedPrompt);
    if (parsed.improved_prompt) {
      displayPrompt = parsed.improved_prompt;
    }
  } catch (e) {
    // Not JSON, use as-is
  }

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StatusIcon status={getStepStatus('optimizing')} />
          <h3 className="text-lg font-semibold gradient-text">Agent 5 - Final Optimization</h3>
        </div>
        <Badge variant="outline" className="text-accent border-accent/30">Optimized</Badge>
      </div>
      
      <Card className="p-4 bg-background/50">
        <div className="space-y-2 mb-4">
          <span className="text-xs text-muted-foreground">
            Final Optimized Prompt ({displayPrompt.length} characters)
          </span>
        </div>
        <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed border border-border/50 rounded p-4 bg-background/30 max-h-80 overflow-y-auto">
          {displayPrompt}
        </pre>
      </Card>
    </Card>
  );
}