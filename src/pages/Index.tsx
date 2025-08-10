import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Zap, Target, BarChart3 } from 'lucide-react';
import { ProviderSelector } from '@/components/ProviderSelector';
import { ModelSelector } from '@/components/ModelSelector';
import { PromptInput } from '@/components/PromptInput';
import { MigrationProgress } from '@/components/MigrationProgress';
import { TestExecutionGrid } from '@/components/TestExecutionGrid';
import { LogConsole } from '@/components/LogConsole';
import { PromptComparison } from '@/components/PromptComparison';
import { AgentOutputDisplay } from '@/components/AgentOutputDisplay';
import { Header } from '@/components/Header';
import { useMigration } from '@/hooks/useMigration';

const Index = () => {
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [prompt, setPrompt] = useState('');
  
  const { state, runMigration, reset } = useMigration();

  const canStartMigration = provider && model && prompt.trim().length > 0;
  const isInputStage = state.step === 'input' || state.step === 'error';
  const isProcessingStage = ['generating', 'migrating', 'testing', 'analyzing', 'optimizing'].includes(state.step);
  const isCompleteStage = state.step === 'complete';

  const handleStartMigration = () => {
    if (!canStartMigration) return;
    
    runMigration({
      provider,
      model,
      originalPrompt: prompt
    });
  };

  const handleDownloadReport = () => {
    const report = {
      migration: {
        timestamp: new Date().toISOString(),
        source: { provider, model },
        target: 'Amazon Nova'
      },
      prompts: {
        original: prompt,
        migrated: state.migratedPrompt,
        final: state.finalPrompt
      },
      results: {
        testCases: state.testCases.length,
        performanceGaps: state.performanceGaps.length,
        improvements: state.improvements
      },
      logs: state.logs
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-migration-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isInputStage) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-card-bright">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Reduce your LLM costs by 7×</span>
            </div>
            
            <h1 className="text-4xl font-bold text-foreground">
              Migrate Your AI Agent to Nova
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automatically convert and optimize your prompts from GPT-4o, Claude, or Gemini 
              to work perfectly with Amazon Nova using our 5-agent pipeline.
            </p>
          </div>


          {/* Input Form */}
          <Card className="glass-card p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <ProviderSelector value={provider} onChange={setProvider} />
              <ModelSelector provider={provider} value={model} onChange={setModel} />
            </div>
            
            <PromptInput value={prompt} onChange={setPrompt} />

            {state.error && (
              <div className="glass-card-bright p-4 rounded-lg border border-destructive/30 animate-slide-in-up">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-destructive font-medium">Migration Failed</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{state.error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={reset}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="text-sm text-muted-foreground">
                Migration takes approximately 2-3 minutes
              </div>
              
              <Button
                onClick={handleStartMigration}
                disabled={!canStartMigration || state.isProcessing}
                className="flex items-center gap-2 hover-lift"
                size="lg"
              >
                Start Migration
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isProcessingStage) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Migration in Progress</h1>
            <p className="text-muted-foreground">
              Migrating from {provider} {model} to Amazon Nova
            </p>
          </div>

          {/* Progress Overview */}
          <div className="grid lg:grid-cols-2 gap-6">
            <MigrationProgress currentStep={state.step} progress={state.progress} />
            <LogConsole logs={state.logs} />
          </div>

          {/* Test Execution Grid - Only show during testing phase */}
          {state.step === 'testing' && (
            <TestExecutionGrid testStatuses={state.testStatuses} />
          )}

          {/* Agent Outputs Display */}
              <AgentOutputDisplay
                step={state.step}
                testCases={state.testCases}
                migratedPrompt={state.migratedPrompt}
                novaResults={state.novaResults}
                performanceGaps={state.performanceGaps}
                finalPrompt={state.finalPrompt}
                improvements={state.improvements}
                rawFinalResponse={state.rawFinalResponse}
                testStatuses={state.testStatuses}
              />
        </div>
      </div>
    );
  }

  if (isCompleteStage) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-card-bright border border-accent/30">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-accent">Migration Complete</span>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground">
              Successfully Migrated to Amazon Nova
            </h1>
            
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{state.testCases.length}</div>
                <div className="text-muted-foreground">Tests Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{state.performanceGaps.length}</div>
                <div className="text-muted-foreground">Issues Identified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{state.improvements.length}</div>
                <div className="text-muted-foreground">Optimizations Applied</div>
              </div>
            </div>
          </div>

          {/* Results */}
          <PromptComparison
            originalPrompt={prompt}
            finalPrompt={state.finalPrompt}
            optimizations={state.improvements}
          />

          {/* Agent Outputs - Persist after completion */}
              <AgentOutputDisplay
                step={state.step}
                testCases={state.testCases}
                migratedPrompt={state.migratedPrompt}
                novaResults={state.novaResults}
                performanceGaps={state.performanceGaps}
                finalPrompt={state.finalPrompt}
                improvements={state.improvements}
                rawFinalResponse={state.rawFinalResponse}
                testStatuses={state.testStatuses}
              />

          {/* Final Actions */}
          <div className="text-center space-y-4">
            <Button
              onClick={reset}
              variant="outline"
              size="lg"
              className="hover-lift"
            >
              Start New Migration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;