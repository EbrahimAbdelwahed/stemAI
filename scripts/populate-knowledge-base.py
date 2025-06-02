#!/usr/bin/env python3
"""
STEM AI Assistant - Knowledge Base Population Script

This script implements the comprehensive strategy for populating the RAG knowledge base
with high-quality STEM content including first principles, molecular data, and educational materials.

Usage:
    python scripts/populate-knowledge-base.py --phase 1 --content physics
    python scripts/populate-knowledge-base.py --phase 2 --molecules essential
    python scripts/populate-knowledge-base.py --validate --dry-run
"""

import asyncio
import asyncpg
import aiohttp
import openai
import argparse
import json
import yaml
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime
import hashlib
import requests
from dataclasses import dataclass
import time

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ContentEntry:
    """Represents a knowledge base content entry"""
    title: str
    content: str
    content_type: str  # 'physics', 'chemistry', 'biology', 'mathematics', 'molecule'
    metadata: Dict[str, Any]
    sources: List[str]
    tags: List[str]

class STEMContentCollector:
    """Collects STEM content from various sources"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def collect_physics_fundamentals(self) -> List[ContentEntry]:
        """Collect fundamental physics principles"""
        logger.info("Collecting physics fundamentals...")
        
        physics_topics = [
            {
                "title": "Newton's Laws of Motion",
                "content": self._get_newtons_laws_content(),
                "tags": ["classical-mechanics", "motion", "forces"],
                "sources": ["Physics textbooks", "Educational resources"]
            },
            {
                "title": "Laws of Thermodynamics",
                "content": self._get_thermodynamics_content(),
                "tags": ["thermodynamics", "energy", "entropy"],
                "sources": ["Thermodynamics textbooks", "NIST resources"]
            },
            {
                "title": "Maxwell's Equations",
                "content": self._get_maxwell_equations_content(),
                "tags": ["electromagnetism", "fields", "waves"],
                "sources": ["Electromagnetism textbooks", "Physics references"]
            },
            {
                "title": "Quantum Mechanics Principles",
                "content": self._get_quantum_mechanics_content(),
                "tags": ["quantum-mechanics", "wave-function", "uncertainty"],
                "sources": ["Quantum mechanics textbooks", "Physics references"]
            }
        ]
        
        entries = []
        for topic in physics_topics:
            entry = ContentEntry(
                title=topic["title"],
                content=topic["content"],
                content_type="physics",
                metadata={
                    "difficulty": "undergraduate",
                    "visualization_opportunities": self._extract_visualization_tags(topic["content"]),
                    "mathematical_content": True,
                    "created_at": datetime.now().isoformat()
                },
                sources=topic["sources"],
                tags=topic["tags"]
            )
            entries.append(entry)
        
        return entries
    
    async def collect_chemistry_fundamentals(self) -> List[ContentEntry]:
        """Collect fundamental chemistry principles"""
        logger.info("Collecting chemistry fundamentals...")
        
        chemistry_topics = [
            {
                "title": "Atomic Structure and Electron Configuration",
                "content": self._get_atomic_structure_content(),
                "tags": ["atomic-structure", "electrons", "orbitals"],
                "sources": ["General chemistry textbooks", "NIST atomic data"]
            },
            {
                "title": "Chemical Bonding Theory",
                "content": self._get_chemical_bonding_content(),
                "tags": ["bonding", "molecular-structure", "valence"],
                "sources": ["Physical chemistry textbooks", "Chemical bonding references"]
            },
            {
                "title": "Chemical Equilibrium and Le Chatelier's Principle",
                "content": self._get_equilibrium_content(),
                "tags": ["equilibrium", "le-chatelier", "reactions"],
                "sources": ["Physical chemistry textbooks", "Chemical equilibrium references"]
            },
            {
                "title": "Acid-Base Theory",
                "content": self._get_acid_base_content(),
                "tags": ["acid-base", "ph", "buffers"],
                "sources": ["Analytical chemistry textbooks", "Acid-base references"]
            }
        ]
        
        entries = []
        for topic in chemistry_topics:
            entry = ContentEntry(
                title=topic["title"],
                content=topic["content"],
                content_type="chemistry",
                metadata={
                    "difficulty": "undergraduate",
                    "visualization_opportunities": self._extract_visualization_tags(topic["content"]),
                    "mathematical_content": True,
                    "created_at": datetime.now().isoformat()
                },
                sources=topic["sources"],
                tags=topic["tags"]
            )
            entries.append(entry)
        
        return entries
    
    async def collect_essential_molecules(self) -> List[ContentEntry]:
        """Collect data for essential molecules from PubChem"""
        logger.info("Collecting essential molecular data...")
        
        essential_molecules = [
            # Amino acids
            {"name": "Glycine", "pubchem_cid": 750, "category": "amino-acid"},
            {"name": "Alanine", "pubchem_cid": 5950, "category": "amino-acid"},
            {"name": "Valine", "pubchem_cid": 6287, "category": "amino-acid"},
            {"name": "Leucine", "pubchem_cid": 6106, "category": "amino-acid"},
            {"name": "Phenylalanine", "pubchem_cid": 6140, "category": "amino-acid"},
            
            # Nucleotides
            {"name": "Adenosine", "pubchem_cid": 60961, "category": "nucleotide"},
            {"name": "Guanosine", "pubchem_cid": 6802, "category": "nucleotide"},
            {"name": "Cytidine", "pubchem_cid": 6175, "category": "nucleotide"},
            {"name": "Uridine", "pubchem_cid": 6029, "category": "nucleotide"},
            
            # Common chemicals
            {"name": "Water", "pubchem_cid": 962, "category": "solvent"},
            {"name": "Ethanol", "pubchem_cid": 702, "category": "solvent"},
            {"name": "Glucose", "pubchem_cid": 5793, "category": "carbohydrate"},
            {"name": "Caffeine", "pubchem_cid": 2519, "category": "alkaloid"},
            {"name": "Aspirin", "pubchem_cid": 2244, "category": "pharmaceutical"},
        ]
        
        entries = []
        for mol_info in essential_molecules:
            try:
                mol_data = await self._fetch_pubchem_data(mol_info["pubchem_cid"])
                if mol_data:
                    content = self._format_molecular_content(mol_data, mol_info)
                    entry = ContentEntry(
                        title=f"Molecule: {mol_info['name']}",
                        content=content,
                        content_type="molecule",
                        metadata={
                            "pubchem_cid": mol_info["pubchem_cid"],
                            "category": mol_info["category"],
                            "molecular_data": mol_data,
                            "visualization_3d": True,
                            "created_at": datetime.now().isoformat()
                        },
                        sources=[f"PubChem CID: {mol_info['pubchem_cid']}"],
                        tags=[mol_info["category"], "molecule", "chemistry"]
                    )
                    entries.append(entry)
                    logger.info(f"Collected data for {mol_info['name']}")
                else:
                    logger.warning(f"Failed to collect data for {mol_info['name']}")
            except Exception as e:
                logger.error(f"Error collecting data for {mol_info['name']}: {e}")
        
        return entries
    
    async def _fetch_pubchem_data(self, cid: int) -> Optional[Dict]:
        """Fetch molecular data from PubChem API"""
        try:
            base_url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
            
            # Get basic compound information
            compound_url = f"{base_url}/compound/cid/{cid}/JSON"
            async with self.session.get(compound_url) as response:
                if response.status == 200:
                    compound_data = await response.json()
                else:
                    return None
            
            # Get molecular properties
            props_url = f"{base_url}/compound/cid/{cid}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName/JSON"
            async with self.session.get(props_url) as response:
                if response.status == 200:
                    properties = await response.json()
                else:
                    properties = {}
            
            return {
                "compound": compound_data,
                "properties": properties
            }
            
        except Exception as e:
            logger.error(f"Error fetching PubChem data for CID {cid}: {e}")
            return None
    
    def _format_molecular_content(self, mol_data: Dict, mol_info: Dict) -> str:
        """Format molecular data into knowledge base content"""
        try:
            compound = mol_data["compound"]["PC_Compounds"][0]
            props = mol_data.get("properties", {}).get("PropertyTable", {}).get("Properties", [{}])[0]
            
            # Extract basic information
            name = mol_info["name"]
            formula = props.get("MolecularFormula", "N/A")
            weight = props.get("MolecularWeight", "N/A")
            smiles = props.get("CanonicalSMILES", "N/A")
            iupac_name = props.get("IUPACName", "N/A")
            
            content = f"""# {name}

