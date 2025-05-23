import React, { useState } from 'react';

type ModelType = 'grok-3-mini' | 'gemini-2-flash' | 'gpt-4o' | 'claude-3-haiku';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  disabled?: boolean;
}

const models = [
  { 
    id: 'grok-3-mini', 
    name: 'Grok-3-Mini', 
    description: 'Fast and compact model by xAI',
    tag: 'BETA',
    performance: 'Fast',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-400">
        <path d="M12 16.01L16 12L12 7.99L8 12L12 16.01Z" fill="currentColor" />
        <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  { 
    id: 'gemini-2-flash', 
    name: 'Gemini 2.0', 
    description: 'Advanced Google AI model',
    tag: 'Flash',
    performance: 'Balanced',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    description: 'OpenAI\'s advanced multimodal model',
    tag: 'Optimized',
    performance: 'Balanced',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-400">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  { 
    id: 'claude-3-haiku', 
    name: 'Claude 3 Haiku', 
    description: 'Anthropic\'s fast and capable model',
    tag: 'Fast',
    performance: 'Fast',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-400">
        <path d="M12 16.01L16 12L12 7.99L8 12L12 16.01Z" fill="currentColor" />
        <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
];

export default function ModelSelector({ selectedModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentModel = models.find(model => model.id === selectedModel) || models[0];

  return (
    <div className="relative">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md px-3 py-1.5 text-sm transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className="flex items-center">
            {currentModel.icon}
            <span className="ml-2">{currentModel.name}</span>
          </span>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute right-0 mt-1 w-60 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id as ModelType);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  model.id === selectedModel 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-200 hover:bg-gray-700'
                }`}
                role="menuitem"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {model.icon}
                    <span className="ml-2 font-medium">{model.name}</span>
                  </div>
                  {model.tag && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-opacity-20 font-medium ml-1 bg-blue-500 text-blue-300">
                      {model.tag}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                  <span>{model.description}</span>
                  <div className="flex items-center">
                    <span className={`
                      mr-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium
                      ${model.performance === 'Fast' 
                        ? 'bg-green-900/20 text-green-300' 
                        : 'bg-yellow-900/20 text-yellow-300'}
                    `}>
                      {model.performance}
                    </span>
                    {model.id === selectedModel && (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 