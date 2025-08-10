import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { TestCase, NovaTestResult, PerformanceGap } from '@/services/lyzrService';
import type { MigrationStep, TestStatus } from '@/hooks/useMigration';

interface SafeAgentDisplayProps {
  step: MigrationStep;
  testCases: TestCase[];
  migratedPrompt: string;
  novaResults: NovaTestResult[];
  performanceGaps: PerformanceGap[];
  finalPrompt: string;
  improvements: string[];
  rawFinalResponse?: any;
  testStatuses: Record<string, TestStatus>;
}

export function SafeAgentDisplay({
  step,
  testCases = [],
  migratedPrompt = '',
  novaResults = [],
  performanceGaps = [],
  finalPrompt = '',
  improvements = [],
  rawFinalResponse = null,
  testStatuses = {}
}: SafeAgentDisplayProps) {
  
  console.log('SafeAgentDisplay - rawFinalResponse:', rawFinalResponse);

  // Extract Agent 5 data safely
  const extractAgent5Data = () => {
    if (!rawFinalResponse) return null;
    
    try {
      let dataToProcess = rawFinalResponse;
      
      // Handle nested JSON string in response field
      if (rawFinalResponse.response && typeof rawFinalResponse.response === 'string') {
        try {
          dataToProcess = JSON.parse(rawFinalResponse.response);
        } catch (e) {
          console.warn('Could not parse nested response, using raw');
        }
      }
      
      return {
        improvedPrompt: dataToProcess?.improved_prompt || '',
        changesApplied: dataToProcess?.changes_applied || [],
        rawData: rawFinalResponse
      };
    } catch (error) {
      console.error('Error extracting Agent 5 data:', error);
      return { improvedPrompt: '', changesApplied: [], rawData: rawFinalResponse };
    }
  };

  const agent5Data = extractAgent5Data();

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold gradient-text mb-4">🎉 Migration Complete!</h3>
        
        {/* Agent 5 - Final Optimized Prompt */}
        {agent5Data && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-green-700 dark:text-green-300">🤖 Agent 5 - Final Optimized Prompt</h4>
              <Badge variant="default" className="bg-green-500">
                {agent5Data.changesApplied?.length || 0} optimizations applied
              </Badge>
            </div>

            {/* Final Prompt Display */}
            {agent5Data.improvedPrompt && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-primary">✅ Your Optimized Nova Prompt</h5>
                  <span className="text-xs text-muted-foreground">
                    {agent5Data.improvedPrompt.length} characters
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-green-200 dark:border-green-800 p-4">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-96">
{agent5Data.improvedPrompt}
                  </pre>
                </div>
              </div>
            )}

            {/* Applied Optimizations */}
            {agent5Data.changesApplied && agent5Data.changesApplied.length > 0 && (
              <div className="mb-6">
                <h5 className="font-semibold text-primary mb-3">🔧 Applied Optimizations:</h5>
                <div className="space-y-3">
                  {agent5Data.changesApplied.map((change: any, index: number) => (
                    <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 dark:text-green-400 font-bold text-lg">✓</span>
                        <div className="flex-1">
                          <p className="text-sm text-foreground leading-relaxed">
                            {typeof change === 'string' 
                              ? change 
                              : change?.modification || change?.expected_impact || JSON.stringify(change).substring(0, 150)
                            }
                          </p>
                          {change?.expected_impact && typeof change === 'object' && change.modification && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <strong>Impact:</strong> {change.expected_impact}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Response (Collapsible) */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                🔍 View Complete Raw Agent 5 Response
              </summary>
              <div className="mt-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
                <pre className="text-xs text-muted-foreground overflow-auto max-h-60">
{JSON.stringify(agent5Data.rawData, null, 2)}
                </pre>
              </div>
            </details>
          </Card>
        )}

        {/* Fallback if no Agent 5 data */}
        {!agent5Data && finalPrompt && (
          <Card className="p-6 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <h4 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-4">⚠️ Agent 5 - Final Prompt (Fallback)</h4>
            <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-96">
{finalPrompt}
              </pre>
            </div>
          </Card>
        )}

        {/* Other Agents Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Agent 1 */}
          <Card className="p-4 bg-background/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <h5 className="font-medium">Agent 1</h5>
            </div>
            <p className="text-sm text-muted-foreground">Test Generator</p>
            <p className="text-xs text-muted-foreground mt-1">
              {testCases.length} test cases created
            </p>
          </Card>

          {/* Agent 2 */}
          <Card className="p-4 bg-background/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <h5 className="font-medium">Agent 2</h5>
            </div>
            <p className="text-sm text-muted-foreground">Prompt Migrator</p>
            <p className="text-xs text-muted-foreground mt-1">
              {migratedPrompt ? 'Migrated to Nova format' : 'Migration pending'}
            </p>
          </Card>

          {/* Agent 3 */}
          <Card className="p-4 bg-background/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <h5 className="font-medium">Agent 3</h5>
            </div>
            <p className="text-sm text-muted-foreground">Nova Executor</p>
            <p className="text-xs text-muted-foreground mt-1">
              {novaResults.length} tests executed
            </p>
          </Card>

          {/* Agent 4 */}
          <Card className="p-4 bg-background/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <h5 className="font-medium">Agent 4</h5>
            </div>
            <p className="text-sm text-muted-foreground">Performance Analyzer</p>
            <p className="text-xs text-muted-foreground mt-1">
              {performanceGaps.length} improvements identified
            </p>
          </Card>
        </div>

        {/* Migration Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
            🎯 Migration Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p className="font-medium text-green-600 dark:text-green-400">Complete</p>
            </div>
            <div>
              <span className="text-muted-foreground">Test Cases:</span>
              <p className="font-medium">{testCases.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tests Run:</span>
              <p className="font-medium">{novaResults.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Optimizations:</span>
              <p className="font-medium">{agent5Data?.changesApplied?.length || improvements.length}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
