import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface InputBoxProps {
  onSubmit: (input: string) => void;
  disabled: boolean;
  isProcessing: boolean;
  remainingRequests: number;
}

export const InputBox: React.FC<InputBoxProps> = ({ onSubmit, disabled, isProcessing, remainingRequests }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled && !isProcessing) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="bg-[#1A2A44] rounded-xl border-2 border-[#40C4FF]/30 p-6 shadow-sm">
      {isProcessing && (
        <div className="flex justify-center mb-4">
          <svg className="animate-spin h-5 w-5 text-[#40C4FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 bg-[#1A2A44] text-white border-2 border-[#40C4FF]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40C4FF] disabled:bg-gray-700 disabled:cursor-not-allowed"
          disabled={disabled || isProcessing}
        />
        <button
          type="submit"
          disabled={disabled || isProcessing || !inputValue.trim()}
          className="px-4 py-2 bg-[#40C4FF] text-white rounded-lg hover:bg-[#3399CC] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Send className="h-4 w-4" />
          <span>Send</span>
        </button>
      </form>
      <div className="mt-2 text-sm text-[#40C4FF]/70">
        Remaining requests: {remainingRequests}
      </div>
    </div>
  );
}