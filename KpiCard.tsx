
import React from 'react';
import type { Kpi } from '../types';

const KpiCard: React.FC<Kpi> = ({ title, value, insight }) => {
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/80 p-6 rounded-xl shadow-md transform hover:-translate-y-1 transition-transform duration-300 ease-in-out">
      <h4 className="text-sm font-medium text-gray-400 truncate">{title}</h4>
      <p className="mt-1 text-3xl font-semibold text-white">{value}</p>
      {insight && <p className="mt-2 text-xs text-gray-500">{insight}</p>}
    </div>
  );
};

export default KpiCard;
