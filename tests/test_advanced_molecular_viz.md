# Advanced Molecular Visualization Testing Guide

## Overview
This document provides comprehensive test cases for the enhanced `displayMolecule3D` tool and `Advanced3DMolViewer` component, implementing Phase 1 of the visualization enhancement plan.

## Test Environment Setup

### Prerequisites
- STEM AI Assistant running locally
- Access to chat interface
- Network connectivity for fetching molecular data

### Test Data
- **PDB ID**: `1CRN` (small protein, crambin)
- **SMILES**: `CCO` (ethanol)
- **PubChem CID**: `702` (ethanol)
- **Complex PDB**: `2HHB` (hemoglobin)

---

## Test Cases

### 🔹 **1. Basic Functionality Tests**

#### Test 1.1: Simple Stick Representation (Backward Compatibility)
**Query**: "Show me the 3D structure of ethanol using SMILES CCO"

**Expected Behavior**:
- Should use `Simple3DMolViewer` (since no advanced options)
- Default stick representation
- Element coloring
- White background

**Validation**:
- [ ] Loads without errors
- [ ] Displays stick representation
- [ ] Shows "Simple3DMolViewer" in console logs
- [ ] Status shows "✅ 3D model loaded successfully!"

#### Test 1.2: Advanced Options Trigger
**Query**: "Show me ethanol CCO as spheres with a black background"

**Expected Behavior**:
- Should use `Advanced3DMolViewer` (due to advanced options)
- Sphere representation
- Black background

**Validation**:
- [ ] Uses Advanced3DMolViewer
- [ ] Sphere representation visible
- [ ] Black background applied
- [ ] Console shows "Advanced 3D model loaded successfully!"

---

### 🔹 **2. Representation Style Tests**

#### Test 2.1: Sphere Representation
**Query**: "Display PDB 1CRN using sphere representation"

**Expected Result**:
- Spherical atoms with appropriate radii
- Element-based coloring by default

#### Test 2.2: Line Representation  
**Query**: "Show 1CRN as wireframe lines"

**Expected Result**:
- Thin line representation showing bonds
- Wireframe appearance

#### Test 2.3: Ball-and-Stick
**Query**: "Display 1CRN using ball-and-stick representation"

**Expected Result**:
- Combined spheres and sticks
- Smaller spheres than pure sphere mode
- Visible bonds between atoms

#### Test 2.4: Cartoon (Protein)
**Query**: "Show PDB 2HHB using cartoon representation"

**Expected Result**:
- Ribbon/cartoon representation of protein backbone
- Secondary structure visible
- Appropriate for protein visualization

#### Test 2.5: Surface Representation
**Query**: "Display 1CRN with surface representation"

**Expected Result**:
- Molecular surface generated
- Surface overlay on structure
- Van der Waals surface by default

---

### 🔹 **3. Color Scheme Tests**

#### Test 3.1: Chain Coloring
**Query**: "Show PDB 2HHB with cartoon representation and chain coloring"

**Expected Result**:
- Different colors for different protein chains
- Clear chain distinction

#### Test 3.2: Secondary Structure Coloring
**Query**: "Display 2HHB with secondary structure coloring"

**Expected Result**:
- Helices, sheets, and coils in different colors
- Protein secondary structure clearly visible

#### Test 3.3: Spectrum Coloring
**Query**: "Show 1CRN with spectrum coloring from N to C terminus"

**Expected Result**:
- Gradient coloring along protein sequence
- Blue to red spectrum typically

---

### 🔹 **4. Surface Rendering Tests**

#### Test 4.1: Van der Waals Surface
**Query**: "Display ethanol CCO with Van der Waals surface at 50% opacity"

**Expected Result**:
- VDW surface generated
- 50% transparency
- Surface encompasses molecular volume

#### Test 4.2: Solvent Accessible Surface
**Query**: "Show 1CRN with solvent accessible surface"

**Expected Result**:
- SAS surface generated
- Larger than VDW surface
- Represents solvent probe accessibility

#### Test 4.3: Surface with Stick Underneath
**Query**: "Display 1CRN with surface and stick representation underneath"

**Expected Result**:
- Both surface and stick visible
- Surface semi-transparent
- Structure details still visible

---

### 🔹 **5. Region-Specific Selection Tests**

#### Test 5.1: Chain Selection
**Query**: "Show PDB 2HHB with chain A as cartoon and chain B as spheres"

**Expected Result**:
- Chain A in cartoon representation
- Chain B in sphere representation
- Different visual styles for different chains

#### Test 5.2: Residue Range Selection
**Query**: "Display 1CRN with residues 1-20 as sticks and the rest as cartoon"

**Expected Result**:
- First 20 residues as sticks
- Remaining residues as cartoon
- Clear visual distinction

#### Test 5.3: Ligand Highlighting
**Query**: "Show PDB structure with ligands highlighted in red spheres"

**Expected Result**:
- Main protein structure in default representation
- Ligands/heteroatoms as red spheres
- Clear identification of bound molecules

---

### 🔹 **6. Label and Interactive Tests**

#### Test 6.1: Atom Labels
**Query**: "Display ethanol CCO with atom labels enabled"

**Expected Result**:
- Atom symbols visible on structure
- Labels positioned near atoms
- Readable font size

#### Test 6.2: Residue Labels (Protein)
**Query**: "Show 1CRN with residue labels enabled"

**Expected Result**:
- Residue names and numbers visible
- Labels positioned appropriately
- Clear identification of amino acids

---

