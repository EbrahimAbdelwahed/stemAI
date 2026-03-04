'use client';

import { ChevronDown, Check, Zap, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const models = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V3.2',
    description: 'Fast general-purpose with tool support',
    speed: 'fast',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: "Google's best price-performance",
    speed: 'fast',
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    description: 'Advanced reasoning for math & science',
    speed: 'balanced',
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm" disabled={disabled} className="gap-1.5 text-sm font-normal">
          <Sparkles className="size-3.5 text-muted-foreground" />
          {currentModel.name}
          <ChevronDown className="size-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Select model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="flex items-center justify-between py-2"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-sm">{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
            <div className="flex items-center gap-2">
              {model.speed === 'fast' && (
                <Zap className="size-3 text-amber-500" />
              )}
              {model.id === selectedModel && (
                <Check className="size-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
