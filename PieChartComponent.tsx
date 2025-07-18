
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataItem } from './types';

interface PieChartProps {
  title: string;
  data: ChartDataItem[];
}

const COLORS = ['#8B5CF6', '#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const PieChartComponent: React.FC<PieChartProps> = ({ title, data }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius="80%"
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4A5568',
                color: '#E5E7EB',
                borderRadius: '0.5rem'
              }}
              cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
            />
            <Legend wrapperStyle={{ fontSize: '14px', color: '#A0AEC0' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChartComponent;
