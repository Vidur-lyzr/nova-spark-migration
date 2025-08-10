import { CheckCircle, Circle, Clock, AlertCircle, Zap, FileText, RotateCcw, TestTube, BarChart, Sparkles } from 'lucide-react';
import { type MigrationStep } from '@/hooks/useMigration';

interface MigrationProgressProps {
  currentStep: MigrationStep;
  progress: {
    current: number;
    total: number;
    message: string;
  };
}

const steps = [
  { 
    id: 'generating', 
    name: 'Generate Test Cases', 
    icon: FileText,
    description: 'Creating comprehensive test scenarios'
  },
  { 
    id: 'migrating', 
    name: 'Migrate Prompt', 
    icon: RotateCcw,
    description: 'Converting to Nova format'
  },
  { 
    id: 'testing', 
    name: 'Run Nova Tests', 
    icon: TestTube,
    description: 'Executing on Amazon Nova'
  },
  { 
    id: 'analyzing', 
    name: 'Analyze Results', 
    icon: BarChart,
    description: 'Comparing performance'
  },
  { 
    id: 'optimizing', 
    name: 'Optimize Prompt', 
    icon: Sparkles,
    description: 'Applying optimizations'
  }
];

export function MigrationProgress({ currentStep, progress }: MigrationProgressProps) {
  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (currentStep === 'complete') return stepIndex < steps.length ? 'complete' : 'pending';
    if (currentStep === 'error') return stepIndex < currentIndex ? 'complete' : 'error';
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-accent" />;
      case 'active':
        return <Zap className="w-6 h-6 text-processing pulse-processing" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-destructive" />;
      default:
        return <Circle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold gradient-text">Migration Progress</h3>
        <div className="text-sm text-muted-foreground">
          Step {progress.current} of {progress.total}
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isActive = status === 'active';
          
          return (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'glass-card-bright pulse-processing' 
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(status)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <step.icon className="w-5 h-5 text-muted-foreground" />
                  <h4 className={`font-medium ${isActive ? 'text-processing' : 'text-foreground'}`}>
                    {step.name}
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {isActive && progress.message && (
                  <p className="text-sm text-processing animate-pulse">
                    {progress.message}
                  </p>
                )}
              </div>
              
              {status === 'complete' && (
                <div className="text-xs text-accent font-medium mt-2">
                  ✓ Complete
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentStep === 'complete' && (
        <div className="glass-card-bright p-4 rounded-lg border border-accent/30">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-accent" />
            <span className="text-accent font-medium">Migration Completed Successfully!</span>
          </div>
        </div>
      )}

      {currentStep === 'error' && (
        <div className="glass-card-bright p-4 rounded-lg border border-destructive/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-destructive font-medium">Migration Failed</span>
          </div>
        </div>
      )}
    </div>
  );
}