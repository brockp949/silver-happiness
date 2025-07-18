import React, { useState, useEffect } from 'react';

const analysisSteps = [
  "Initializing analysis engine...",
  "Parsing CSV structure...",
  "Identifying key data points...",
  "Sending data to Gemini for deep analysis...",
  "AI is generating insights and KPIs...",
  "Building visualization models...",
  "Finalizing dashboard...",
];

interface AnalysisProgressProps {
  fileName: string;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ fileName }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // This interval cycles through the steps. It doesn't need to stop,
    // as the parent component will unmount it when loading is complete.
    const interval = setInterval(() => {
      setCurrentStep(prevStep => {
        if (prevStep < analysisSteps.length - 1) {
          return prevStep + 1;
        }
        return prevStep; // Stay on the last step until unmounted
      });
    }, 1500); // Change step every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  const progressPercentage = ((currentStep + 1) / analysisSteps.length) * 100;

  return (
    <div className="text-center max-w-2xl mx-auto mt-10 sm:mt-20 p-8 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Data</h2>
      <p className="text-gray-400 mb-6">
        File: <span className="font-medium text-indigo-400">{fileName}</span>
      </p>
      
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="h-8 flex items-center justify-center">
        <p className="text-lg text-gray-300">
            {analysisSteps[currentStep]}
        </p>
      </div>
    </div>
  );
};

export default AnalysisProgress;
