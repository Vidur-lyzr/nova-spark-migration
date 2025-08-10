// Lyzr Agent Service for Amazon Nova Migration
export interface LyzrAgentResponse {
  response?: string;
  message?: string;
  [key: string]: any;
}

export interface TestCase {
  test_id: string;
  input: string;
  expected_output: string;
}

export interface NovaTestResult {
  test_id: string;
  input: string;
  actual_output: any;
}

// Raw response from Agent 4
export interface RawPerformanceGap {
  gap: string;
  example: string;
  frequency: string;
  suggested_fix: string;
}

// Transformed interface for UI
export interface PerformanceGap {
  issue: string;
  severity: string;
  suggestion: string;
}

export interface MigrationInput {
  provider: string;
  model: string;
  originalPrompt: string;
}

class LyzrAgentService {
  private apiKey = 'sk-default-J8ugcNHPU0tBvD6j0vrIu7GfS5dUWRPX';
  private baseUrl = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';
  
  private agentIds = {
    testGenerator: '689862f59522614a7f5f92bd',
    promptMigrator: '689864da9522614a7f5f92c1',
    novaExecutor: '68986ee934cb54cda545ceba',
    outputComparator: '6898728a34cb54cda545cec1',
    promptImprover: '6898749c34cb54cda545cec2'
  };

