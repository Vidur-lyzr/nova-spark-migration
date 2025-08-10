import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { TestCase, NovaTestResult, PerformanceGap } from '@/services/lyzrService';
import type { MigrationStep, TestStatus } from '@/hooks/useMigration';
import { useState, useEffect } from 'react';

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
  const [hasTabsError, setHasTabsError] = useState(false);

  // Reset error state when step changes
  useEffect(() => {
    setHasTabsError(false);
  }, [step]);
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

      // Robust extraction logic for Agent 5 response
      let extractedPrompt = '';
      let extractedChanges: string[] = [];
      let showRawFallback = false;

      try {
        // Try to extract from rawFinalResponse first (preferred source)
        if (rawFinalResponse) {
          console.log('Processing raw final response:', rawFinalResponse);
          
          let dataToProcess = rawFinalResponse;
          
          // Handle nested JSON string in response field
          if (rawFinalResponse.response && typeof rawFinalResponse.response === 'string') {
            try {
              // Parse the JSON string (with newlines)
              dataToProcess = JSON.parse(rawFinalResponse.response);
              console.log('Successfully parsed nested response:', dataToProcess);
            } catch (e) {
              console.warn('Failed to parse nested response JSON:', e.message);
              showRawFallback = true;
            }
          }
          
          // Extract improved_prompt
          if (dataToProcess?.improved_prompt) {
            extractedPrompt = dataToProcess.improved_prompt;
            console.log('✅ Extracted improved_prompt from raw response');
          }
          
          // Extract changes_applied
          if (dataToProcess?.changes_applied && Array.isArray(dataToProcess.changes_applied)) {
            extractedChanges = dataToProcess.changes_applied.map((change: any) => {
              if (typeof change === 'string') return change;
              if (typeof change === 'object' && change.modification) {
                return change.modification;
              }
              if (typeof change === 'object' && change.expected_impact) {
                return change.expected_impact;
              }
              return JSON.stringify(change).substring(0, 150) + '...';
            });
            console.log('✅ Extracted changes_applied from raw response:', extractedChanges.length);
          }
        }
        
        // Fallback to finalPrompt if rawFinalResponse extraction failed
        if (!extractedPrompt && finalPrompt) {
          console.log('Falling back to finalPrompt extraction');
          try {
            const parsed = JSON.parse(finalPrompt);
            if (parsed.improved_prompt) {
              extractedPrompt = parsed.improved_prompt;
            }
            if (parsed.changes_applied && Array.isArray(parsed.changes_applied)) {
              extractedChanges = parsed.changes_applied.map((change: any) => {
                if (typeof change === 'string') return change;
                if (typeof change === 'object' && change.modification) {
                  return change.modification;
                }
                return JSON.stringify(change).substring(0, 150) + '...';
              });
            }
          } catch (e) {
            // If finalPrompt is not JSON, use it directly
            extractedPrompt = finalPrompt;
          }
        }
        
        // Use improvements array as final fallback
        if (extractedChanges.length === 0 && Array.isArray(improvements)) {
          extractedChanges = improvements;
        }

      } catch (error) {
        console.error('Error in extraction logic:', error);
        showRawFallback = true;
        // Even if extraction fails, try to show something
        extractedPrompt = finalPrompt || 'No prompt available';
        extractedChanges = Array.isArray(improvements) ? improvements : [];
      }

      // Always show content, never blank screen
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Final Optimized Prompt</h4>
            <Badge variant="secondary">{extractedChanges.length} optimizations</Badge>
          </div>
          
          {/* Main content - Final Prompt */}
          <Card className="p-4 bg-background/50">
            <div className="space-y-2 mb-4">
              <span className="text-xs text-muted-foreground">
                Final Prompt ({extractedPrompt.length} characters)
              </span>
            </div>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed border border-border/50 rounded p-4 bg-background/30 max-h-80 overflow-y-auto">
              {extractedPrompt || 'No final prompt available'}
            </pre>
          </Card>
          
          {/* Applied Optimizations */}
          {extractedChanges.length > 0 && (
            <Card className="p-4 bg-background/50">
              <h5 className="font-medium text-primary mb-3">Applied Optimizations:</h5>
              <div className="space-y-3">
                {extractedChanges.map((change, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/30 border-l-2 border-accent/30">
                    <span className="text-accent font-bold text-lg">•</span>
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {change || `Optimization ${index + 1} applied`}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* Show raw response as debugging info if extraction had issues */}
          {showRawFallback && rawFinalResponse && (
            <Card className="p-4 bg-background/50 border-orange-200 dark:border-orange-800">
              <div className="space-y-2 mb-4">
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  ⚠️ Extraction had issues - Raw Agent 5 Response for debugging:
                </span>
              </div>
              <details className="cursor-pointer">
                <summary className="text-sm text-muted-foreground hover:text-foreground">
                  Click to view raw response
                </summary>
                <pre className="text-xs text-muted-foreground bg-background/30 p-3 rounded overflow-auto max-h-60 border border-border/30 mt-2">
                  {JSON.stringify(rawFinalResponse, null, 2)}
                </pre>
              </details>
            </Card>
          )}
        </div>
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

  // Create emergency fallback component that doesn't use Tabs
  const EmergencyFallback = () => (
    <Card className="glass-card p-6 border-red-200 dark:border-red-800">
      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
        ⚠️ Emergency Display Mode - Tabs Error
      </h3>
      
      <div className="space-y-6">
        {/* Always show Agent 5 output first if available */}
        {rawFinalResponse && (
          <Card className="p-4 bg-background/50">
            <h4 className="font-medium text-primary mb-3">🤖 Agent 5 - Final Optimized Prompt</h4>
            
            {/* Show extracted content */}
            {(() => {
              try {
                let dataToProcess = rawFinalResponse;
                
                if (rawFinalResponse.response && typeof rawFinalResponse.response === 'string') {
                  try {
                    dataToProcess = JSON.parse(rawFinalResponse.response);
                  } catch (e) {
                    console.warn('Could not parse nested response');
                  }
                }
                
                if (dataToProcess?.improved_prompt) {
                  return (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-muted-foreground mb-2 block">
                          Final Prompt ({dataToProcess.improved_prompt.length} characters)
                        </span>
                        <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed border border-border/50 rounded p-4 bg-background/30 max-h-80 overflow-y-auto">
                          {dataToProcess.improved_prompt}
                        </pre>
                      </div>
                      
                      {dataToProcess.changes_applied && Array.isArray(dataToProcess.changes_applied) && (
                        <div>
                          <h5 className="font-medium text-primary mb-3">Applied Optimizations:</h5>
                          <div className="space-y-2">
                            {dataToProcess.changes_applied.map((change: any, index: number) => (
                              <div key={index} className="p-2 rounded bg-background/30 text-sm">
                                • {typeof change === 'string' ? change : change?.modification || JSON.stringify(change).substring(0, 100)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                return null;
              } catch (e) {
                return null;
              }
            })()}
            
            {/* Always show complete raw response */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                View Complete Raw Agent 5 Response
              </summary>
              <pre className="text-xs text-muted-foreground bg-background/30 p-3 rounded overflow-auto max-h-60 border border-border/30 mt-2">
                {JSON.stringify(rawFinalResponse, null, 2)}
              </pre>
            </details>
          </Card>
        )}
        
        {/* Show final prompt if rawFinalResponse failed */}
        {!rawFinalResponse && finalPrompt && (
          <Card className="p-4 bg-background/50">
            <h4 className="font-medium text-primary mb-3">🤖 Agent 5 - Final Prompt</h4>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed border border-border/50 rounded p-4 bg-background/30 max-h-80 overflow-y-auto">
              {finalPrompt}
            </pre>
          </Card>
        )}
        
        {/* Show migrated prompt */}
        {migratedPrompt && (
          <Card className="p-4 bg-background/50">
            <h4 className="font-medium text-primary mb-3">🤖 Agent 2 - Migrated Prompt</h4>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed border border-border/50 rounded p-4 bg-background/30 max-h-60 overflow-y-auto">
              {migratedPrompt}
            </pre>
          </Card>
        )}
        
        {/* Show other data if available */}
        {testCases.length > 0 && (
          <Card className="p-4 bg-background/50">
            <h4 className="font-medium text-primary mb-3">🤖 Agent 1 - Test Cases ({testCases.length})</h4>
            <div className="text-sm text-muted-foreground">Test cases generated successfully</div>
          </Card>
        )}
        
        {novaResults.length > 0 && (
          <Card className="p-4 bg-background/50">
            <h4 className="font-medium text-primary mb-3">🤖 Agent 3 - Nova Results ({novaResults.length})</h4>
            <div className="text-sm text-muted-foreground">Nova tests completed</div>
          </Card>
        )}
        
        {performanceGaps.length > 0 && (
          <Card className="p-4 bg-background/50">
            <h4 className="font-medium text-primary mb-3">🤖 Agent 4 - Performance Analysis ({performanceGaps.length} gaps)</h4>
            <div className="text-sm text-muted-foreground">Performance gaps identified</div>
          </Card>
        )}
      </div>
    </Card>
  );

  // Try to render normal Tabs, fallback to emergency mode if it fails
  try {
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
                {(() => {
                  try {
                    return renderTestCases();
                  } catch (error) {
                    console.error('Error in renderTestCases:', error);
                    setHasTabsError(true);
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
                    setHasTabsError(true);
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
                    setHasTabsError(true);
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
                    setHasTabsError(true);
                    return <div className="text-destructive">Error loading performance analysis</div>;
                  }
                })()}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="final" className="mt-4">
            <ScrollArea className="h-96">
              {(() => {
                try {
                  console.log('About to render final prompt, rawFinalResponse:', !!rawFinalResponse);
                  const result = renderFinalPrompt();
                  console.log('Successfully rendered final prompt');
                  return result;
                } catch (error) {
                  console.error('CRITICAL ERROR in renderFinalPrompt:', error);
                  setHasTabsError(true);
                  return (
                    <div className="text-destructive p-4">
                      <div>Critical error in final prompt display - switching to emergency mode</div>
                      <div className="text-xs mt-2">Check console for details</div>
                      {rawFinalResponse && (
                        <pre className="text-xs mt-2 bg-background/30 p-2 rounded overflow-auto max-h-20">
                          {JSON.stringify(rawFinalResponse, null, 2).substring(0, 200)}...
                        </pre>
                      )}
                    </div>
                  );
                }
              })()}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    );
  } catch (error) {
    console.error('TABS COMPONENT ERROR - Switching to emergency fallback:', error);
    return <EmergencyFallback />;
  }
}