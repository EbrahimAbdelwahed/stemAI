# Quick Start: Populate Your STEM AI Knowledge Base

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install required Python packages
pip install -r scripts/requirements-knowledge-base.txt
```

### Step 2: Validate Your Setup

```bash
# Check if your database and API keys are configured correctly
python scripts/populate-knowledge-base.py --validate
```

Expected output:
```
✅ Database validation passed
```

### Step 3: Start with Physics Fundamentals (Dry Run)

```bash
# Preview what will be collected and ingested
python scripts/populate-knowledge-base.py --phase 1 --content physics --dry-run
```

### Step 4: Ingest Your First Content

```bash
# Actually populate the knowledge base with physics fundamentals
python scripts/populate-knowledge-base.py --phase 1 --content physics
```

### Step 5: Add Essential Molecules

```bash
# Add molecular data from PubChem
python scripts/populate-knowledge-base.py --phase 2 --molecules essential
```

## 📊 Available Commands

### Content Collection Options

| Command | Description | Content Added |
|---------|-------------|---------------|
| `--phase 1 --content physics` | Physics fundamentals | Newton's laws, thermodynamics, quantum mechanics, Maxwell's equations |
| `--phase 1 --content chemistry` | Chemistry fundamentals | Atomic structure, bonding theory, equilibrium, acid-base theory |
| `--phase 2 --molecules essential` | Essential molecules | 14 key molecules (amino acids, nucleotides, common chemicals) |
| `--content all` | All Phase 1 content | Physics + Chemistry fundamentals |

### Utility Commands

| Command | Description |
|---------|-------------|
| `--validate` | Check database and API setup |
| `--dry-run` | Preview without making changes |
| `--output filename.json` | Save collected content to file |

## 🧪 Test Your Knowledge Base

After populating, test the RAG system by:

1. **Go to your chat interface**: `http://localhost:3000/chat`
2. **Ask physics questions**: "Explain Newton's second law"
3. **Ask chemistry questions**: "What is chemical equilibrium?"
4. **Ask about molecules**: "Tell me about glucose structure"

You should see responses that reference the knowledge base content!

## 📈 Expected Results

### Phase 1 Completion
- **8 fundamental STEM documents** added
- **~50-80 text chunks** with embeddings
- **Core physics and chemistry** principles covered

### Phase 2 Completion  
- **14 essential molecules** added
- **Molecular properties and structures** available
- **3D visualization data** for all molecules

## 🔧 Troubleshooting

### Common Issues

#### "Database validation failed"
- Check your `DATABASE_URL` in `.env.local`
- Ensure your Neon database is running
- Verify pgvector extension is installed

#### "OpenAI API error"
- Check your `OPENAI_API_KEY` in `.env.local`
- Verify you have API credits available
- Check for rate limiting

#### "PubChem API timeout"
- Molecular data collection may be slow
- Run with smaller batches if needed
- Check your internet connection

### Get Help

```bash
# See all available options
python scripts/populate-knowledge-base.py --help

# Validate your setup
python scripts/populate-knowledge-base.py --validate

# Preview before running
python scripts/populate-knowledge-base.py --dry-run --content physics
```

## 🎯 Next Steps

1. **Complete Phase 1**: Add all fundamental content
   ```bash
   python scripts/populate-knowledge-base.py --content all
   ```

2. **Expand molecular database**: Add more molecules as needed

3. **Custom content**: Follow the guide in `docs/knowledge-base-population-guide.md`

4. **Quality assurance**: Test search relevance and accuracy

5. **Performance optimization**: Monitor embedding search speed

## 📋 Content Overview

### Physics Fundamentals Added
- ✅ Newton's Laws of Motion
- ✅ Laws of Thermodynamics  
- ✅ Maxwell's Equations
- ✅ Quantum Mechanics Principles

### Chemistry Fundamentals Added
- ✅ Atomic Structure & Electron Configuration
- ✅ Chemical Bonding Theory
- ✅ Chemical Equilibrium & Le Chatelier's Principle
- ✅ Acid-Base Theory

### Essential Molecules Added
- ✅ Amino acids (5 essential ones)
- ✅ Nucleotides (4 DNA/RNA bases)
- ✅ Common chemicals (water, ethanol, glucose, caffeine, aspirin)

This gives you a solid foundation of **high-quality, structured STEM content** that your AI assistant can reference to provide accurate, detailed responses about fundamental scientific principles and molecular properties! 