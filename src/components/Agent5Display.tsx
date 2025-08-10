import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Agent5DisplayProps {
  step: string;
  finalPrompt: string;
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

  // Extract the improved_prompt, exactly like Agent 2
  let extractedPrompt = '';

  try {
    // Try to extract from rawFinalResponse first (preferred source)
    if (rawFinalResponse) {
      let dataToProcess = rawFinalResponse;
      
      // Handle nested JSON string in response field
      if (rawFinalResponse.response && typeof rawFinalResponse.response === 'string') {
        try {
          dataToProcess = JSON.parse(rawFinalResponse.response);
        } catch (e) {
          // If parsing fails, try to use response string directly
          dataToProcess = rawFinalResponse;
        }
      }
      
      // Extract improved_prompt
      if (dataToProcess?.improved_prompt) {
        extractedPrompt = dataToProcess.improved_prompt;
      }
    }
    
    // Fallback to finalPrompt if rawFinalResponse extraction failed
    if (!extractedPrompt && finalPrompt) {
      try {
        const parsed = JSON.parse(finalPrompt);
        if (parsed.improved_prompt) {
          extractedPrompt = parsed.improved_prompt;
        }
      } catch (e) {
        // If finalPrompt is not JSON, use it directly
        extractedPrompt = finalPrompt;
      }
    }

  } catch (error) {
    console.error('Error in extraction logic:', error);
    // Even if extraction fails, try to show something
    extractedPrompt = finalPrompt || 'No prompt available';
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
            Final Optimized Prompt ({extractedPrompt.length} characters)
          </span>
        </div>
        <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed border border-border/50 rounded p-4 bg-background/30 max-h-80 overflow-y-auto">
          {extractedPrompt || 'No final prompt available'}
        </pre>
      </Card>
    </Card>
  );
}