## Overview
{name} is a {mol_info["category"]} with significant importance in biological and chemical systems.

## Molecular Properties
- **Molecular Formula**: {formula}
- **Molecular Weight**: {weight} g/mol
- **SMILES Notation**: {smiles}
- **IUPAC Name**: {iupac_name}

## Chemical Structure
The molecule {name} has a well-defined chemical structure that determines its properties and biological activity.

## Biological Significance
{self._get_biological_significance(mol_info["category"], name)}

## Visualization Opportunities
- 3D molecular structure visualization
- Electron density maps
- Molecular orbital representations
- Comparative structure analysis

## Applications
{self._get_molecular_applications(mol_info["category"], name)}

## Related Compounds
This molecule is related to other {mol_info["category"]}s and shares structural or functional similarities.
"""
            return content
            
        except Exception as e:
            logger.error(f"Error formatting molecular content: {e}")
            return f"# {mol_info['name']}\n\nBasic molecular information for {mol_info['name']}."
    
    def _get_biological_significance(self, category: str, name: str) -> str:
        """Get biological significance based on molecular category"""
        significance_map = {
            "amino-acid": f"{name} is one of the 20 standard amino acids used in protein synthesis. It plays crucial roles in protein structure and function.",
            "nucleotide": f"{name} is a nucleotide component essential for DNA/RNA structure and various cellular processes including energy transfer and signaling.",
            "carbohydrate": f"{name} is an important carbohydrate that serves as an energy source and structural component in biological systems.",
            "solvent": f"{name} is a commonly used solvent in chemical and biological systems, affecting reaction rates and molecular interactions.",
            "pharmaceutical": f"{name} is a pharmaceutical compound with therapeutic applications and specific biological targets.",
            "alkaloid": f"{name} is a naturally occurring alkaloid with biological activity and potential therapeutic applications."
        }
        return significance_map.get(category, f"{name} has important chemical and biological properties.")
    
    def _get_molecular_applications(self, category: str, name: str) -> str:
        """Get applications based on molecular category"""
        applications_map = {
            "amino-acid": "Protein synthesis, nutritional supplements, pharmaceutical intermediates",
            "nucleotide": "DNA/RNA synthesis, energy metabolism, cellular signaling",
            "carbohydrate": "Energy storage, structural components, pharmaceutical applications",
            "solvent": "Chemical reactions, extractions, pharmaceutical formulations",
            "pharmaceutical": "Therapeutic treatments, drug development, medical research",
            "alkaloid": "Natural products research, pharmaceutical development, biological studies"
        }
        return applications_map.get(category, "Various chemical and biological applications")
    
    def _extract_visualization_tags(self, content: str) -> List[str]:
        """Extract potential visualization opportunities from content"""
        viz_keywords = {
            "3d": ["molecule", "structure", "orbital", "field"],
            "plot": ["equation", "function", "graph", "relationship"],
            "simulation": ["motion", "dynamics", "interaction", "behavior"]
        }
        
        opportunities = []
        content_lower = content.lower()
        
        for viz_type, keywords in viz_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                opportunities.append(viz_type)
        
        return opportunities
    
    # Content generation methods for different topics
    def _get_newtons_laws_content(self) -> str:
        return """# Newton's Laws of Motion

