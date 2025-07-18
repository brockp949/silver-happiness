import React, { useState } from 'react';
import type { UpdateSuggestion, CreationSuggestion } from '../types';

interface SuggestionCardProps {
    suggestion: UpdateSuggestion | CreationSuggestion;
    onAccept: (suggestion: UpdateSuggestion | CreationSuggestion) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onAccept }) => {
    const [isHandled, setIsHandled] = useState(false);

    const handleAccept = () => {
        onAccept(suggestion);
        setIsHandled(true);
    };

    const handleReject = () => {
        setIsHandled(true);
    };
    
    const renderChanges = (changes: UpdateSuggestion['changes']) => {
        return (
            <div className="space-y-2 mt-2">
                {Object.entries(changes).map(([field, values]) => (
                    <div key={field} className="text-sm">
                        <span className="font-semibold capitalize text-gray-300">{field}:</span>
                        <div className="flex items-center space-x-2 mt-1">
                             <span className="line-through text-red-400/80 bg-red-900/20 px-2 py-0.5 rounded">{values.oldValue}</span>
                             <span className="text-green-300">➔</span>
                             <span className="font-bold text-green-300 bg-green-900/20 px-2 py-0.5 rounded">{values.newValue}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderCreationDetails = (deal: CreationSuggestion['deal']) => {
         return (
            <div className="space-y-2 mt-2 text-sm">
                <div><span className="font-semibold text-gray-300">Amount:</span> <span className="text-gray-200">{deal.amount}</span></div>
                <div><span className="font-semibold text-gray-300">Stage:</span> <span className="text-gray-200">{deal.stage}</span></div>
                <div><span className="font-semibold text-gray-300">Description:</span> <p className="text-gray-400 italic mt-1">{deal.description}</p></div>
            </div>
        );
    }
    
    return (
        <div className={`bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-lg transition-all duration-300 ${isHandled ? 'opacity-50 bg-gray-800/50' : ''}`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                <div>
                    <div className="flex items-center mb-2">
                         <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full mr-3 ${suggestion.type === 'update' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                            {suggestion.type}
                        </span>
                        <h4 className="text-lg font-bold text-white">
                            {suggestion.type === 'update' ? suggestion.dealName : suggestion.deal.dealName}
                        </h4>
                    </div>
                   
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-400">AI Reasoning:</p>
                        <p className="text-sm text-gray-300 italic">"{suggestion.reasoning}"</p>
                    </div>

                    {suggestion.type === 'update' ? renderChanges(suggestion.changes) : renderCreationDetails(suggestion.deal)}
                </div>
                
                {!isHandled && (
                    <div className="flex space-x-2 mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                        <button onClick={handleReject} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Reject</button>
                        <button onClick={handleAccept} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">Accept</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestionCard;