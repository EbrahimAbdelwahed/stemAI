'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
            Learning Paths
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Coming soon: Structured learning paths for mastering STEM subjects
          </p>
          <Link href="/chat">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Return to Chat
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 