## Overview
Newton's three laws of motion form the foundation of classical mechanics and describe the relationship between forces acting on a body and its motion.

## First Principles

### First Law (Law of Inertia)
An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction, unless acted upon by an unbalanced force.

### Second Law (F = ma)
The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.

$$\\vec{F}_{net} = m\\vec{a}$$

### Third Law (Action-Reaction)
For every action, there is an equal and opposite reaction.

$$\\vec{F}_{AB} = -\\vec{F}_{BA}$$

## Mathematical Framework
The fundamental equation of motion combines all three laws:
$$\\sum \\vec{F} = m\\vec{a} = m\\frac{d\\vec{v}}{dt} = m\\frac{d^2\\vec{r}}{dt^2}$$

## Applications
- Projectile motion analysis
- Satellite orbital mechanics
- Vehicle dynamics
- Structural engineering

## Visualization Opportunities
- Force vector diagrams
- Motion trajectories
- Interactive simulations of collisions
- Orbital mechanics demonstrations
"""

    def _get_thermodynamics_content(self) -> str:
        return """# Laws of Thermodynamics

## Overview
The laws of thermodynamics govern energy transfer and transformation in physical systems, establishing fundamental principles for heat, work, and entropy.

## First Principles

### Zeroth Law
If two systems are in thermal equilibrium with a third system, they are in thermal equilibrium with each other.

