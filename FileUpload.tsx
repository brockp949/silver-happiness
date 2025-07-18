import React, { useCallback, useState } from 'react';
import Papa, { type ParseResult, type ParseError } from 'papaparse';
import type { CsvRow } from './types';

interface FileUploadProps {
  onFileProcessed: (csvString: string, data: CsvRow[], fileName: string) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, disabled }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvString = event.target?.result as string;
        Papa.parse(csvString, {
          header: true,
          skipEmptyLines: true,
          complete: (results: ParseResult<CsvRow>) => {
            // Inject a unique ID into each row to link AI analysis back to the original data
            const dataWithIds = results.data.map((row, index) => ({
              ...row,
              '__AI_ROW_ID__': index.toString(), // Add ID as a string to maintain CSV consistency
            }));
            
            // Re-serialize the data with IDs back into a CSV string to send to the AI
            const csvStringWithIds = Papa.unparse(dataWithIds);
            
            onFileProcessed(csvStringWithIds, dataWithIds, file.name);
          },
          error: (error: ParseError) => {
            console.error('PapaParse Error:', error);
            alert(`Failed to parse CSV file: ${error.message}`);
          }
        });
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .csv file.');
    }
  }, [onFileProcessed]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-xl mx-auto" onDragEnter={handleDrag}>
      <label
        htmlFor="dropzone-file"
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
        ${disabled ? 'bg-gray-800 border-gray-700 cursor-not-allowed' : 'bg-gray-800/50 border-gray-600 hover:border-gray-500 hover:bg-gray-800'}
        ${dragActive ? 'border-indigo-500 bg-gray-800' : ''}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
            <svg className="w-10 h-10 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
            <p className="mb-2 text-sm"><span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop</p>
            <p className="text-xs">Vtiger CSV File (e.g., Leads.csv)</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" accept=".csv" onChange={handleChange} disabled={disabled} />
      </label>
      {dragActive && <div className="absolute inset-0 w-full h-full" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
    </div>
  );
};

export default FileUpload;