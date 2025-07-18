import React from 'react';
import type { Deal, CsvRow } from '../types';

interface DealDetailViewProps {
  deal: Deal;
  rowData: CsvRow;
  onClose: () => void;
}

const DealDetailView: React.FC<DealDetailViewProps> = ({ deal, rowData, onClose }) => {
    // Animation style for the modal panel
    const animationStyle = {
        animation: 'fade-in-up 0.3s ease-out forwards',
        opacity: 0,
        transform: 'translateY(20px)',
    };

    const keyframes = `
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;

    const getStageColor = (stage: string) => {
        const lowerCaseStage = stage.toLowerCase();
        if (lowerCaseStage.includes('closed won')) return 'bg-green-500/20 text-green-300 border border-green-500/30';
        if (lowerCaseStage.includes('closed lost')) return 'bg-red-500/20 text-red-300 border border-red-500/30';
        if (lowerCaseStage.includes('negotiation') || lowerCaseStage.includes('proposal')) return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
        if (lowerCaseStage.includes('prospecting') || lowerCaseStage.includes('qualification')) return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
        return 'bg-gray-600/50 text-gray-300 border border-gray-600/50';
    };

    const displayableData = Object.entries(rowData).filter(([key]) => key !== '__AI_ROW_ID__');

  return (
    <div 
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <style>{keyframes}</style>
      <div 
        style={animationStyle}
        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white truncate pr-4">{deal.dealName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Amount</h4>
                    <p className="mt-1 text-3xl font-semibold text-indigo-400">{deal.amount}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Stage</h4>
                    <span className={`text-base font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${getStageColor(deal.stage)}`}>
                        {deal.stage}
                    </span>
                </div>
            </div>
          
            {/* Insight */}
            <div>
                 <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">AI Insight</h4>
                 <div className="text-gray-300 italic bg-gray-900/50 p-4 rounded-lg border border-gray-700/80">
                    <p>"{deal.insight}"</p>
                 </div>
            </div>
            
            {/* Description */}
            <div>
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Detailed Summary</h4>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{deal.description}</p>
            </div>

            {/* All Data from CSV */}
            <div className="border-t border-gray-700 pt-6">
                 <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">All Data from CSV</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {displayableData.map(([key, value]) => (
                        <div key={key} className="break-words">
                            <p className="font-semibold text-gray-300">{key}</p>
                            <p className="text-gray-400">{value || <span className="italic">empty</span>}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailView;