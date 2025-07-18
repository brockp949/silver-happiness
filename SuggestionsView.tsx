
import React from 'react';
import type { UpdateSuggestion, CreationSuggestion } from '../types';
import SuggestionCard from './SuggestionCard';

interface SuggestionsViewProps {
    suggestions: {
        updates: UpdateSuggestion[];
        creations: CreationSuggestion[];
    };
    onAcceptSuggestion: (suggestion: UpdateSuggestion | CreationSuggestion) => void;
}

const SuggestionsView: React.FC<SuggestionsViewProps> = ({ suggestions, onAcceptSuggestion }) => {

    const hasSuggestions = suggestions.updates.length > 0 || suggestions.creations.length > 0;

    if (!hasSuggestions) {
        return (
            <div className="text-center py-10 bg-gray-800/50 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-white">No CRM Suggestions</h3>
                <p className="text-gray-400 mt-2">The AI analyzed the transcript but found no necessary updates or new deals to create in the CRM.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8 mt-8">
            {suggestions.updates.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">Updates for Existing Deals</h3>
                    <div className="space-y-4">
                        {suggestions.updates.map((suggestion, index) => (
                            <SuggestionCard 
                                key={`update-${suggestion.rowId}-${index}`} 
                                suggestion={suggestion}
                                onAccept={onAcceptSuggestion}
                            />
                        ))}
                    </div>
                </div>
            )}

            {suggestions.creations.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">New Deals to Create</h3>
                     <div className="space-y-4">
                        {suggestions.creations.map((suggestion, index) => (
                           <SuggestionCard 
                                key={`create-${index}`} 
                                suggestion={suggestion}
                                onAccept={onAcceptSuggestion}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuggestionsView;
