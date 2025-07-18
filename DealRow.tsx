import React from 'react';
import type { Deal } from './types';

interface DealRowProps extends Deal {
    onClick: () => void;
}

const DealRow: React.FC<DealRowProps> = ({ dealName, amount, stage, onClick }) => {
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
            className="bg-gray-800/50 border border-transparent hover:border-indigo-500/50 hover:bg-gray-800 p-3 rounded-lg transition-all duration-200 flex items-center justify-between space-x-4 cursor-pointer"
            onClick={onClick}
        >
            <p className="text-base font-semibold text-white truncate flex-1">{dealName}</p>
            <div className="flex items-center space-x-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${getStageColor(stage)}`}>
                    {stage}
                </span>
                <p className="text-base font-medium text-gray-300 w-28 text-right">{amount}</p>
            </div>
        </div>
    );
};

export default DealRow;