# Test Cases for New Plotting Tools

## Test Case 1: 2D Function Plotting
**Query:** "Plot sin(x) from -π to π"
**Expected Tool:** plotFunction2D
**Expected Parameters:**
```json
{
  "functionString": "sin(x)",
  "variable": {
    "name": "x",
    "range": [-3.14159, 3.14159]
  },
  "plotType": "line",
  "title": "Plot of sin(x)"
}
```

## Test Case 2: 3D Function Plotting
**Query:** "Show me a 3D surface plot of sin(x) * cos(y) for x and y from -5 to 5"
**Expected Tool:** plotFunction3D
**Expected Parameters:**
```json
{
  "functionString": "sin(x) * cos(y)",
  "variables": [
    {"name": "x", "range": [-5, 5]},
    {"name": "y", "range": [-5, 5]}
  ],
  "plotType": "surface",
  "title": "3D Plot of sin(x) * cos(y)"
}
```

## Test Case 3: 2D Scatter Plot
**Query:** "Plot x^2 as a scatter plot from -3 to 3"
**Expected Tool:** plotFunction2D
**Expected Parameters:**
```json
{
  "functionString": "x^2",
  "variable": {
    "name": "x",
    "range": [-3, 3]
  },
  "plotType": "scatter",
  "title": "Plot of x^2"
}
```

## Implementation Status
- ✅ Added plotFunction2D tool to visualization_tools.ts
- ✅ Added plotFunction3D tool to visualization_tools.ts  
- ✅ Updated ChatMessages.tsx to handle new tools
- ✅ Updated system prompt with plotting instructions
- ✅ Both tools return exactly what PlotlyPlotter expects as props
- ✅ Following successful displayMolecule3D pattern

## Next Steps
1. Test with development server
2. Remove this temporary file
3. Verify all tools work correctly 