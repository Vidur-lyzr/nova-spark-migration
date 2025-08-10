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
      
      // Parse JSON response
      try {
        return JSON.parse(data.response || data.message || '{}');
      } catch (e) {
        console.warn('Failed to parse JSON response, returning raw data:', data);
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
    
    const response = await this.callAgent(this.agentIds.promptMigrator, migrationInput);
    return response.migrated_prompt || response.prompt || '';
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
    
    const response = await this.callAgent(this.agentIds.outputComparator, comparisonData);
    return response.performance_gaps || [];
  }

  async improvePrompt(currentPrompt: string, performanceGaps: PerformanceGap[]): Promise<{
    improved_prompt: string;
    changes_applied: string[];
  }> {
    const improvementInput = {
      current_prompt: currentPrompt,
      evaluation_results: { performance_gaps: performanceGaps }
    };
    
    const response = await this.callAgent(this.agentIds.promptImprover, improvementInput);
    return {
      improved_prompt: response.improved_prompt || '',
      changes_applied: response.changes_applied || []
    };
  }
}

export const lyzrService = new LyzrAgentService();