'use client';

import Link from 'next/link';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, FeatureCard } from '../components/ui/Card';
import { Typography, Heading1, Lead } from '../components/ui/Typography';
import { AuthButton, UserMenu } from '../components/ui/AuthButton';
import { GameOfLife } from '../components/ui/GameOfLife';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <AppLayout showSidebar={false}>
      <div className="flex-1 bg-neutral-950 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            {/* Logo/Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative bg-neutral-900 p-4 rounded-full border border-neutral-700 group-hover:border-blue-500/50 transition-colors duration-300">
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
              className="mb-6 text-neutral-100"
              gradient
            >
              STEM AI Assistant
            </Heading1>
            
            <Lead className="max-w-3xl mx-auto mb-8 text-neutral-300">
              A powerful AI assistant for STEM learning, featuring advanced document analysis, 
              real-time chat capabilities, and intelligent problem-solving tools.
            </Lead>

            {/* Auth Section */}
            {!session ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <AuthButton variant="primary" size="lg" />
                <Link 
                  href="/chat"
                  className="inline-flex items-center justify-center px-8 py-3 border border-neutral-600 rounded-lg text-neutral-200 hover:bg-neutral-800 hover:border-neutral-500 transition-colors duration-200 text-base font-medium"
                >
                  Continue as Guest
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  href="/chat"
                  className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-base font-medium"
                >
                  Start Chatting
                </Link>
                <div className="flex justify-center">
                  <UserMenu />
                </div>
              </div>
            )}

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {[
                'RAG Document Analysis',
                'Multi-Model AI Support', 
                'Real-time Problem Solving',
                'STEM Visualization Tools'
              ].map((feature) => (
                <div 
                  key={feature}
                  className="px-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded-full text-sm text-neutral-300 hover:bg-neutral-700/50 hover:border-neutral-600 transition-colors duration-300"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Conway's Game of Life - Terminal Centerpiece */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <Typography variant="h2" className="text-neutral-100 mb-4">
                Live System Demonstration
              </Typography>
              <Typography variant="p" className="text-neutral-400 max-w-2xl mx-auto">
                Watch Conway&apos;s Game of Life evolve in real-time. This cellular automaton demonstrates 
                complex emergent behaviors from simple rules — much like how AI processes information.
              </Typography>
            </div>
            
            <div className="flex justify-center">
              <GameOfLife 
                width={800} 
                height={500} 
                className="max-w-full"
              />
            </div>
          </div>

          {/* Main Feature Card */}
          <div className="max-w-2xl mx-auto mb-16">
            <FeatureCard
              title="STEM AI Chat"
              description="Ask questions about science, technology, engineering, and mathematics. Get detailed explanations, solve complex problems, upload documents for analysis, and explore scientific concepts with our advanced RAG-powered AI assistant."
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
          </div>

          {/* Technologies Grid */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <Typography variant="h3" className="text-neutral-100 mb-4">
                Powered by Advanced AI
              </Typography>
              <Typography variant="p" className="text-neutral-400 max-w-2xl mx-auto">
                Built with cutting-edge language models and designed for scientific inquiry.
              </Typography>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { name: 'Grok AI', desc: 'Real-time reasoning' },
                { name: 'Gemini', desc: 'Multimodal analysis' },
                { name: 'GPT-4', desc: 'Advanced language' },
                { name: 'Claude', desc: 'Scientific accuracy' }
              ].map((tech) => (
                <Card key={tech.name} className="p-4 text-center bg-neutral-900/50 border-neutral-800">
                  <Typography variant="small" className="font-semibold text-neutral-200 mb-1">
                    {tech.name}
                  </Typography>
                  <Typography variant="small" className="text-neutral-400">
                    {tech.desc}
                  </Typography>
                </Card>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <Typography variant="h3" className="mb-4 text-neutral-200">
              Ready to accelerate your STEM learning?
            </Typography>
            <Typography variant="p" className="text-neutral-400 mb-8 max-w-2xl mx-auto">
              Join researchers, students, and educators using AI to enhance their understanding 
              of science and technology.
            </Typography>
            <Link 
              href="/chat"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-lg font-medium transform hover:scale-105"
            >
              Get Started
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 