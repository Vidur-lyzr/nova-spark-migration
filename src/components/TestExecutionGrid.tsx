import { Clock, Play, CheckCircle, XCircle } from 'lucide-react';
import { type TestStatus } from '@/hooks/useMigration';

interface TestExecutionGridProps {
  testStatuses: Record<string, TestStatus>;
  totalTests?: number;
}

export function TestExecutionGrid({ testStatuses, totalTests = 20 }: TestExecutionGridProps) {
  const testIds = Array.from({ length: totalTests }, (_, i) => 
    `TC${String(i + 1).padStart(3, '0')}`
  );

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'running':
        return <Play className="w-3 h-3 text-processing" />;
      case 'complete':
        return <CheckCircle className="w-3 h-3 text-accent" />;
      case 'failed':
        return <XCircle className="w-3 h-3 text-destructive" />;
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'running':
        return 'border-processing/30 bg-processing/10 text-processing';
      case 'complete':
        return 'border-accent/30 bg-accent/10 text-accent';
      case 'failed':
        return 'border-destructive/30 bg-destructive/10 text-destructive';
      default:
        return 'border-muted/30 bg-muted/10 text-muted-foreground';
    }
  };

  const completedTests = Object.values(testStatuses).filter(status => status === 'complete').length;
  const runningTests = Object.values(testStatuses).filter(status => status === 'running').length;
  const failedTests = Object.values(testStatuses).filter(status => status === 'failed').length;

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Test Execution</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-accent">{completedTests} Complete</span>
          <span className="text-processing">{runningTests} Running</span>
          <span className="text-destructive">{failedTests} Failed</span>
          <span className="text-muted-foreground">{totalTests - completedTests - runningTests - failedTests} Pending</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {testIds.map((testId) => {
          const status = testStatuses[testId] || 'pending';
          
          return (
            <div
              key={testId}
              className={`
                relative p-3 rounded-lg border transition-all duration-300
                ${getStatusColor(status)}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium">
                  {testId}
                </span>
                {getStatusIcon(status)}
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                {status === 'running' && 'Running...'}
                {status === 'complete' && 'Complete'}
                {status === 'failed' && 'Failed'}
                {status === 'pending' && 'Pending'}
              </div>
              
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{completedTests}/{totalTests}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedTests / totalTests) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}