  async callAgent(agentId: string, message: any): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          user_id: "migration-tool@demo.com",
          agent_id: agentId,
          session_id: `${agentId}-${Date.now()}`,
          message: typeof message === 'string' ? message : JSON.stringify(message)
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse JSON response - handle markdown-wrapped JSON
      try {
        let responseText = data.response || data.message || '{}';
        
        console.log('Raw API response text:', responseText);
        
        // Remove markdown code blocks if present
        if (responseText.includes('```json')) {
          responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
          console.log('After removing markdown:', responseText);
        }
        
        const parsed = JSON.parse(responseText);
        console.log('Successfully parsed JSON:', parsed);
        return parsed;
      } catch (e) {
        console.warn('Failed to parse JSON response, attempting extraction:', e.message);
        console.log('Original data:', data);
        
        // If parsing fails, try to extract JSON from the response text
        const responseText = data.response || data.message || '';
        console.log('Attempting to extract JSON from:', responseText);
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extracted = JSON.parse(jsonMatch[0]);
            console.log('Successfully extracted JSON:', extracted);
            return extracted;
          } catch (e2) {
            console.error('Failed to parse extracted JSON:', e2.message);
          }
        }
        
        // Final fallback - return raw data
        console.log('Returning raw data as fallback');
        return data;
      }
    } catch (error) {
      console.error(`Agent ${agentId} call failed:`, error);
      throw error;
    }
  }

  async generateTestCases(input: MigrationInput): Promise<TestCase[]> {
    const testCasesInput = {
      original_prompt: input.originalPrompt,
      provider: input.provider,
      model: input.model
    };
    
    const response = await this.callAgent(this.agentIds.testGenerator, testCasesInput);
    return response.test_cases || [];
  }

  async migratePrompt(input: MigrationInput): Promise<string> {
    const migrationInput = {
      original_prompt: input.originalPrompt,
      source_provider: input.provider,
      source_model: input.model
    };
    
    console.log('Agent 2 Input:', JSON.stringify(migrationInput, null, 2));
    
    const response = await this.callAgent(this.agentIds.promptMigrator, migrationInput);
    console.log('Agent 2 raw response:', JSON.stringify(response, null, 2));
    
    // CRITICAL: Debug the exact response structure
    console.log('Response keys:', Object.keys(response || {}));
    console.log('migrated_prompt value:', response?.migrated_prompt);
    console.log('prompt value:', response?.prompt);
    console.log('response type:', typeof response);
    
    let migratedPrompt = '';
    
    // Try multiple extraction methods
    if (response?.migrated_prompt) {
      migratedPrompt = response.migrated_prompt;
      console.log('✅ Extracted from migrated_prompt field');
    } else if (response?.prompt) {
      migratedPrompt = response.prompt;
      console.log('✅ Extracted from prompt field');
    } else if (typeof response === 'string') {
      migratedPrompt = response;
      console.log('✅ Response is direct string');
    } else if (response?.response) {
      migratedPrompt = response.response;
      console.log('✅ Extracted from response field');
    } else {
      console.log('❌ No valid prompt found in response');
      console.log('Full response:', response);
    }
    
    console.log('Agent 2 final extracted prompt length:', migratedPrompt?.length || 0);
    console.log('Agent 2 final extracted prompt preview:', migratedPrompt?.substring(0, 200) + '...');
    
    return migratedPrompt || '';
  }

  async executeNovaTest(migratedPrompt: string, testCase: TestCase): Promise<any> {
    const novaInput = {
      migrated_prompt: migratedPrompt,
      test_case: {
        test_id: testCase.test_id,
        input: testCase.input
      }
    };
    
    return await this.callAgent(this.agentIds.novaExecutor, novaInput);
  }

  async compareOutputs(testCases: TestCase[], novaResults: NovaTestResult[]): Promise<PerformanceGap[]> {
    const comparisonData = testCases.map((testCase, index) => ({
      test_input: testCase.input,
      expected_output: testCase.expected_output,
      actual_output: novaResults[index]?.actual_output || null
    }));
    
    try {
      const response = await this.callAgent(this.agentIds.outputComparator, comparisonData);
      console.log('Agent 4 raw response:', JSON.stringify(response, null, 2));
      
      const rawGaps: RawPerformanceGap[] = response.performance_gaps || [];
      
      // Don't transform - keep original structure for UI to handle
      return rawGaps.map(gap => ({
        issue: gap.gap || 'Unknown issue',
        severity: this.mapFrequencyToSeverity(gap.frequency),
        suggestion: gap.suggested_fix || 'No suggestion available',
        // Keep original fields for UI access
        gap: gap.gap,
        example: gap.example,
        frequency: gap.frequency,
        suggested_fix: gap.suggested_fix
      } as any));
    } catch (error) {
      console.error('Failed to process performance gaps:', error);
      return [];
    }
  }

  private mapFrequencyToSeverity(frequency: string): string {
    const freq = frequency?.toLowerCase();
    if (freq?.includes('multiple') || freq === 'high') return 'high';
    if (freq === '2' || freq === '3') return 'medium';
    return 'low';
  }

  async improvePrompt(currentPrompt: string, performanceGaps: PerformanceGap[]): Promise<{
    improved_prompt: string;
    changes_applied: string[];
    raw_response?: any;
  }> {
    const improvementInput = {
      current_prompt: currentPrompt,
      evaluation_results: { performance_gaps: performanceGaps }
    };
    
    console.log('Agent 5 Input - Current Prompt Length:', currentPrompt?.length || 0);
    console.log('Agent 5 Input - Current Prompt:', currentPrompt?.substring(0, 300) + '...');
    console.log('Agent 5 Input - Performance Gaps Count:', performanceGaps?.length || 0);
    console.log('Agent 5 Input - Full Payload:', JSON.stringify(improvementInput, null, 2));
    
    try {
      const response = await this.callAgent(this.agentIds.promptImprover, improvementInput);
      console.log('Agent 5 raw response:', JSON.stringify(response, null, 2));
      
      let finalResponse = response;
      
      // Handle nested JSON structure - check if response has a 'response' field with JSON string
      if (response?.response && typeof response.response === 'string') {
        try {
          const nestedResponse = JSON.parse(response.response);
          console.log('Agent 5 parsed nested response:', JSON.stringify(nestedResponse, null, 2));
          finalResponse = nestedResponse;
        } catch (e) {
          console.warn('Failed to parse nested response, using original:', e.message);
        }
      }
      
      // Transform changes_applied from complex objects to simple strings
      let changesApplied: string[] = [];
      if (finalResponse.changes_applied && Array.isArray(finalResponse.changes_applied)) {
        changesApplied = finalResponse.changes_applied.map((change: any) => {
          if (typeof change === 'string') return change;
          if (typeof change === 'object' && change.modification) {
            return change.modification;
          }
          if (typeof change === 'object' && change.expected_impact) {
            return change.expected_impact;
          }
          return JSON.stringify(change).substring(0, 100);
        });
      }
      
      return {
        improved_prompt: finalResponse.improved_prompt || '',
        changes_applied: changesApplied,
        raw_response: response // Always include raw response for debugging
      };
    } catch (error) {
      console.error('Failed to process prompt improvements:', error);
      return {
        improved_prompt: '',
        changes_applied: [],
        raw_response: error
      };
    }
  }
}

export const lyzrService = new LyzrAgentService();