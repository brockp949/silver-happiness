
import React from 'react';
import type { TranscriptAnalysisResult, UpdateSuggestion, CreationSuggestion } from './types';
import SuggestionsView from './SuggestionsView';
import MeetingAnalysisCard from './MeetingAnalysisCard';

interface TranscriptAnalysisDisplayProps {
    analysis: TranscriptAnalysisResult;
    onAcceptSuggestion: (suggestion: UpdateSuggestion | CreationSuggestion) => void;
}

const TranscriptAnalysisDisplay: React.FC<TranscriptAnalysisDisplayProps> = ({ analysis, onAcceptSuggestion }) => {
    return (
        <div className="space-y-8 mt-8 animate-fade-in">
            {/* Overall Summary */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
                <h2 className="text-3xl font-bold text-white mb-2">{analysis.analysisTitle}</h2>
                <p className="text-gray-400 max-w-4xl">{analysis.overallSummary}</p>
            </div>

            {/* Individual Meeting Analysis */}
            {analysis.meetings && analysis.meetings.length > 0 && (
                <div className="space-y-6">
                    {analysis.meetings.map((meeting, index) => (
                        <MeetingAnalysisCard key={index} meeting={meeting} />
                    ))}
                </div>
            )}

            {/* CRM Suggestions */}
            <div className="border-t border-gray-700 pt-8">
                 <h2 className="text-3xl font-bold text-white mb-4">CRM Integration Suggestions</h2>
                 <SuggestionsView
                    suggestions={{ updates: analysis.updates, creations: analysis.creations }}
                    onAcceptSuggestion={onAcceptSuggestion}
                />
            </div>
        </div>
    );
};

export default TranscriptAnalysisDisplay;
