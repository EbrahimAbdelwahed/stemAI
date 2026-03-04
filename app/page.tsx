import Link from 'next/link';
import { Atom, MessageSquare, FlaskConical, Calculator, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Atom,
    title: 'Molecular Visualization',
    description: '3D protein and molecule structures with PDB, SMILES, and PubChem support.',
  },
  {
    icon: FlaskConical,
    title: 'Physics Simulations',
    description: 'Interactive Matter.js simulations for pendulums, collisions, and more.',
  },
  {
    icon: Calculator,
    title: 'Math Plotting',
    description: '2D and 3D function plots with LaTeX rendering for equations.',
  },
];

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      {/* Hero */}
      <div className="flex flex-col items-center text-center max-w-2xl">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Atom className="size-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          STEM AI Assistant
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          An AI-powered learning platform for science, technology, engineering, and mathematics.
          Visualize molecules, run simulations, and explore STEM concepts.
        </p>
        <Link
          href="/chat"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <MessageSquare className="size-4" />
          Start chatting
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Features */}
      <div className="mt-20 grid gap-6 sm:grid-cols-3 w-full max-w-3xl">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col items-start gap-3 rounded-xl border bg-card p-5 transition-colors hover:bg-accent/50"
          >
            <feature.icon className="size-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-sm">{feature.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 