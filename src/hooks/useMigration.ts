import { useState, useCallback } from 'react';
import { lyzrService, type MigrationInput, type TestCase, type NovaTestResult, type PerformanceGap } from '@/services/lyzrService';

export type MigrationStep = 'input' | 'generating' | 'migrating' | 'testing' | 'analyzing' | 'optimizing' | 'complete' | 'error';

export type TestStatus = 'pending' | 'running' | 'complete' | 'failed';

export interface MigrationState {
  step: MigrationStep;
  isProcessing: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
  };
  testCases: TestCase[];
  migratedPrompt: string;
  novaResults: NovaTestResult[];
  performanceGaps: PerformanceGap[];
  finalPrompt: string;
  improvements: string[];
  testStatuses: Record<string, TestStatus>;
  logs: string[];
  error?: string;
}

const initialState: MigrationState = {
  step: 'input',
  isProcessing: false,
  progress: { current: 0, total: 5, message: '' },
  testCases: [],
  migratedPrompt: '',
  novaResults: [],
  performanceGaps: [],
  finalPrompt: '',
  improvements: [],
  testStatuses: {},
  logs: [],
};

export function useMigration() {
  const [state, setState] = useState<MigrationState>(initialState);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, `[${timestamp}] ${message}`]
    }));
  }, []);

  const updateTestStatus = useCallback((testId: string, status: TestStatus) => {
    setState(prev => ({
      ...prev,
      testStatuses: {
        ...prev.testStatuses,
        [testId]: status
      }
    }));
  }, []);

  const runMigration = useCallback(async (input: MigrationInput) => {
    let currentMigratedPrompt = ''; // Track migrated prompt throughout the process
    
    try {
      setState(prev => ({ ...prev, isProcessing: true, error: undefined, logs: [] }));

      // Step 1: Generate Test Cases
      setState(prev => ({ 
        ...prev, 
        step: 'generating',
        progress: { current: 1, total: 5, message: 'Generating test cases...' }
      }));
      addLog('Starting test case generation...');

      const testCases = await lyzrService.generateTestCases(input);
      addLog(`Generated ${testCases.length} test cases`);

      // Initialize test statuses
      const testStatuses: Record<string, TestStatus> = {};
      testCases.forEach(tc => {
        testStatuses[tc.test_id] = 'pending';
      });

      setState(prev => ({
        ...prev,
        testCases,
        testStatuses,
        progress: { current: 1, total: 5, message: `Generated ${testCases.length} test cases` }
      }));

      // Step 2: Migrate Prompt
      setState(prev => ({ 
        ...prev, 
        step: 'migrating',
        progress: { current: 2, total: 5, message: 'Migrating prompt to Nova format...' }
      }));
      addLog('Migrating prompt to Amazon Nova format...');

      const migratedPrompt = await lyzrService.migratePrompt(input);
      currentMigratedPrompt = migratedPrompt; // Store in closure variable
      
      addLog('Prompt successfully migrated to Nova format');
      addLog(`Migrated prompt length: ${migratedPrompt.length} characters`);
      addLog(`Migrated prompt preview: ${migratedPrompt.substring(0, 200)}...`);

      setState(prev => ({
        ...prev,
        migratedPrompt,
        progress: { current: 2, total: 5, message: 'Prompt migrated successfully' }
      }));

      // Step 3: Execute Tests on Nova
      setState(prev => ({ 
        ...prev, 
        step: 'testing',
        progress: { current: 3, total: 5, message: 'Running tests on Amazon Nova...' }
      }));
      addLog('Starting Nova test execution...');

      const novaResults: NovaTestResult[] = [];

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        updateTestStatus(testCase.test_id, 'running');
        setState(prev => ({
          ...prev,
          progress: { 
            current: 3, 
            total: 5, 
            message: `Running test ${i + 1}/${testCases.length}: ${testCase.test_id}` 
          }
        }));
        addLog(`Executing test ${testCase.test_id}...`);

        try {
          // Call Agent 3 with migrated prompt and individual test case
          const result = await lyzrService.executeNovaTest(currentMigratedPrompt, testCase);
          novaResults.push({
            test_id: testCase.test_id,
            input: testCase.input,
            actual_output: result
          });
          
          updateTestStatus(testCase.test_id, 'complete');
          addLog(`Test ${testCase.test_id} completed: ${JSON.stringify(result).substring(0, 100)}...`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          novaResults.push({
            test_id: testCase.test_id,
            input: testCase.input,
            actual_output: { error: errorMsg }
          });
          updateTestStatus(testCase.test_id, 'failed');
          addLog(`Test ${testCase.test_id} failed: ${errorMsg}`);
        }
      }

      setState(prev => ({
        ...prev,
        novaResults,
        progress: { current: 3, total: 5, message: 'All tests completed' }
      }));

      // Step 4: Analyze Results
      setState(prev => ({ 
        ...prev, 
        step: 'analyzing',
        progress: { current: 4, total: 5, message: 'Analyzing test results...' }
      }));
      addLog('Analyzing performance gaps...');

      const performanceGaps = await lyzrService.compareOutputs(testCases, novaResults);
      addLog(`Identified ${performanceGaps.length} areas for improvement`);

      setState(prev => ({
        ...prev,
        performanceGaps,
        progress: { current: 4, total: 5, message: `Found ${performanceGaps.length} improvement opportunities` }
      }));

      // Step 5: Improve Prompt
      setState(prev => ({ 
        ...prev, 
        step: 'optimizing',
        progress: { current: 5, total: 5, message: 'Optimizing prompt...' }
      }));
      addLog('Optimizing prompt based on analysis...');
      addLog(`Current migrated prompt for Agent 5: ${migratedPrompt ? 'FOUND' : 'MISSING'}`);
      addLog(`Sending to Agent 5 - Current prompt length: ${migratedPrompt?.length || 0}`);
      if (migratedPrompt) {
        addLog(`Current prompt preview: ${migratedPrompt.substring(0, 200)}...`);
      } else {
        addLog('❌ ERROR: migratedPrompt is empty - Agent 5 will receive empty current_prompt!');
      }
      addLog(`Number of performance gaps: ${performanceGaps.length}`);

      // CRITICAL: Use the tracked migrated prompt
      if (!currentMigratedPrompt) {
        addLog('❌ CRITICAL ERROR: No migrated prompt available for Agent 5!');
        throw new Error('Missing migrated prompt for optimization');
      }
      
      const improvement = await lyzrService.improvePrompt(currentMigratedPrompt, performanceGaps);
      addLog('Prompt optimization completed');
      addLog(`Final prompt: ${improvement.improved_prompt.substring(0, 200)}...`);
      addLog(`Applied ${improvement.changes_applied.length} improvements`);

      setState(prev => ({
        ...prev,
        finalPrompt: improvement.improved_prompt,
        improvements: improvement.changes_applied,
        step: 'complete',
        isProcessing: false,
        progress: { current: 5, total: 5, message: 'Migration completed successfully!' }
      }));

      addLog('🎉 Migration completed successfully!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addLog(`❌ Migration failed: ${errorMessage}`);
      
      setState(prev => ({
        ...prev,
        step: 'error',
        isProcessing: false,
        error: errorMessage
      }));
    }
  }, [addLog, updateTestStatus]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    runMigration,
    reset
  };
}