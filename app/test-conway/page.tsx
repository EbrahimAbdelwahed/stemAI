import ConwaysGameOfLife from '@/components/visualizations/ConwaysGameOfLife';

export default function TestConwayPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Conway's Game of Life</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Experience the fascinating world of cellular automata where simple rules create complex, 
          unpredictable patterns. Watch as life emerges, grows, and evolves on a digital canvas.
        </p>
      </div>
      
      <ConwaysGameOfLife />
      
      <div className="max-w-4xl mx-auto space-y-6">
        <section className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4">About Conway's Game of Life</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Created by mathematician John Conway in 1970, the Game of Life is a zero-player game 
              that demonstrates how complex behaviors can emerge from simple mathematical rules. 
              It's a perfect example of a cellular automaton - a discrete model of computation.
            </p>
            <p>
              Despite its simplicity, the Game of Life is Turing complete, meaning it can simulate 
              any computer algorithm. This makes it a powerful tool for understanding computation, 
              emergence, and the mathematics of complex systems.
            </p>
          </div>
        </section>

        <section className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4">Pattern Types</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-500">Growth Patterns</h3>
              <p className="text-sm text-muted-foreground">
                Patterns that expand indefinitely, creating ever-growing structures. 
                Examples include the R-pentomino and Acorn patterns.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-red-500">Decay Patterns</h3>
              <p className="text-sm text-muted-foreground">
                Patterns that gradually disappear over time. The Diehard pattern 
                completely vanishes after exactly 130 generations.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-500">Oscillators</h3>
              <p className="text-sm text-muted-foreground">
                Patterns that repeat their configuration after a fixed number 
                of generations, creating stable periodic behavior.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4">Mathematical Significance</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The Game of Life demonstrates several important mathematical concepts:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Emergence:</strong> Complex global behavior arising from simple local rules</li>
              <li><strong>Chaos Theory:</strong> Sensitive dependence on initial conditions</li>
              <li><strong>Self-Organization:</strong> Spontaneous pattern formation without external control</li>
              <li><strong>Computational Universality:</strong> Ability to perform any computation</li>
              <li><strong>Phase Transitions:</strong> Critical points where behavior dramatically changes</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
} 