### First Law (Conservation of Energy)
Energy cannot be created or destroyed, only transferred or converted from one form to another.

$$\\Delta U = Q - W$$

Where:
- ΔU = change in internal energy
- Q = heat added to the system
- W = work done by the system

### Second Law (Entropy)
The entropy of an isolated system never decreases; it either increases or remains constant.

$$\\Delta S \\geq \\frac{Q}{T}$$

### Third Law
The entropy of a perfect crystal at absolute zero temperature is exactly zero.

$$\\lim_{T \\to 0} S = 0$$

## Applications
- Heat engines and refrigeration
- Chemical reaction spontaneity
- Materials science
- Environmental systems

## Visualization Opportunities
- PV diagrams for thermodynamic cycles
- Energy flow diagrams
- Entropy visualization
- Heat transfer simulations
"""

    def _get_chemical_bonding_content(self) -> str:
        return """# Chemical Bonding Theory

## Overview
Chemical bonding theory explains how atoms combine to form molecules and compounds through various types of interactions.

## First Principles

### Types of Chemical Bonds

#### Ionic Bonding
Transfer of electrons from metal to non-metal atoms, resulting in electrostatic attraction between oppositely charged ions.

#### Covalent Bonding
Sharing of electron pairs between atoms to achieve stable electron configurations.

#### Metallic Bonding
Delocalized electrons form a "sea" around metal cations, providing conductivity and malleability.

## Molecular Orbital Theory
Atomic orbitals combine to form molecular orbitals that extend over the entire molecule.

$$\\psi_{MO} = c_1\\psi_1 + c_2\\psi_2 + ... + c_n\\psi_n$$

## Valence Shell Electron Pair Repulsion (VSEPR)
Electron pairs around a central atom arrange themselves to minimize repulsion, determining molecular geometry.

## Applications
- Predicting molecular structure
- Understanding material properties
- Drug design and interactions
- Catalysis mechanisms

## Visualization Opportunities
- 3D molecular structures
- Electron density maps
- Molecular orbital visualizations
- VSEPR geometry models
"""

    def _get_atomic_structure_content(self) -> str:
        return """# Atomic Structure and Electron Configuration

## Overview
Atomic structure describes the arrangement of protons, neutrons, and electrons in atoms, forming the basis for understanding chemical behavior.

## First Principles

### Quantum Mechanical Model
Electrons exist in probability distributions called orbitals, characterized by quantum numbers.

#### Quantum Numbers
- **Principal (n)**: Energy level and size
- **Angular momentum (l)**: Orbital shape
- **Magnetic (ml)**: Orbital orientation
- **Spin (ms)**: Electron spin direction

### Electron Configuration Rules

#### Aufbau Principle
Electrons fill orbitals in order of increasing energy.

#### Pauli Exclusion Principle
No two electrons can have the same set of four quantum numbers.

#### Hund's Rule
Electrons occupy orbitals singly before pairing up.

## Periodic Trends
- **Atomic radius**: Decreases across periods, increases down groups
- **Ionization energy**: Increases across periods, decreases down groups
- **Electronegativity**: Increases across periods, decreases down groups

## Mathematical Framework
The Schrödinger equation describes electron behavior:
$$\\hat{H}\\psi = E\\psi$$

## Applications
- Predicting chemical reactivity
- Understanding spectroscopy
- Materials design
- Nuclear chemistry

## Visualization Opportunities
- Orbital shapes and orientations
- Electron density distributions
- Periodic trend animations
- Atomic structure models
"""

    def _get_equilibrium_content(self) -> str:
        return """# Chemical Equilibrium and Le Chatelier's Principle

## Overview
Chemical equilibrium occurs when the rates of forward and reverse reactions are equal, and Le Chatelier's principle predicts how equilibrium responds to changes.

## First Principles

### Equilibrium Constant
For the reaction: aA + bB ⇌ cC + dD

$$K_{eq} = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$$

### Le Chatelier's Principle
When a system at equilibrium is disturbed, it shifts to counteract the disturbance and establish a new equilibrium.

#### Effects of Changes:
- **Concentration**: System shifts to consume added species or replace removed species
- **Temperature**: Endothermic direction favored by heating, exothermic by cooling
- **Pressure**: Shifts toward side with fewer gas molecules when pressure increases

## Thermodynamic Relationships
$$\\Delta G = -RT \\ln K_{eq}$$
$$\\Delta G = \\Delta H - T\\Delta S$$

