import React from 'react';
import type { Deal } from './types';

interface DealCardCompactProps extends Deal {
  onClick: () => void;
}

const DealCardCompact: React.FC<DealCardCompactProps> = ({ dealName, amount, stage, onClick }) => {
  const getStageColor = (stage: string) => {
    const lowerCaseStage = stage.toLowerCase();
    if (lowerCaseStage.includes('closed won')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (lowerCaseStage.includes('closed lost')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (lowerCaseStage.includes('negotiation') || lowerCaseStage.includes('proposal')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (lowerCaseStage.includes('prospecting') || lowerCaseStage.includes('qualification')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-gray-600/50 text-gray-300 border-gray-600/50';
  };

  return (
    <div 
      className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/80 p-4 rounded-lg shadow-md transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col justify-between h-full cursor-pointer hover:border-indigo-500/80"
      onClick={onClick}
    >
      <h3 className="text-base font-bold text-white truncate mb-2">{dealName}</h3>
      <div>
        <p className="text-lg font-semibold text-indigo-400 mb-2">{amount}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap border ${getStageColor(stage)}`}>
          {stage}
        </span>
      </div>
    </div>
  );
};

export default DealCardCompact;