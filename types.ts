
export interface Kpi {
  title: string;
  value: string;
  insight: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface Chart {
  chartType: 'bar' | 'pie';
  title: string;
  data: ChartDataItem[];
}

// UPDATED: Added rowId to link back to original data
export interface Deal {
  rowId: number;
  dealName: string;
  amount: string;
  stage: string;
  insight: string;
  description: string;
}

export interface DashboardData {
  analysisTitle: string;
  summary: string;
  kpis: Kpi[];
  charts: Chart[];
  deals: Deal[];
}

// Allow any string keys for raw CSV data
export type CsvRow = Record<string, string>;

// For AI Assistant Suggestions
export interface UpdateSuggestion {
  type: 'update';
  rowId: number; // The rowId of the deal to update
  dealName: string; // To identify the deal for the user
  changes: Record<string, { oldValue: string; newValue: string; }>; // e.g., { stage: { oldValue: 'Prospecting', newValue: 'Negotiation' } }
  reasoning: string;
}

export interface CreationSuggestion {
  type: 'create';
  suggestionId: string; // A temporary client-side ID for robust handling
  deal: {
    dealName: string;
    amount: string;
    stage: string;
    description: string;
  };
  reasoning: string;
}

// This replaces the old AnalysisSuggestions
export interface MeetingAnalysis {
  meetingTitle: string;
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed' | 'Unknown';
  actionItems: string[];
  risks: string[];
  suggestedFollowUpEmail: string;
}

export interface TranscriptAnalysisResult {
  analysisTitle: string;
  overallSummary: string;
  updates: UpdateSuggestion[];
  creations: CreationSuggestion[];
  meetings: MeetingAnalysis[];
}
