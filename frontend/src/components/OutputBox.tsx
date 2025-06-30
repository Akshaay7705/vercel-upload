
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface OutputBoxProps {
  content: React.ReactNode;
  blocked: boolean;
  detectionResult?: {
    isMalicious: boolean;
    reasons: string[];
    confidence: number;
    category: string;
  };
  intentVerification?: {
    matches: boolean;
    explanation: string;
    confidence: number;
  };
  processingTime: number;
  isLoading: boolean;
}

export const OutputBox: React.FC<OutputBoxProps> = ({
  content,
  blocked,
  detectionResult,
  intentVerification,
  processingTime,
  isLoading,
}) => {
  const renderContent =
    typeof content === 'string' ? <ReactMarkdown>{content}</ReactMarkdown> : content;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
      <div className="prose max-w-none">
        {renderContent}
        <div>
          {blocked && detectionResult && (
            <div className="mt-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Blocked: {detectionResult.reasons.join(', ')} (Confidence: {detectionResult.confidence.toFixed(2)})
            </div>
          )}
          {blocked && intentVerification && !detectionResult && (
            <div className="mt-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Blocked: {intentVerification.explanation} (Confidence: {intentVerification.confidence.toFixed(2)})
            </div>
          )}
          <div className="mt-2 text-sm text-gray-500">
            Processing time: {processingTime}ms
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center mt-4">
          <svg
            className="animate-spin h-5 w-5 text-[#007185]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
