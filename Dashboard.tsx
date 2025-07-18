

import React from 'react';
import type { DashboardData, Chart as ChartType } from '../types';
import KpiCard from './KpiCard';
import BarChartComponent from './BarChartComponent';
import PieChartComponent from './PieChartComponent';

interface DashboardProps {
  data: DashboardData;
}

const Chart: React.FC<{ chart: ChartType }> = ({ chart }) => {
  switch (chart.chartType) {
    case 'bar':
      return <BarChartComponent title={chart.title} data={chart.data} />;
    case 'pie':
      return <PieChartComponent title={chart.title} data={chart.data} />;
    default:
      // Fallback or render nothing for unknown chart types
      console.warn(`Unsupported chart type: ${chart.chartType}`);
      return <div className="p-4 bg-gray-800 rounded-lg">Unsupported chart type: {chart.chartType}</div>;
  }
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dashboard Header */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-2">{data.analysisTitle}</h2>
        <p className="text-gray-400 max-w-4xl">{data.summary}</p>
      </div>

      {/* KPI Grid */}
      {data.kpis && data.kpis.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.kpis.map((kpi, index) => (
            <KpiCard key={index} title={kpi.title} value={kpi.value} insight={kpi.insight} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-white">No Key Performance Indicators</h3>
            <p className="text-gray-400 mt-2">The AI could not generate KPIs from the provided data. Please ensure your CSV contains relevant columns for analysis (e.g., columns with numbers or dates).</p>
        </div>
      )}


      {/* Charts Grid */}
      {data.charts && data.charts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.charts.map((chart, index) => (
              <Chart key={index} chart={chart} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-white">No Charts Available</h3>
            <p className="text-gray-400 mt-2">The AI could not generate visualizations. Please ensure your CSV contains suitable categorical data (e.g., sales stages, lead sources).</p>
        </div>
      )}
      
    </div>
  );
};

export default Dashboard;