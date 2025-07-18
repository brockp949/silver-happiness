
import React, { useState, useCallback } from 'react';
import { analyzeVtigerData, analyzeTranscripts } from './services/geminiService';
import type { DashboardData, CsvRow, Deal, TranscriptAnalysisResult, UpdateSuggestion, CreationSuggestion } from './types';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import AnalysisProgress from './components/AnalysisProgress';
import Welcome from './components/Welcome';
import DealsView from './components/DealsView';
import DataTable from './components/DataTable';
import TranscriptAnalyzer from './components/TranscriptAnalyzer';

type ActiveTab = 'Deals' | 'Overview' | 'Data' | 'AI Assistant';

const App: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [originalData, setOriginalData] = useState<CsvRow[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('Overview');

  // State for AI Assistant
  const [transcriptAnalysis, setTranscriptAnalysis] = useState<TranscriptAnalysisResult | null>(null);
  const [isAnalyzingTranscript, setIsAnalyzingTranscript] = useState<boolean>(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);


  const handleFileProcessed = useCallback(async (csvString: string, data: CsvRow[], name: string) => {
    setIsLoading(true);
    setError(null);
    setDashboardData(null);
    setOriginalData(data);
    setFileName(name);

    try {
      const result = await analyzeVtigerData(csvString);
      setDashboardData(result);
      // Guide user to step 2: The AI Assistant
      setActiveTab('AI Assistant');
    } catch (e: unknown) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during analysis.';
      setError(`Failed to analyze data. ${errorMessage}. Please ensure the CSV is valid and try again.`);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleReset = () => {
    setDashboardData(null);
    setOriginalData(null);
    setError(null);
    setFileName('');
    setIsLoading(false);
    setActiveTab('Overview');
    setTranscriptAnalysis(null);
    setTranscriptError(null);
  };
  
  const handleAnalyzeTranscripts = useCallback(async (transcript: string) => {
    if (!dashboardData?.deals) return;

    setIsAnalyzingTranscript(true);
    setTranscriptError(null);
    setTranscriptAnalysis(null);

    try {
        const result = await analyzeTranscripts(transcript, dashboardData.deals);
        // Add unique client-side IDs for robust handling of creation suggestions
        const analysisWithIds: TranscriptAnalysisResult = {
            ...result,
            creations: result.creations.map((c, index) => ({
                ...c,
                suggestionId: `sugg-${Date.now()}-${index}`
            }))
        };
        setTranscriptAnalysis(analysisWithIds);
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setTranscriptError(`Failed to analyze transcript: ${errorMessage}`);
    } finally {
        setIsAnalyzingTranscript(false);
    }
  }, [dashboardData]);

  const handleAcceptSuggestion = useCallback((suggestion: UpdateSuggestion | CreationSuggestion) => {
    setDashboardData(prevData => {
      if (!prevData) return null;

      let newDeals: Deal[];
      let newOriginalData: CsvRow[];

      if (suggestion.type === 'update') {
        newDeals = prevData.deals.map(deal => {
          if (deal.rowId === suggestion.rowId) {
            const updatedDeal = { ...deal };
            Object.entries(suggestion.changes).forEach(([key, value]) => {
              (updatedDeal as any)[key] = value.newValue;
            });
            return updatedDeal;
          }
          return deal;
        });
        newOriginalData = [...(originalData || [])];
        // Note: For simplicity, we are not updating the originalData for updates.
        // A more complex implementation might choose to do so.

      } else { // 'create'
        const newRowId = -Date.now(); // Create a unique negative ID to avoid conflicts
        const newDeal: Deal = {
          rowId: newRowId,
          dealName: suggestion.deal.dealName,
          amount: suggestion.deal.amount,
          stage: suggestion.deal.stage,
          description: suggestion.deal.description,
          insight: 'Newly created from transcript analysis.'
        };
        newDeals = [newDeal, ...prevData.deals];
        
        // Also add a corresponding generic row to originalData so detail view works
        const newRow: CsvRow = {
          '__AI_ROW_ID__': newRowId.toString(),
          dealName: newDeal.dealName,
          amount: newDeal.amount,
          stage: newDeal.stage,
          description: newDeal.description,
          source: 'Created from Transcript'
        }
        newOriginalData = [newRow, ...(originalData || [])];
        setOriginalData(newOriginalData);
      }
      
      return { ...prevData, deals: newDeals };
    });

    // Remove the accepted suggestion from the list in the transcript analysis state
    setTranscriptAnalysis(prev => {
        if (!prev) return null;
        if (suggestion.type === 'update') {
            return {
                ...prev,
                updates: prev.updates.filter(s => s.rowId !== suggestion.rowId)
            }
        } else { // 'create'
             return {
                ...prev,
                creations: prev.creations.filter(s => s.suggestionId !== suggestion.suggestionId)
            }
        }
    })

  }, [originalData]);

  const TabButton: React.FC<{tabName: ActiveTab; children: React.ReactNode}> = ({ tabName, children }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
            activeTab === tabName
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
        }`}
    >
        {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header onReset={handleReset} showReset={!!dashboardData || isLoading || !!error} />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {!dashboardData && !isLoading && !error && (
            <Welcome>
                <FileUpload onFileProcessed={handleFileProcessed} disabled={isLoading} />
            </Welcome>
        )}
        {isLoading && <AnalysisProgress fileName={fileName} />}
        {error && (
          <div className="text-center mt-10 bg-red-900/30 border border-red-600 p-6 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Analysis Failed</h2>
            <p className="text-red-300">{error}</p>
            <button
                onClick={handleReset}
                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
            >
                Try Again
            </button>
          </div>
        )}
        {dashboardData && !isLoading && (
          <div className="space-y-6">
            <div className="border-b border-gray-700 flex space-x-2">
              <TabButton tabName="Overview">Overview Snapshot</TabButton>
              {dashboardData && <TabButton tabName="AI Assistant">AI Assistant</TabButton>}
              <TabButton tabName="Deals">Deals View</TabButton>
              <TabButton tabName="Data">Data Explorer</TabButton>
            </div>

            <div>
              {activeTab === 'Overview' && <Dashboard data={dashboardData} />}
              {activeTab === 'AI Assistant' && (
                <TranscriptAnalyzer 
                  onAnalyze={handleAnalyzeTranscripts}
                  isLoading={isAnalyzingTranscript}
                  error={transcriptError}
                  analysisResult={transcriptAnalysis}
                  onAcceptSuggestion={handleAcceptSuggestion}
                />
              )}
              {activeTab === 'Deals' && <DealsView deals={dashboardData.deals} originalData={originalData || []} />}
              {activeTab === 'Data' && originalData && (
                 <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6 mt-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Raw Data Explorer ({fileName})</h3>
                    <DataTable data={originalData} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