### 🔹 **7. Background and Appearance Tests**

#### Test 7.1: Black Background
**Query**: "Display 1CRN with a black background"

**Expected Result**:
- Pure black background
- Good contrast with molecular structure
- No background artifacts

#### Test 7.2: Custom Background Color
**Query**: "Show ethanol with a blue background"

**Expected Result**:
- Blue background color applied
- Structure clearly visible against background

---

### 🔹 **8. Caching and Performance Tests**

#### Test 8.1: Cache Hit Test
**Steps**:
1. Display "1CRN with stick representation"
2. Display "1CRN with sphere representation" 
3. Return to "1CRN with stick representation"

**Expected Result**:
- First load: Fresh fetch from PDB
- Second load: Fresh render (different options)
- Third load: "Using cached data" message
- Fast loading on cache hit

#### Test 8.2: Cache Key Uniqueness
**Steps**:
1. Display "CCO as sticks with white background"
2. Display "CCO as sticks with black background"

**Expected Result**:
- Two different cache entries
- Both rendered independently
- Different visual appearances

---

### 🔹 **9. Error Handling Tests**

#### Test 9.1: Invalid PDB ID
**Query**: "Show PDB XXXX"

**Expected Result**:
- Clear error message
- Retry button available
- No crash or infinite loading

#### Test 9.2: Invalid SMILES
**Query**: "Display SMILES XYZ123"

**Expected Result**:
- RDKit validation error
- Informative error message
- Graceful failure

#### Test 9.3: Network Error Recovery
**Steps**:
1. Disconnect network
2. Try to load new PDB structure
3. Reconnect network
4. Click retry

**Expected Result**:
- Network error caught and displayed
- Retry functionality works
- Successful load after reconnection

---

### 🔹 **10. Complex Multi-Option Tests**

#### Test 10.1: Full Feature Test
**Query**: "Display PDB 2HHB with cartoon representation, chain coloring, Van der Waals surface at 30% opacity, residue labels enabled, and black background"

**Expected Result**:
- All options applied correctly
- Complex visualization renders successfully
- Performance remains acceptable
- All features visible and functional

#### Test 10.2: Region Selection + Surface
**Query**: "Show 1CRN with chain A as spheres in red, rest as cartoon, plus molecular surface"

**Expected Result**:
- Chain A as red spheres
- Other chains as cartoon
- Molecular surface overlaid
- Complex selection logic works

---

## 🔧 **Performance Benchmarks**

### Timing Expectations
- **Small molecule (CCO)**: < 2 seconds initial load
- **Small protein (1CRN)**: < 3 seconds initial load  
- **Large protein (2HHB)**: < 5 seconds initial load
- **Cache hits**: < 500ms render time

### Memory Usage
- **Peak memory**: < 100MB for typical molecules
- **Cache size**: Monitor for reasonable limits
- **Memory leaks**: No continuous growth on multiple loads

---

## 🐛 **Known Issues & Limitations**

### Current Limitations
1. **Selection syntax**: Limited to basic patterns (chain, resi, ligand)
2. **Surface types**: May not be available for all molecule types
3. **Label positioning**: May overlap in dense structures
4. **Performance**: Large proteins (>1000 residues) may be slow

### Expected Improvements
1. Enhanced selection parser for complex 3Dmol syntax
2. Better label positioning algorithms
3. Progressive loading for large structures
4. WebGL performance optimizations

---

## 📊 **Test Results Tracking**

| Test Case | Status | Notes | Date |
|-----------|--------|-------|------|
| 1.1 Basic Stick | ⚪ | | |
| 1.2 Advanced Trigger | ⚪ | | |
| 2.1 Sphere | ⚪ | | |
| 2.2 Line | ⚪ | | |
| 2.3 Ball-Stick | ⚪ | | |
| 2.4 Cartoon | ⚪ | | |
| 2.5 Surface | ⚪ | | |
| 3.1 Chain Colors | ⚪ | | |
| 3.2 SS Colors | ⚪ | | |
| 3.3 Spectrum | ⚪ | | |
| 4.1 VDW Surface | ⚪ | | |
| 4.2 SAS Surface | ⚪ | | |
| 4.3 Surface+Stick | ⚪ | | |
| 5.1 Chain Select | ⚪ | | |
| 5.2 Residue Range | ⚪ | | |
| 5.3 Ligand Highlight | ⚪ | | |
| 6.1 Atom Labels | ⚪ | | |
| 6.2 Residue Labels | ⚪ | | |
| 7.1 Black BG | ⚪ | | |
| 7.2 Custom BG | ⚪ | | |
| 8.1 Cache Hit | ⚪ | | |
| 8.2 Cache Keys | ⚪ | | |
| 9.1 Invalid PDB | ⚪ | | |
| 9.2 Invalid SMILES | ⚪ | | |
| 9.3 Network Error | ⚪ | | |
| 10.1 Full Features | ⚪ | | |
| 10.2 Complex Select | ⚪ | | |

**Legend**: ✅ Pass | ❌ Fail | ⚪ Not Tested | ⚠️ Issues

---

## 🚀 **Next Steps**

After completing Phase 1 testing:

1. **Fix any identified issues**
2. **Performance optimization** based on benchmark results
3. **Move to Phase 2**: Implement dedicated protein visualization tool
4. **Enhanced error handling** for edge cases found during testing
5. **Documentation updates** based on real-world usage patterns

---

This comprehensive test suite ensures the advanced molecular visualization features work reliably across various use cases and edge conditions. 