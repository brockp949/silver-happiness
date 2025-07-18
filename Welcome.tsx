
import React from 'react';

interface WelcomeProps {
    children: React.ReactNode;
}

const Welcome: React.FC<WelcomeProps> = ({ children }) => {
  return (
    <div className="text-center max-w-3xl mx-auto mt-10 sm:mt-20">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Unlock Insights Instantly</h2>
      <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
        Upload your Vtiger CSV export to let our AI automatically generate a beautiful, interactive dashboard with key metrics and visualizations.
      </p>
      
      {children}

      <div className="mt-12 text-left bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-green-400 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.62-3.749A11.95 11.95 0 0118 5.964a11.959 11.959 0 01-2.25-2.977m-1.5 0a48.541 48.541 0 00-9 0" />
            </svg>
            How it works:
        </h3>
        <ul className="space-y-2 text-gray-300">
            <li className="flex items-start"><span className="bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm mr-3 mt-1 flex-shrink-0">1</span><span>Upload a CSV file exported from your Vtiger CRM (e.g., Leads, Opportunities).</span></li>
            <li className="flex items-start"><span className="bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm mr-3 mt-1 flex-shrink-0">2</span><span>Our AI analyzes the structure and content, identifying key business metrics.</span></li>
            <li className="flex items-start"><span className="bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm mr-3 mt-1 flex-shrink-0">3</span><span>Explore your new dashboard with KPIs, charts, and a summary of insights.</span></li>
        </ul>
      </div>
    </div>
  );
};

export default Welcome;
