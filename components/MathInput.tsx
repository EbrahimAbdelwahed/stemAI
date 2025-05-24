'use client';

import React, { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface MathInputProps {
  onInsert: (mathText: string) => void;
}

const MathInput: React.FC<MathInputProps> = ({ onInsert }) => {
  const [mathText, setMathText] = useState('');
  const [mode, setMode] = useState<'inline' | 'block'>('inline');

  const handleInsert = () => {
    const formatted = mode === 'inline' ? `$${mathText}$` : `$$\n${mathText}\n$$`;
    onInsert(formatted);
    setMathText('');
  };

  const commonExpressions = [
    { label: 'Fraction', value: '\\frac{a}{b}' },
    { label: 'Square root', value: '\\sqrt{x}' },
    { label: 'Power', value: 'x^{n}' },
    { label: 'Subscript', value: 'x_{n}' },
    { label: 'Sum', value: '\\sum_{i=1}^{n} x_i' },
    { label: 'Integral', value: '\\int_{a}^{b} f(x) dx' },
    { label: 'Matrix', value: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    { label: 'Limit', value: '\\lim_{x \\to \\infty} f(x)' },
    { label: 'Derivative', value: '\\frac{d}{dx} f(x)' },
    { label: 'Partial', value: '\\frac{\\partial f}{\\partial x}' },
    { label: 'Alpha', value: '\\alpha' },
    { label: 'Beta', value: '\\beta' },
  ];

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Math Expression
        </label>
        <textarea
          value={mathText}
          onChange={(e) => setMathText(e.target.value)}
          placeholder="Enter LaTeX math expression..."
          className="w-full p-2 border rounded resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Preview
        </label>
        <div className="p-3 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-h-[60px] flex items-center justify-center">
          {mathText ? (
            <MarkdownRenderer 
              content={mode === 'inline' ? `$${mathText}$` : `$$${mathText}$$`}
              darkMode={true}
            />
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Enter a LaTeX expression to see preview
            </span>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('inline')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              mode === 'inline' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            Inline
          </button>
          <button
            onClick={() => setMode('block')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              mode === 'block' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            Block
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Common Expressions
        </label>
        <div className="grid grid-cols-2 gap-2">
          {commonExpressions.map((expr) => (
            <button
              key={expr.label}
              onClick={() => setMathText(expr.value)}
              className="text-left p-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
              title={`Insert ${expr.label}: ${expr.value}`}
            >
              {expr.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleInsert}
          disabled={!mathText.trim()}
          className="flex-1 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          Insert Math
        </button>
        <button
          onClick={() => setMathText('')}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default MathInput; 