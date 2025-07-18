
import React from 'react';

interface SpinnerProps {
    message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <div className="w-12 h-12 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-300">{message}</p>
    </div>
  );
};

export default Spinner;
