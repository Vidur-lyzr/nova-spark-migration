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
        return <Play className="w-3 h-3 text-processing running-test" />;
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
        return 'border-processing bg-processing/20';
      case 'complete':
        return 'border-accent bg-accent/20';
      case 'failed':
        return 'border-destructive bg-destructive/20';
      default:
        return 'border-muted bg-muted/20';
    }
  };

  const completedTests = Object.values(testStatuses).filter(status => status === 'complete').length;
  const runningTests = Object.values(testStatuses).filter(status => status === 'running').length;
  const failedTests = Object.values(testStatuses).filter(status => status === 'failed').length;

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold gradient-text">Test Execution</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-accent">✓ {completedTests}</span>
          <span className="text-processing">▶ {runningTests}</span>
          <span className="text-destructive">✗ {failedTests}</span>
          <span className="text-muted-foreground">⏳ {totalTests - completedTests - runningTests - failedTests}</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {testIds.map((testId) => {
          const status = testStatuses[testId] || 'pending';
          
          return (
            <div
              key={testId}
              className={`
                relative p-3 rounded-lg border transition-all duration-300 hover-lift
                ${getStatusColor(status)}
                ${status === 'running' ? 'pulse-processing' : ''}
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
              
              {status === 'running' && (
                <div className="absolute inset-0 bg-processing/10 rounded-lg animate-pulse" />
              )}
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