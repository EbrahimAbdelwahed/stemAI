# Quick Visualization Test Runner

## Quick Test Commands

Copy and paste these commands into the STEM AI Assistant chat to test the new advanced molecular visualization features.

### 🟢 **Basic Tests**

```
1. Show me the 3D structure of ethanol using SMILES CCO
```

```
2. Display PDB 1CRN using sphere representation
```

```  
3. Show ethanol CCO as spheres with a black background
```

### 🟡 **Advanced Features Tests**

```
4. Display PDB 2HHB with cartoon representation and chain coloring
```

```
5. Show 1CRN with Van der Waals surface at 70% opacity
```

```
6. Display ethanol CCO with atom labels enabled
```

### 🔴 **Complex Multi-Feature Tests**

```
7. Display PDB 2HHB with cartoon representation, chain coloring, and black background
```

```
8. Show 1CRN with surface representation and residue labels enabled
```

```
9. Display PDB 1CRN using ball-and-stick representation with spectrum coloring
```

### 🔧 **Error Handling Tests**

```
10. Show PDB INVALID
```

```
11. Display SMILES XYZ123ABC
```

## Expected Results Quick Check

| Test | Expected Viewer | Key Features |
|------|----------------|--------------|
| 1 | Simple3DMolViewer | Basic stick, white background |
| 2 | Advanced3DMolViewer | Spheres visible |
| 3 | Advanced3DMolViewer | Spheres + black background |
| 4 | Advanced3DMolViewer | Cartoon + chain colors |
| 5 | Advanced3DMolViewer | Surface overlay |
| 6 | Advanced3DMolViewer | Atom labels visible |
| 7 | Advanced3DMolViewer | Multiple advanced features |
| 8 | Advanced3DMolViewer | Surface + labels |
| 9 | Advanced3DMolViewer | Ball-stick + coloring |
| 10 | Error | Clear error message |
| 11 | Error | RDKit validation error |

## Console Logs to Check

- `[ChatMessages] displayMolecule3D advanced check: { hasAdvancedOptions: true/false }`
- `[Advanced3DMolViewer] Starting fresh initialization`
- `[Simple3DMolViewer] Starting fresh initialization`
- Look for error messages and cache hit indicators

## Performance Notes

- First load of each molecule: ~2-5 seconds
- Cached loads: <500ms
- Complex visualizations may take longer
- Monitor browser console for any errors 