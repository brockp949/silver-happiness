
import React, { useState, useCallback } from 'react';
import type { TranscriptAnalysisResult, UpdateSuggestion, CreationSuggestion } from '../types';
import TranscriptAnalysisDisplay from './TranscriptAnalysisDisplay';
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs';


interface TranscriptAnalyzerProps {
    onAnalyze: (transcript: string) => void;
    isLoading: boolean;
    error: string | null;
    analysisResult: TranscriptAnalysisResult | null;
    onAcceptSuggestion: (suggestion: UpdateSuggestion | CreationSuggestion) => void;
}

const TranscriptAnalyzer: React.FC<TranscriptAnalyzerProps> = ({ onAnalyze, isLoading, error, analysisResult, onAcceptSuggestion }) => {
    const [transcriptContent, setTranscriptContent] = useState('');
    const [isReadingFile, setIsReadingFile] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const readFileAsText = async (file: File): Promise<string> => {
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            const arrayBuffer = await file.arrayBuffer();
            const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => 'text' in item ? item.text : '').join(' ') + '\n';
            }
            return fullText;
        }
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value;
        }
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            return await file.text();
        }
        
        alert(`Unsupported file type: ${file.name}. Please upload .txt, .pdf, or .docx files.`);
        return '';
    };

    const handleFiles = useCallback(async (files: FileList) => {
        if (!files || files.length === 0) return;

        setIsReadingFile(true);
        setTranscriptContent('');

        try {
            const allTexts = await Promise.all(Array.from(files).map(readFileAsText));
            const combinedText = allTexts.filter(text => text.trim() !== '').join('\n\n--- NEW TRANSCRIPT ---\n\n');

            if (!combinedText.trim()) {
                 alert("Could not extract any text from the uploaded file(s). Please check the file contents or paste the text manually.");
            }
            setTranscriptContent(combinedText);

        } catch (err) {
            console.error("Failed to read files:", err);
            alert(`Error reading files: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsReadingFile(false);
        }
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            handleFiles(files);
        }
        event.target.value = ''; // Allow re-uploading the same file
    };

    const handleAnalyzeClick = () => {
        if (transcriptContent.trim()) {
            onAnalyze(transcriptContent);
        }
    };
    
    // Drag and drop handlers
    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement | HTMLTextAreaElement>) => {
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
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const isProcessing = isLoading || isReadingFile;

    return (
        <div className="space-y-6 animate-fade-in mt-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
                <h2 className="text-3xl font-bold text-white mb-2">AI Assistant &amp; Transcript Analyst</h2>
                <p className="text-gray-400 max-w-4xl">
                    Paste your meeting transcript(s) below, or upload one or more files (.txt, .pdf, .docx). The AI will perform a deep analysis, suggest CRM changes, and provide key insights.
                </p>
            </div>

            <div className="space-y-4" onDragEnter={handleDrag}>
                <div 
                    className={`relative rounded-lg border-2 border-dashed transition-colors duration-300 ${isProcessing ? 'border-gray-600' : 'border-gray-600'} ${dragActive ? 'border-indigo-500 bg-gray-800' : ''}`}
                >
                    <textarea
                        value={transcriptContent}
                        onChange={(e) => setTranscriptContent(e.target.value)}
                        placeholder="Paste transcript(s) here, or drag and drop files..."
                        disabled={isProcessing}
                        className="w-full h-64 p-4 bg-gray-900 text-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y border-none disabled:opacity-70"
                        aria-label="Meeting Transcript"
                    />
                    {dragActive && <div className="absolute inset-0 w-full h-full" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <label htmlFor="transcript-upload" className={`cursor-pointer inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 text-sm ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3.75 18A2.25 2.25 0 016 20.25h12A2.25 2.25 0 0119.5 18v-2.25A2.25 2.25 0 0017.25 13.5H6.75A2.25 2.25 0 004.5 15.75v2.25c0 .336.03.662.09.975" /></svg>
                        <span>{isReadingFile ? 'Reading file(s)...' : 'Upload File(s)'}</span>
                        <input id="transcript-upload" type="file" className="hidden" accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} disabled={isProcessing} multiple />
                    </label>

                    <button
                        onClick={handleAnalyzeClick}
                        disabled={isProcessing || !transcriptContent.trim()}
                        className="w-full sm:w-auto justify-self-end bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                                Analyzing...
                            </>
                        ) : (
                            'Analyze Transcripts'
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="text-center mt-6 bg-red-900/30 border border-red-600 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-red-400 mb-1">Analysis Failed</h3>
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {analysisResult && (
                <TranscriptAnalysisDisplay
                    analysis={analysisResult} 
                    onAcceptSuggestion={onAcceptSuggestion}
                />
            )}
        </div>
    );
};

export default TranscriptAnalyzer;
