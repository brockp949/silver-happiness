import React from 'react';
import type { Deal } from '../types';

interface DealCardProps extends Deal {
  onClick: () => void;
}

const DealCard: React.FC<DealCardProps> = ({ dealName, amount, stage, insight, onClick }) => {
  const getStageColor = (stage: string) => {
    const lowerCaseStage = stage.toLowerCase();
    if (lowerCaseStage.includes('closed won')) return 'bg-green-500/20 text-green-400';
    if (lowerCaseStage.includes('closed lost')) return 'bg-red-500/20 text-red-400';
    if (lowerCaseStage.includes('negotiation') || lowerCaseStage.includes('proposal')) return 'bg-blue-500/20 text-blue-400';
    if (lowerCaseStage.includes('prospecting') || lowerCaseStage.includes('qualification')) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-gray-600/50 text-gray-300';
  };

  return (
    <div 
      className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/80 p-5 rounded-xl shadow-md transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col justify-between cursor-pointer hover:border-indigo-500/80"
      onClick={onClick}
    >
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-white pr-4">{dealName}</h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${getStageColor(stage)}`}>
            {stage}
          </span>
        </div>
        <p className="mt-1 text-2xl font-semibold text-indigo-400">{amount}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
         <p className="text-sm text-gray-400 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="italic">"{insight}"</span>
        </p>
      </div>
    </div>
  );
};

export default DealCard;