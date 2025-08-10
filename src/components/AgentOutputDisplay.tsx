import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { TestCase, NovaTestResult, PerformanceGap } from '@/services/lyzrService';
import type { MigrationStep, TestStatus } from '@/hooks/useMigration';

interface AgentOutputDisplayProps {
  step: MigrationStep;
  testCases: TestCase[];
  migratedPrompt: string;
  novaResults: NovaTestResult[];
  performanceGaps: PerformanceGap[];
  finalPrompt: string;
  improvements: string[];
  testStatuses: Record<string, TestStatus>;
}

export function AgentOutputDisplay({
  step,
  testCases = [],
  migratedPrompt = '',
  novaResults = [],
  performanceGaps = [],
  finalPrompt = '',
  improvements = [],
  testStatuses = {}
}: AgentOutputDisplayProps) {
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

  // Safe rendering functions to prevent crashes
  const renderTestCases = () => {
    try {
      if (!Array.isArray(testCases) || testCases.length === 0) {
        return (
          <div className="text-center text-muted-foreground py-8">
            {getStepStatus('generating') === 'active' ? 'Generating test cases...' : 'Waiting for test case generation...'}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {testCases.map((testCase, index) => {
            if (!testCase || typeof testCase !== 'object') return null;
            
            return (
              <Card key={testCase.test_id || index} className="p-4 bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{testCase.test_id || `Test ${index + 1}`}</Badge>
                  <Badge variant={testStatuses[testCase.test_id] === 'complete' ? 'default' : 'secondary'}>
                    {testStatuses[testCase.test_id] || 'pending'}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-primary">Input:</span>
                    <p className="text-muted-foreground mt-1">{testCase.input || 'No input provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-accent">Expected Output:</span>
                    <p className="text-muted-foreground mt-1">{testCase.expected_output || 'No expected output provided'}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error('Error rendering test cases:', error);
      return <div className="text-destructive">Error displaying test cases</div>;
    }
  };

  const renderMigration = () => {
    try {
      return (
        <Card className="p-4 bg-background/50">
          {migratedPrompt ? (
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {migratedPrompt}
            </pre>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {getStepStatus('migrating') === 'active' ? 'Migrating prompt...' : 'Waiting for prompt migration...'}
            </div>
          )}
        </Card>
      );
    } catch (error) {
      console.error('Error rendering migration:', error);
      return <div className="text-destructive">Error displaying migrated prompt</div>;
    }
  };

  const renderNovaResults = () => {
    try {
      if (!Array.isArray(novaResults) || novaResults.length === 0) {
        return (
          <div className="text-center text-muted-foreground py-8">
            {getStepStatus('testing') === 'active' ? 'Running Nova tests...' : 'Waiting for Nova test execution...'}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {novaResults.map((result, index) => {
            if (!result || typeof result !== 'object') return null;
            
            const hasError = result.actual_output?.error || result.actual_output?.output?.includes?.('error');
            
            return (
              <Card key={result.test_id || index} className="p-4 bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{result.test_id || `Test ${index + 1}`}</Badge>
                  <Badge variant={hasError ? "destructive" : "default"}>
                    {hasError ? "Failed" : "Success"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-primary">Input:</span>
                    <p className="text-muted-foreground mt-1">{result.input || 'No input'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-accent">Actual Output:</span>
                    <pre className="text-muted-foreground mt-1 text-xs bg-background/30 p-2 rounded overflow-x-auto">
                      {result.actual_output ? JSON.stringify(result.actual_output, null, 2) : 'No output'}
                    </pre>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error('Error rendering Nova results:', error);
      return <div className="text-destructive">Error displaying Nova test results</div>;
    }
  };

  const renderPerformanceGaps = () => {
    try {
      if (!Array.isArray(performanceGaps) || performanceGaps.length === 0) {
        return (
          <div className="text-center text-muted-foreground py-8">
            {getStepStatus('analyzing') === 'active' ? 'Analyzing performance gaps...' : 'Waiting for performance analysis...'}
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {performanceGaps.map((gap, index) => {
            if (!gap || typeof gap !== 'object') return null;
            
            return (
              <Card key={index} className="p-4 bg-background/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={gap.severity === 'high' ? 'destructive' : gap.severity === 'medium' ? 'default' : 'secondary'}>
                      {gap.severity || 'unknown'} severity
                    </Badge>
                    {(gap as any).frequency && (
                      <span className="text-xs text-muted-foreground">
                        Frequency: {(gap as any).frequency}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-primary">Gap:</span>
                    <p className="text-muted-foreground mt-1">
                      {gap.issue || (gap as any).gap || 'No description available'}
                    </p>
                  </div>
                  {(gap as any).example && (
                    <div>
                      <span className="font-medium text-accent">Example:</span>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {(gap as any).example}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-accent">Suggested Fix:</span>
                    <p className="text-muted-foreground mt-1">
                      {gap.suggestion || (gap as any).suggested_fix || 'No suggestion available'}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error('Error rendering performance gaps:', error);
      return <div className="text-destructive">Error displaying performance analysis</div>;
    }
  };

  const renderFinalPrompt = () => {
    try {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Final Optimized Prompt</h4>
            <Badge variant="secondary">{Array.isArray(improvements) ? improvements.length : 0} optimizations</Badge>
          </div>
          <div className="space-y-4">
            <Card className="p-4 bg-background/50">
              {finalPrompt ? (
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                  {finalPrompt}
                </pre>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {getStepStatus('optimizing') === 'active' ? 'Optimizing prompt...' : 'Waiting for prompt optimization...'}
                </div>
              )}
            </Card>
            
            {Array.isArray(improvements) && improvements.length > 0 && (
              <Card className="p-4 bg-background/50">
                <h5 className="font-medium text-primary mb-2">Applied Optimizations:</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      {improvement || 'Optimization applied'}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering final prompt:', error);
      return <div className="text-destructive">Error displaying final prompt</div>;
    }
  };

  return (
    <Card className="glass-card p-6">
      <h3 className="text-lg font-semibold gradient-text mb-4">Agent Outputs</h3>
      
      <Tabs defaultValue="testcases" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="testcases" className="flex items-center gap-2">
            <StatusIcon status={getStepStatus('generating')} />
            Agent 1
          </TabsTrigger>
          <TabsTrigger value="migration" className="flex items-center gap-2">
            <StatusIcon status={getStepStatus('migrating')} />
            Agent 2
          </TabsTrigger>
          <TabsTrigger value="nova" className="flex items-center gap-2">
            <StatusIcon status={getStepStatus('testing')} />
            Agent 3
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <StatusIcon status={getStepStatus('analyzing')} />
            Agent 4
          </TabsTrigger>
          <TabsTrigger value="final" className="flex items-center gap-2">
            <StatusIcon status={getStepStatus('optimizing')} />
            Agent 5
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testcases" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Test Case Generator</h4>
              <Badge variant="secondary">{Array.isArray(testCases) ? testCases.length : 0} test cases</Badge>
            </div>
            <ScrollArea className="h-96">
              {renderTestCases()}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="migration" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Prompt Migration</h4>
              <Badge variant="outline" className="text-accent border-accent/30">Nova Format</Badge>
            </div>
            <ScrollArea className="h-96">
              {renderMigration()}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="nova" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Nova Test Results</h4>
              <Badge variant="secondary">{Array.isArray(novaResults) ? novaResults.length : 0} results</Badge>
            </div>
            <ScrollArea className="h-96">
              {renderNovaResults()}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Performance Analysis</h4>
              <Badge variant="secondary">{Array.isArray(performanceGaps) ? performanceGaps.length : 0} issues found</Badge>
            </div>
            <ScrollArea className="h-96">
              {renderPerformanceGaps()}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="final" className="mt-4">
          <ScrollArea className="h-96">
            {renderFinalPrompt()}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}