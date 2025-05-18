import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white p-8">
      <div className="mb-12 flex items-center space-x-3">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="38" 
          height="38" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-blue-500"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <h1 className="text-4xl font-bold">STEM AI Assistant</h1>
      </div>
      
      <p className="text-xl mb-12 text-gray-300 text-center max-w-2xl">
        A powerful AI assistant for STEM learning, now with UI generation capabilities
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 max-w-sm">
          <h2 className="text-2xl font-semibold mb-3">STEM Chat</h2>
          <p className="text-gray-300 mb-6">
            Ask questions about science, technology, engineering, and mathematics with RAG capabilities.
          </p>
          <Link 
            href="/chat" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center transition-colors"
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Open Chat
          </Link>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 max-w-sm">
          <h2 className="text-2xl font-semibold mb-3">UI Generator</h2>
          <p className="text-gray-300 mb-6">
            Generate React components with a v0-like interface using AI-powered design.
          </p>
          <Link 
            href="/generate" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center transition-colors"
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            Generate UI
          </Link>
        </div>
      </div>
    </main>
  );
} 