'use client';

import { Atom, FlaskConical, Calculator, Cpu } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Atom,
    title: 'Visualize a protein',
    prompt: 'Show me the 3D structure of insulin (PDB: 2HIU)',
  },
  {
    icon: FlaskConical,
    title: 'Explore a molecule',
    prompt: 'Show me the 3D structure of caffeine',
  },
  {
    icon: Calculator,
    title: 'Plot a function',
    prompt: 'Plot the function sin(x) * cos(x/2) from -2pi to 2pi',
  },
  {
    icon: Cpu,
    title: 'Physics simulation',
    prompt: 'Show me a projectile motion simulation',
  },
];

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Atom className="size-8 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">STEM AI Assistant</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Ask questions about science, technology, engineering, and mathematics.
            Visualize molecules, plot functions, and run physics simulations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.title}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left text-sm transition-colors hover:bg-accent group"
          >
            <suggestion.icon className="size-5 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            <div>
              <div className="font-medium">{suggestion.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{suggestion.prompt}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