## Types of Equilibria
- **Acid-base equilibria**: Ka, Kb, pH calculations
- **Solubility equilibria**: Ksp, precipitation reactions
- **Complex ion equilibria**: Formation constants

## Applications
- Industrial process optimization
- Pharmaceutical development
- Environmental chemistry
- Analytical chemistry

## Visualization Opportunities
- Equilibrium position diagrams
- Reaction progress animations
- Effect of condition changes
- pH titration curves
"""

    def _get_acid_base_content(self) -> str:
        return """# Acid-Base Theory

## Overview
Acid-base theory describes the behavior of acids and bases in solution and provides frameworks for understanding proton transfer reactions.

## First Principles

### Theories of Acids and Bases

#### Arrhenius Theory
- **Acids**: Produce H⁺ ions in aqueous solution
- **Bases**: Produce OH⁻ ions in aqueous solution

#### Brønsted-Lowry Theory
- **Acids**: Proton (H⁺) donors
- **Bases**: Proton (H⁺) acceptors

#### Lewis Theory
- **Acids**: Electron pair acceptors
- **Bases**: Electron pair donors

### pH and pOH
$$pH = -\\log[H^+]$$
$$pOH = -\\log[OH^-]$$
$$pH + pOH = 14$$ (at 25°C)

### Acid-Base Equilibria
For weak acid HA:
$$K_a = \\frac{[H^+][A^-]}{[HA]}$$

For weak base B:
$$K_b = \\frac{[BH^+][OH^-]}{[B]}$$

### Buffer Systems
Resist pH changes through equilibrium:
$$pH = pK_a + \\log\\frac{[A^-]}{[HA]}$$ (Henderson-Hasselbalch equation)

## Applications
- Biological pH regulation
- Industrial processes
- Environmental monitoring
- Analytical chemistry

## Visualization Opportunities
- pH scale representations
- Titration curve animations
- Buffer capacity demonstrations
- Molecular acid-base interactions
"""

    def _get_quantum_mechanics_content(self) -> str:
        return """# Quantum Mechanics Principles

## Overview
Quantum mechanics describes the behavior of matter and energy at the atomic and subatomic scale, where classical physics breaks down.

## First Principles

### Wave-Particle Duality
Matter and energy exhibit both wave-like and particle-like properties.

#### de Broglie Wavelength
$$\\lambda = \\frac{h}{p} = \\frac{h}{mv}$$

### Uncertainty Principle
$$\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}$$

The position and momentum of a particle cannot be simultaneously known with perfect precision.

### Schrödinger Equation
$$i\\hbar\\frac{\\partial\\psi}{\\partial t} = \\hat{H}\\psi$$

Time-independent form:
$$\\hat{H}\\psi = E\\psi$$

### Wave Function
The wave function ψ contains all information about a quantum system.
- **|ψ|²**: Probability density
- **∫|ψ|²dτ = 1**: Normalization condition

### Quantum Numbers
Describe quantum states:
- **n**: Principal quantum number (energy level)
- **l**: Orbital angular momentum
- **ml**: Magnetic quantum number
- **ms**: Spin quantum number

## Key Phenomena
- **Quantization**: Energy levels are discrete
- **Tunneling**: Particles can pass through barriers
- **Superposition**: Systems exist in multiple states simultaneously
- **Entanglement**: Correlated quantum states

## Applications
- Atomic and molecular structure
- Semiconductor technology
- Quantum computing
- Medical imaging (MRI, PET)

## Visualization Opportunities
- Wave function visualizations
- Probability density plots
- Quantum tunneling animations
- Orbital shape representations
"""

    def _get_maxwell_equations_content(self) -> str:
        return """# Maxwell's Equations

## Overview
Maxwell's equations describe the fundamental relationships between electric and magnetic fields and form the foundation of electromagnetic theory.

## First Principles

### The Four Maxwell Equations

#### Gauss's Law (Electric)
$$\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\epsilon_0}$$

The electric flux through a closed surface is proportional to the enclosed charge.

#### Gauss's Law (Magnetic)
$$\\nabla \\cdot \\vec{B} = 0$$

There are no magnetic monopoles; magnetic field lines form closed loops.

#### Faraday's Law
$$\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}$$

A changing magnetic field induces an electric field.

