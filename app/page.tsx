import Link from 'next/link';
import { FeatureCard } from '../components/ui/Card';
import { Typography, Heading1, Lead } from '../components/ui/Typography';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Simple Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <svg 
                    className="w-8 h-8 text-blue-500 group-hover:text-blue-400 transition-colors duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="absolute inset-0 w-8 h-8 bg-blue-500/20 rounded-full blur-md group-hover:bg-blue-400/30 transition-colors duration-200"></div>
                </div>
                <span className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-200">
                  STEM AI Assistant
                </span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/chat" className="nav-link">Chat</Link>
              <Link href="/generate" className="nav-link">UI Generator</Link>
              <Link href="/test-3dmol" className="nav-link">3D Molecules</Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.239 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <main className="relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Hero content */}
          <div className="text-center animate-fade-in">
            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative bg-gray-900 p-4 rounded-full border border-gray-700 group-hover:border-blue-500/50 transition-colors duration-300">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            <Heading1 
              className="mb-6 animate-slide-up text-shadow"
              gradient
            >
              STEM AI Assistant
            </Heading1>
            
            <Lead className="max-w-3xl mx-auto mb-12 animate-slide-up [animation-delay:200ms]">
              A powerful AI assistant for STEM learning, featuring advanced visualization capabilities, 
              document analysis, and intelligent code generation. Experience the future of scientific education.
            </Lead>

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-4 mb-16 animate-slide-up [animation-delay:400ms]">
              {[
                'RAG Capabilities',
                '3D Visualizations', 
                'Multi-Model Support',
                'Real-time Chat',
                'UI Generation'
              ].map((feature, index) => (
                <div 
                  key={feature}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full text-sm text-gray-300 hover:bg-gray-700/50 hover:border-gray-600 transition-colors duration-300"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Feature cards grid */}
          <div className="grid gap-8 md:gap-12 lg:grid-cols-2 max-w-4xl mx-auto animate-scale-in [animation-delay:800ms]">
            <FeatureCard
              title="STEM Chat"
              description="Ask questions about science, technology, engineering, and mathematics with advanced RAG capabilities. Get detailed explanations, solve complex problems, and explore scientific concepts."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              action={{
                label: "Start Chatting",
                href: "/chat"
              }}
            />
            
            <FeatureCard
              title="UI Generator"
              description="Generate React components with a v0-like interface using AI-powered design. Create beautiful, functional components with modern styling and best practices."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              }
              action={{
                label: "Generate UI",
                href: "/generate"
              }}
            />
            
            <FeatureCard
              title="3D Molecular Viewer"
              description="Visualize complex molecular structures in interactive 3D. Explore proteins, chemical compounds, and biological structures with advanced rendering capabilities."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              }
              action={{
                label: "View Molecules",
                href: "/test-3dmol"
              }}
            />
            
            <FeatureCard
              title="Advanced Analytics"
              description="Analyze scientific data with powerful visualization tools. Create interactive plots, perform statistical analysis, and generate insights from your research data."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              action={{
                label: "Explore Data",
                href: "/chat"
              }}
            />
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20 animate-fade-in [animation-delay:1200ms]">
            <Typography variant="h3" className="mb-4 text-gray-300">
              Ready to accelerate your STEM learning?
            </Typography>
            <Typography variant="p" className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of students, researchers, and educators using AI to enhance their understanding of science and technology.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/chat"
                className="btn-primary transform hover:scale-105 transition-all duration-300"
              >
                Get Started Free
              </Link>
              <Link 
                href="/generate"
                className="btn-secondary transform hover:scale-105 transition-all duration-300"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 