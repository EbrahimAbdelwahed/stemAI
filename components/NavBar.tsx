import React from 'react';
import Link from 'next/link';

interface NavBarProps {
  selectedModel: string;
  onModelChange: (model: any) => void;
  onNewChat: () => void;
}

export default function NavBar({ selectedModel, onModelChange, onNewChat }: NavBarProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-800 px-4 bg-gray-900">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-blue-500 mr-2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="font-semibold text-white">STEM AI</span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onNewChat}
          className="flex items-center rounded-md px-3 py-1.5 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
        
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="grok-3-mini">Grok-3-Mini</option>
          <option value="gemini-2-flask">Gemini 2.0</option>
        </select>
        
        <div className="flex items-center border-l border-gray-700 pl-3 ml-2">
          <a
            href="https://github.com/vercel/ai"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
            title="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
} 