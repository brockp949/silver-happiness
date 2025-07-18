
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataItem } from './types';

interface BarChartProps {
  title: string;
  data: ChartDataItem[];
}

const BarChartComponent: React.FC<BarChartProps> = ({ title, data }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="name" stroke="#A0AEC0" tick={{ fontSize: 12 }} />
            <YAxis stroke="#A0AEC0" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4A5568',
                color: '#E5E7EB',
                borderRadius: '0.5rem',
              }}
              cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
            />
            <Legend wrapperStyle={{ fontSize: '14px', color: '#A0AEC0' }} />
            <Bar dataKey="value" fill="#8B5CF6" name="Value" barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartComponent;
