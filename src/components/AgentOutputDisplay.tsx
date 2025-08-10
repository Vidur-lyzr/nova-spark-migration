import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { type TestCase, type NovaTestResult, type PerformanceGap } from '@/services/lyzrService';

interface AgentOutputDisplayProps {
  step: string;
  testCases: TestCase[];
  migratedPrompt: string;
  novaResults: NovaTestResult[];
  performanceGaps: PerformanceGap[];
  finalPrompt: string;
  improvements: string[];
}

export function AgentOutputDisplay({
  step,
  testCases,
  migratedPrompt,
  novaResults,
  performanceGaps,
  finalPrompt,
  improvements
}: AgentOutputDisplayProps) {
  const getStepStatus = (stepName: string) => {
    const currentSteps = ['generating', 'migrating', 'testing', 'analyzing', 'optimizing'];
    const currentIndex = currentSteps.indexOf(step);
    const stepIndex = currentSteps.indexOf(stepName);
    
    if (stepIndex < currentIndex || step === 'complete') return 'complete';
    if (stepIndex === currentIndex) return 'active';
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
              <Badge variant="secondary">{testCases.length} test cases</Badge>
            </div>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {testCases.map((testCase) => (
                  <Card key={testCase.test_id} className="p-4 bg-background/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{testCase.test_id}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-primary">Input:</span>
                        <p className="text-muted-foreground mt-1">{testCase.input}</p>
                      </div>
                      <div>
                        <span className="font-medium text-accent">Expected:</span>
                        <p className="text-muted-foreground mt-1">{testCase.expected_output}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="migration" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Prompt Migration</h4>
              <Badge variant="secondary">Nova Format</Badge>
            </div>
            <ScrollArea className="h-96">
              <Card className="p-4 bg-background/50">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {migratedPrompt || 'Waiting for migration...'}
                </pre>
              </Card>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="nova" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Nova Test Results</h4>
              <Badge variant="secondary">{novaResults.length} results</Badge>
            </div>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {novaResults.map((result) => (
                  <Card key={result.test_id} className="p-4 bg-background/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{result.test_id}</Badge>
                      <Badge variant={result.actual_output?.error ? "destructive" : "default"}>
                        {result.actual_output?.error ? "Failed" : "Success"}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-primary">Input:</span>
                        <p className="text-muted-foreground mt-1">{result.input}</p>
                      </div>
                      <div>
                        <span className="font-medium text-accent">Nova Output:</span>
                        <p className="text-muted-foreground mt-1">
                          {result.actual_output?.error 
                            ? `Error: ${result.actual_output.error}`
                            : JSON.stringify(result.actual_output, null, 2)
                          }
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
                {novaResults.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Waiting for Nova test execution...
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Performance Analysis</h4>
              <Badge variant="secondary">{performanceGaps.length} gaps identified</Badge>
            </div>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {performanceGaps.map((gap, index) => (
                  <Card key={index} className="p-4 bg-background/50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={gap?.severity === 'high' ? 'destructive' : gap?.severity === 'medium' ? 'default' : 'secondary'}>
                          {gap?.severity || 'unknown'} severity
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-primary">Issue:</span>
                        <p className="text-muted-foreground mt-1">{gap?.issue || 'No issue description available'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-accent">Suggestion:</span>
                        <p className="text-muted-foreground mt-1">{gap?.suggestion || 'No suggestion available'}</p>
                      </div>
                    </div>
                  </Card>
                ))}
                {performanceGaps.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Waiting for performance analysis...
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="final" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Final Optimized Prompt</h4>
              <Badge variant="secondary">{improvements?.length || 0} optimizations</Badge>
            </div>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                <Card className="p-4 bg-background/50">
                  <h5 className="font-medium text-accent mb-2">Final Prompt:</h5>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {finalPrompt || 'Waiting for optimization...'}
                  </pre>
                </Card>
                
                {improvements && improvements.length > 0 && (
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
                
                {(!improvements || improvements.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    Waiting for prompt optimization...
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}