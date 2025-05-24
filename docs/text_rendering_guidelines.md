# Text Rendering Guidelines for STEM AI Assistant

## Overview

The STEM AI Assistant features a comprehensive text rendering system designed specifically for STEM content, providing beautiful mathematical expressions, syntax-highlighted code, and well-formatted markdown content.

## Architecture

### Core Components

1. **MarkdownRenderer** (`components/MarkdownRenderer.tsx`)
   - Handles all markdown and LaTeX rendering
   - Optimized for STEM content with enhanced math styling
   - Supports code syntax highlighting with copy functionality

2. **MathInput** (`components/MathInput.tsx`)
   - Interactive LaTeX expression builder
   - Live preview functionality
   - Common mathematical expressions library

3. **Enhanced ChatInput** (`components/ChatInput.tsx`)
   - Integrated math input and preview features
   - Markdown preview capabilities
   - User-friendly toolbar interface

### System Prompt Integration

The LLM system prompt includes comprehensive formatting guidelines that instruct models to:
- Use proper LaTeX notation for all mathematical expressions
- Structure content with clear markdown formatting
- Follow STEM-specific writing conventions
- Provide visually appealing and educational content

## Mathematical Expression Rendering

### Inline Math
Use single dollar signs (`$...$`) for mathematical expressions within text:

```markdown
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ and it solves quadratic equations.
```

**Rendered Output**: The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ and it solves quadratic equations.

### Block Math
Use double dollar signs (`$$...$$`) for standalone mathematical expressions:

```markdown
The Schrödinger equation:

$$i\hbar\frac{\partial}{\partial t}\Psi(\mathbf{r},t) = \hat{H}\Psi(\mathbf{r},t)$$
```

**Visual Features**:
- Enhanced styling with gradient backgrounds
- Proper spacing and centering
- Border highlighting for emphasis
- Dark mode support

### Common Mathematical Elements

| Element | LaTeX Code | Example |
|---------|------------|---------|
| Fractions | `\frac{a}{b}` | $\frac{a}{b}$ |
| Square Root | `\sqrt{x}` | $\sqrt{x}$ |
| Subscript | `x_1` | $x_1$ |
| Superscript | `x^2` | $x^2$ |
| Greek Letters | `\alpha, \beta, \gamma` | $\alpha, \beta, \gamma$ |
| Integrals | `\int_a^b f(x) dx` | $\int_a^b f(x) dx$ |
| Derivatives | `\frac{d}{dx}` | $\frac{d}{dx}$ |

## Code Syntax Highlighting

### Supported Languages

The system automatically detects and highlights syntax for major programming languages:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

### Features

- **Copy to Clipboard**: Hover over code blocks to reveal copy button
- **Theme Support**: Automatic dark/light theme switching
- **Language Detection**: Automatic syntax highlighting based on language tags
- **Custom Styling**: Enhanced visual appearance with proper spacing

## Content Structure Guidelines

### Headers
Use proper hierarchy for clear organization:

```markdown
# Main Topic (H1)
## Major Section (H2)
### Subsection (H3)
```

### Lists
Format information clearly with proper spacing:

```markdown
**Unordered Lists**:
- First item
- Second item
  - Nested item
  - Another nested item

**Ordered Lists**:
1. Step one
2. Step two
3. Step three
```

### Tables
Create responsive tables with enhanced styling:

```markdown
| Property | Symbol | Unit | Description |
|----------|--------|------|-------------|
| Velocity | $v$ | m/s | Rate of change of position |
| Acceleration | $a$ | m/s² | Rate of change of velocity |
```

### Blockquotes
Use for important notes or quotes:

```markdown
> This is an important concept that students should remember.
> Mathematical notation helps express complex ideas clearly.
```

## Interactive Features

### Math Input Interface

The MathInput component provides:
- **Live Preview**: Real-time rendering of LaTeX expressions
- **Common Expressions**: Quick access to frequently used mathematical notation
- **Mode Selection**: Toggle between inline and block math modes
- **Insert Functionality**: Seamless integration with chat input

### Preview Functionality

The preview system allows users to:
- See how their markdown will render before sending
- Check mathematical expressions for accuracy
- Verify proper formatting and structure

## Performance Optimizations

### Dynamic Loading
- Heavy components are loaded only when needed
- Reduces initial bundle size
- Improves page load performance

### Memoization
- MarkdownRenderer uses React.memo for efficient re-rendering
- Content processing is memoized for performance
- State management optimized for smooth user experience

### Error Handling
- Graceful handling of invalid LaTeX expressions
- Fallback rendering for unsupported content
- Clear error messages for debugging

## Accessibility Features

### WCAG Compliance
- Proper color contrast ratios
- Keyboard navigation support
- Screen reader compatibility
- Semantic HTML structure

### User Experience
- Clear visual feedback for interactive elements
- Intuitive icons and tooltips
- Responsive design for all screen sizes
- Touch-friendly interface on mobile devices

## Development Guidelines

### Adding New Mathematical Notation
To add support for new LaTeX commands:

1. Update the system prompt with examples
2. Test rendering in MarkdownRenderer
3. Add to MathInput common expressions if frequently used
4. Update documentation

### Customizing Styling
Math expression styling can be customized by modifying:
- `components/MarkdownRenderer.tsx` - React component styling
- `app/globals.css` - Global KaTeX and prose styles
- Tailwind classes for specific elements

### Testing
Always test new features with:
- Various mathematical expressions
- Different content types (physics, chemistry, mathematics)
- Both inline and block math
- Dark and light themes
- Mobile and desktop viewports

## Troubleshooting

### Common Issues

1. **Math not rendering**: Check LaTeX syntax and delimiters
2. **Code not highlighting**: Verify language specification in code blocks
3. **Performance issues**: Check for memory leaks in dynamic components
4. **Styling problems**: Verify Tailwind classes and CSS imports

### Debug Tools
- Browser developer tools for CSS debugging
- React DevTools for component inspection
- Console logs for error identification
- Network tab for asset loading issues

## Future Enhancements

### Planned Features
- Advanced mathematical notation support
- Interactive mathematical visualizations
- Export functionality for mathematical content
- Collaborative editing features
- Custom LaTeX macro support

### Extension Points
The system is designed to be extensible:
- Plugin architecture for new content types
- Customizable rendering components
- Theming system for different visual styles
- Integration with external mathematical tools

## Conclusion

The enhanced text rendering system provides a robust foundation for STEM education content. By following these guidelines, developers can maintain and extend the system while ensuring optimal user experience for mathematical and scientific content.

For technical support or feature requests, refer to the implementation files and test documentation in the `tests/` directory. 