#### Ampère's Law (with Maxwell's Addition)
$$\\nabla \\times \\vec{B} = \\mu_0\\vec{J} + \\mu_0\\epsilon_0\\frac{\\partial \\vec{E}}{\\partial t}$$

Electric current and changing electric fields produce magnetic fields.

### Electromagnetic Waves
Maxwell's equations predict electromagnetic waves traveling at the speed of light:
$$c = \\frac{1}{\\sqrt{\\mu_0\\epsilon_0}}$$

Wave equation:
$$\\nabla^2\\vec{E} = \\mu_0\\epsilon_0\\frac{\\partial^2\\vec{E}}{\\partial t^2}$$

## Applications
- Radio and telecommunications
- Optics and photonics
- Electromagnetic compatibility
- Medical imaging technologies

## Visualization Opportunities
- Electric and magnetic field visualizations
- Electromagnetic wave propagation
- Field line representations
- Interactive demonstrations
"""

class KnowledgeBaseManager:
    """Manages the ingestion and validation of knowledge base content"""
    
    def __init__(self, db_url: str, openai_api_key: str):
        self.db_url = db_url
        self.openai_client = openai.OpenAI(api_key=openai_api_key)
    
    async def ingest_content(self, entries: List[ContentEntry], dry_run: bool = False) -> Dict[str, Any]:
        """Ingest content entries into the knowledge base"""
        if dry_run:
            logger.info(f"DRY RUN: Would ingest {len(entries)} content entries")
            return {"status": "dry_run", "entries_count": len(entries)}
        
        logger.info(f"Starting ingestion of {len(entries)} content entries...")
        
        try:
            conn = await asyncpg.connect(self.db_url)
            ingested_count = 0
            failed_count = 0
            
            for entry in entries:
                try:
                    await self._process_content_entry(conn, entry)
                    ingested_count += 1
                    logger.info(f"Ingested: {entry.title}")
                except Exception as e:
                    logger.error(f"Failed to ingest {entry.title}: {e}")
                    failed_count += 1
            
            await conn.close()
            
            result = {
                "status": "completed",
                "ingested_count": ingested_count,
                "failed_count": failed_count,
                "total_entries": len(entries)
            }
            
            logger.info(f"Ingestion completed: {ingested_count} successful, {failed_count} failed")
            return result
            
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            return {"status": "error", "error": str(e)}
    
    async def _process_content_entry(self, conn: asyncpg.Connection, entry: ContentEntry) -> None:
        """Process a single content entry and generate embeddings"""
        
        # Insert document
        doc_id = await conn.fetchval(
            """
            INSERT INTO documents (title, content, is_public, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            """,
            entry.title,
            entry.content,
            True,  # Make knowledge base content public
            None   # No specific user - system content
        )
        
        # Generate chunks and embeddings
        chunks = self._generate_intelligent_chunks(entry.content, entry.content_type)
        
        for chunk in chunks:
            embedding = await self._generate_embedding(chunk)
            
            await conn.execute(
                """
                INSERT INTO chunks (document_id, content, embedding)
                VALUES ($1, $2, $3)
                """,
                doc_id,
                chunk,
                embedding
            )
    
    def _generate_intelligent_chunks(self, content: str, content_type: str) -> List[str]:
        """Generate chunks optimized for different content types"""
        
        # Adjust chunk size based on content type
        chunk_sizes = {
            "physics": 400,      # Preserve equation context
            "chemistry": 350,    # Keep reaction mechanisms together
            "biology": 450,      # Maintain process descriptions
            "mathematics": 300,  # Preserve mathematical derivations
            "molecule": 250      # Focus on specific properties
        }
        
        max_size = chunk_sizes.get(content_type, 400)
        
        # Split by sections first (marked by ##)
        sections = content.split('\n## ')
        chunks = []
        
        for i, section in enumerate(sections):
            if i > 0:  # Add back the ## prefix for non-first sections
                section = '## ' + section
            
            # If section is small enough, keep as one chunk
            if len(section) <= max_size:
                if section.strip():
                    chunks.append(section.strip())
            else:
                # Split larger sections by sentences
                sentences = section.replace('\n', ' ').split('. ')
                current_chunk = ""
                
                for sentence in sentences:
                    sentence = sentence.strip()
                    if not sentence:
                        continue
                    
                    # Add period back if it was removed
                    if not sentence.endswith('.') and not sentence.endswith(':') and not sentence.endswith('\n'):
                        sentence += '.'
                    
                    # Check if adding this sentence would exceed max size
                    if len(current_chunk) + len(sentence) > max_size and current_chunk:
                        chunks.append(current_chunk.strip())
                        current_chunk = sentence
                    else:
                        current_chunk += " " + sentence if current_chunk else sentence
                
                # Add the last chunk if not empty
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
        
        return [chunk for chunk in chunks if len(chunk.strip()) > 50]  # Filter very short chunks
    
    async def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text chunk"""
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            # Return zero vector as fallback
            return [0.0] * 1536
    
    async def validate_database_connection(self) -> bool:
        """Validate database connection and schema"""
        try:
            conn = await asyncpg.connect(self.db_url)
            
            # Check if required tables exist
            tables = await conn.fetch("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name IN ('documents', 'chunks')
            """)
            
            table_names = [row['table_name'] for row in tables]
            
            if 'documents' not in table_names or 'chunks' not in table_names:
                logger.error("Required tables 'documents' and 'chunks' not found")
                return False
            
            # Check if pgvector extension is available
            extensions = await conn.fetch("SELECT * FROM pg_available_extensions WHERE name = 'vector'")
            if not extensions:
                logger.error("pgvector extension not available")
                return False
            
            await conn.close()
            logger.info("Database validation successful")
            return True
            
        except Exception as e:
            logger.error(f"Database validation failed: {e}")
            return False

async def main():
    """Main function to orchestrate knowledge base population"""
    parser = argparse.ArgumentParser(description="Populate STEM AI Assistant Knowledge Base")
    parser.add_argument("--phase", type=int, choices=[1, 2, 3], help="Implementation phase")
    parser.add_argument("--content", choices=["physics", "chemistry", "biology", "mathematics", "all"], 
                       help="Content type to collect")
    parser.add_argument("--molecules", choices=["essential", "extended", "all"], 
                       help="Molecule set to collect")
    parser.add_argument("--validate", action="store_true", help="Validate database setup")
    parser.add_argument("--dry-run", action="store_true", help="Preview actions without executing")
    parser.add_argument("--output", type=str, help="Output file for collected content")
    
    args = parser.parse_args()
    
    # Load environment variables
    db_url = os.getenv("DATABASE_URL")
    openai_api_key = os.getenv("OPENAI_API_KEY")
    
    if not db_url:
        logger.error("DATABASE_URL environment variable not set")
        sys.exit(1)
    
    if not openai_api_key:
        logger.error("OPENAI_API_KEY environment variable not set")
        sys.exit(1)
    
    # Initialize knowledge base manager
    kb_manager = KnowledgeBaseManager(db_url, openai_api_key)
    
    # Validate database if requested
    if args.validate:
        is_valid = await kb_manager.validate_database_connection()
        if is_valid:
            logger.info("✅ Database validation passed")
        else:
            logger.error("❌ Database validation failed")
            sys.exit(1)
        return
    
    # Collect content based on arguments
    all_entries = []
    
    async with STEMContentCollector() as collector:
        # Phase 1: Core STEM principles
        if args.phase == 1 or args.content:
            content_types = [args.content] if args.content and args.content != "all" else ["physics", "chemistry"]
            
            for content_type in content_types:
                logger.info(f"Collecting {content_type} content...")
                if content_type == "physics":
                    entries = await collector.collect_physics_fundamentals()
                    all_entries.extend(entries)
                elif content_type == "chemistry":
                    entries = await collector.collect_chemistry_fundamentals()
                    all_entries.extend(entries)
        
        # Phase 2: Molecular database
        if args.phase == 2 or args.molecules:
            logger.info("Collecting molecular data...")
            entries = await collector.collect_essential_molecules()
            all_entries.extend(entries)
    
    # Output collected content if requested
    if args.output:
        output_data = [
            {
                "title": entry.title,
                "content": entry.content,
                "content_type": entry.content_type,
                "metadata": entry.metadata,
                "sources": entry.sources,
                "tags": entry.tags
            }
            for entry in all_entries
        ]
        
        with open(args.output, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        logger.info(f"Content saved to {args.output}")
    
    # Ingest content into knowledge base
    if all_entries:
        result = await kb_manager.ingest_content(all_entries, dry_run=args.dry_run)
        logger.info(f"Ingestion result: {result}")
    else:
        logger.info("No content collected. Use --phase, --content, or --molecules to specify what to collect.")

if __name__ == "__main__":
    asyncio.run(main()) 