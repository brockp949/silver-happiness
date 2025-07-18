
import React, { useState } from 'react';
import type { MeetingAnalysis } from '../types';

interface MeetingAnalysisCardProps {
    meeting: MeetingAnalysis;
}

const MeetingAnalysisCard: React.FC<MeetingAnalysisCardProps> = ({ meeting }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [emailCopied, setEmailCopied] = useState(false);

    const getSentimentInfo = (sentiment: MeetingAnalysis['sentiment']) => {
        switch (sentiment) {
            case 'Positive': return { color: 'text-green-400', bgColor: 'bg-green-500/10', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' };
            case 'Negative': return { color: 'text-red-400', bgColor: 'bg-red-500/10', icon: 'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' };
            case 'Neutral': return { color: 'text-gray-400', bgColor: 'bg-gray-500/10', icon: 'M8 12h8M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' };
            case 'Mixed': return { color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' };
            default: return { color: 'text-gray-500', bgColor: 'bg-gray-700/20', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4c-1.742 0-3.223-.835-3.772-2M12 12H4M4 12L2 10M4 12l2 2' };
        }
    };
    
    const sentimentInfo = getSentimentInfo(meeting.sentiment);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(meeting.suggestedFollowUpEmail);
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800/70 border border-gray-700 rounded-xl shadow-md overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-4 bg-gray-900/50 hover:bg-gray-900/80 transition-colors"
            >
                <h3 className="text-xl font-bold text-white">{meeting.meetingTitle}</h3>
                <div className="flex items-center space-x-4">
                    <span className={`flex items-center text-sm font-semibold px-3 py-1 rounded-full ${sentimentInfo.bgColor} ${sentimentInfo.color}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={sentimentInfo.icon} /></svg>
                        {meeting.sentiment}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </button>
            {isExpanded && (
                 <div className="p-6 space-y-6 animate-fade-in">
                    
                    {/* Summary */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Summary</h4>
                        <p className="text-gray-300 leading-relaxed">{meeting.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Action Items */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                Action Items
                            </h4>
                             {meeting.actionItems.length > 0 ? (
                                <ul className="space-y-2 pl-2">
                                    {meeting.actionItems.map((item, i) => (
                                        <li key={i} className="flex items-start text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-gray-500 italic text-sm pl-7">No specific action items identified.</p>)}
                        </div>

                        {/* Risks / Objections */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Risks &amp; Objections
                            </h4>
                            {meeting.risks.length > 0 ? (
                                <ul className="space-y-2 pl-2">
                                    {meeting.risks.map((risk, i) => (
                                        <li key={i} className="flex items-start text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                            <span>{risk}</span>
                                        </li>
                                    ))}
                                </ul>
                             ) : (<p className="text-gray-500 italic text-sm pl-7">No significant risks identified.</p>)}
                        </div>
                    </div>

                    {/* Suggested Email */}
                    <div className="border-t border-gray-700/50 pt-6">
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Suggested Follow-Up Email
                            </h4>
                            <button onClick={handleCopyEmail} className={`text-sm font-semibold py-1 px-3 rounded-md transition-colors flex items-center space-x-2 ${emailCopied ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                <span>{emailCopied ? 'Copied!' : 'Copy'}</span>
                            </button>
                        </div>
                        <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
                             <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">{meeting.suggestedFollowUpEmail}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingAnalysisCard;
