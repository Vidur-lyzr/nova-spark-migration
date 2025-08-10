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
  rawFinalResponse?: any; // Add raw response prop
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
  rawFinalResponse = null,
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
      if (!migratedPrompt || migratedPrompt.trim() === '') {
        return (
          <div className="text-center text-muted-foreground py-8">
            {getStepStatus('migrating') === 'active' ? 'Migrating prompt...' : 'Waiting for prompt migration...'}
          </div>
        );
      }

      // Extract the actual prompt content if it's in a JSON structure
      let displayPrompt = migratedPrompt;
      try {
        const parsed = JSON.parse(migratedPrompt);
        if (parsed.migrated_prompt) {
          displayPrompt = parsed.migrated_prompt;
        }
      } catch (e) {
        // Not JSON, use as-is
      }

      return (
        <Card className="p-4 bg-background/50">
          <div className="space-y-2 mb-4">
            <span className="text-xs text-muted-foreground">Migrated Prompt ({displayPrompt.length} characters)</span>
          </div>
          <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed border border-border/50 rounded p-4 bg-background/30 max-h-80 overflow-y-auto">
            {displayPrompt}
          </pre>
        </Card>
      );
    } catch (error) {
      console.error('Error rendering migration:', error);
      return (
        <Card className="p-4 bg-background/50">
          <div className="text-destructive">Error displaying migrated prompt</div>
          <div className="text-xs text-muted-foreground mt-2">Raw data: {String(migratedPrompt).substring(0, 200)}...</div>
        </Card>
      );
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
      // Show loading state
      if (!finalPrompt && !rawFinalResponse) {
        return (
          <div className="text-center text-muted-foreground py-8">
            {getStepStatus('optimizing') === 'active' ? 'Optimizing prompt...' : 'Waiting for prompt optimization...'}
          </div>
        );
      }

      // Simple extraction logic - just get the improved_prompt like Agent 2
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

      // Display only the final prompt, similar to Agent 2
      return (
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
      );

    } catch (error) {
      console.error('Critical error in renderFinalPrompt:', error);
      // Emergency fallback - never return blank
      return (
        <Card className="p-4 bg-background/50 border-red-200 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 mb-2">⚠️ Display Error - Showing Raw Data</div>
          
          {rawFinalResponse && (
            <div className="mb-4">
              <div className="text-xs text-muted-foreground mb-2">Raw Response:</div>
              <pre className="text-xs text-muted-foreground bg-background/30 p-3 rounded overflow-auto max-h-40 border border-border/30">
                {JSON.stringify(rawFinalResponse, null, 2)}
              </pre>
            </div>
          )}
          
          {finalPrompt && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Final Prompt String:</div>
              <pre className="text-xs text-muted-foreground bg-background/30 p-3 rounded overflow-auto max-h-40 border border-border/30">
                {String(finalPrompt)}
              </pre>
            </div>
          )}
          
          {!rawFinalResponse && !finalPrompt && (
            <div className="text-muted-foreground">No data available to display</div>
          )}
        </Card>
      );
    }
  };

  // Add debugging to track when component renders
  console.log('AgentOutputDisplay rendering with step:', step);
  console.log('AgentOutputDisplay rawFinalResponse available:', !!rawFinalResponse);

  return (
    <Card className="glass-card p-6">
      <h3 className="text-lg font-semibold gradient-text mb-4">Agent Outputs</h3>
      
      <Tabs defaultValue="testcases" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
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
        </TabsList>

        <TabsContent value="testcases" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Test Case Generator</h4>
              <Badge variant="secondary">{Array.isArray(testCases) ? testCases.length : 0} test cases</Badge>
            </div>
            <ScrollArea className="h-96">
              {(() => {
                try {
                  return renderTestCases();
                } catch (error) {
                  console.error('Error in renderTestCases:', error);
                  return <div className="text-destructive">Error loading test cases</div>;
                }
              })()}
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
              {(() => {
                try {
                  return renderMigration();
                } catch (error) {
                  console.error('Error in renderMigration:', error);
                  return <div className="text-destructive">Error loading migration</div>;
                }
              })()}
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
              {(() => {
                try {
                  return renderNovaResults();
                } catch (error) {
                  console.error('Error in renderNovaResults:', error);
                  return <div className="text-destructive">Error loading Nova results</div>;
                }
              })()}
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
              {(() => {
                try {
                  return renderPerformanceGaps();
                } catch (error) {
                  console.error('Error in renderPerformanceGaps:', error);
                  return <div className="text-destructive">Error loading performance analysis</div>;
                }
              })()}
            </ScrollArea>
          </div>
        </TabsContent>

      </Tabs>
    </Card>
  );
}