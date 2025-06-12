# Implementation Plan: Adding o4-mini with Reasoning Traces

## UNDERSTAND Phase: Request Analysis

### Goal
Add OpenAI's o4-mini model to the STEM AI Assistant with:
- Medium reasoning effort configuration
- Raw thinking traces collection
- Thinking traces displayed as collapsible artifacts in chat
- Default collapsed state for clean UI

### Current Architecture Analysis

#### Model Selector Components
- **Primary**: `components/ModelSelector.tsx` - Main dropdown component
- **Secondary**: `components/ui/Navigation.tsx` - Simple select element
- **Tertiary**: `components/NavBar.tsx` - Another select implementation
- **Chat Input**: `components/ChatInput.tsx` - Model selector integration

#### API Configuration
- **Route**: `app/api/chat/route.ts` - Main chat API with model configuration
- **Function**: `getModelConfig()` - Central model configuration logic
- **Current Models**: grok-3-mini, gemini-1.5-flash-latest, gpt-4o, claude-3-haiku-20240307

#### Artifact System
- **Tool Results**: `components/tool-results/ToolResultCard.tsx` - Existing artifact container
- **Renderer**: `components/chat/ToolResultRenderer.tsx` - Tool result rendering logic
- **Container**: `components/chat/ToolResultContainer.tsx` - Tool result management

### Requirements Analysis
1. **Model Integration**: Add o4-mini to all model selector components
2. **API Configuration**: Configure o4-mini with medium reasoning effort
3. **Thinking Traces**: Capture and store raw thinking traces
4. **Artifact Display**: Create new artifact type for thinking traces
5. **UI/UX**: Default collapsed state with expand/collapse functionality

## PLAN Phase: Implementation Strategy

### Step 1: Model Type Definition Updates
**Files to Modify:**
- `components/ModelSelector.tsx`
- `components/ui/Navigation.tsx` 
- `components/NavBar.tsx`
- `components/ChatInput.tsx`
- `app/chat/[id]/page.tsx`
- `app/chat/page.tsx`

**Changes:**
- Update `ModelType` type definition to include `'o4-mini'`
- Add o4-mini to models array with appropriate metadata

### Step 2: API Configuration Enhancement
**Files to Modify:**
- `app/api/chat/route.ts`

**Changes:**
- Add o4-mini case to `getModelConfig()` function
- Configure with `reasoningEffort: 'medium'`
- Enable thinking traces collection with `sendReasoning: true`
- Update system prompt for o4-mini specific instructions

### Step 3: Thinking Traces Artifact Component
**New Files to Create:**
- `components/chat/ThinkingTracesArtifact.tsx`
- `components/tool-results/ThinkingTracesCard.tsx`

**Features:**
- Collapsible container with thinking icon
- Raw thinking text display with proper formatting
- Metadata display (reasoning time, token count)
- Copy to clipboard functionality
- Syntax highlighting for structured thinking

### Step 4: Chat Message Integration
**Files to Modify:**
- `components/chat/ToolResultRenderer.tsx`
- `components/chat/ToolResultContainer.tsx`

**Changes:**
- Add handling for reasoning message parts
- Integrate ThinkingTracesArtifact component
- Ensure proper rendering order (thinking traces before main response)

### Step 5: UI/UX Enhancements
**Design Specifications:**
- **Icon**: 🧠 (brain emoji) for thinking traces
- **Color Scheme**: Purple/violet theme (`#8B5CF6`)
- **Default State**: Collapsed with preview text
- **Expanded State**: Full thinking trace with scroll
- **Animation**: Smooth expand/collapse transition

### Step 6: Type Safety & Error Handling
**Files to Modify:**
- `types/` directory (if exists)
- Error boundary components

**Changes:**
- Add TypeScript interfaces for reasoning data
- Implement error handling for reasoning failures
- Add fallback UI for missing thinking traces

## ACT Phase: Detailed Implementation

### 1. Model Type Updates

#### ModelSelector.tsx Changes
```typescript
type ModelType = 'grok-3-mini' | 'gemini-1.5-flash-latest' | 'gpt-4o' | 'claude-3-haiku-20240307' | 'o4-mini';

const models = [
  // ... existing models
  { 
    id: 'o4-mini', 
    name: 'o4-mini', 
    description: 'OpenAI\'s reasoning model with thinking traces',
    tag: 'Reasoning',
    performance: 'Balanced',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-400">
        <path d="M9.5 2A7.5 7.5 0 0 0 4 10c0 6 3.5 10 3.5 10s3.5-4 3.5-10a7.5 7.5 0 0 0-5.5-8Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M15.5 3A6.5 6.5 0 0 1 20 9c0 5-3 8.5-3 8.5s-3-3.5-3-8.5a6.5 6.5 0 0 1 3.5-6Z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )
  },
];
```

### 2. API Configuration

#### app/api/chat/route.ts Changes
```typescript
// Add to getModelConfig function
case 'o4-mini':
  return {
    model: openai('o4-mini'),
    system: `${baseSystem}\n\nYou are powered by o4-mini with advanced reasoning capabilities.`,
    providerOptions: {
      openai: { 
        reasoningEffort: 'medium' 
      }
    }
  };

// Update streamText call to handle reasoning
const result = await streamText({
  model: modelConfig.model,
  system: systemPromptWithContext,
  messages: messages,
  maxSteps: mode === 'generate' ? 5 : 3,
  tools: mode === 'generate' ? { 
    generateReactComponent: { /* ... */ }
  } : visualizationTools,
  ...(modelConfig.providerOptions && { providerOptions: modelConfig.providerOptions })
});

// Enable reasoning traces for o4-mini
return result.toDataStreamResponse({
  sendReasoning: modelId === 'o4-mini'
});
```

### 3. Thinking Traces Artifact Component

#### components/chat/ThinkingTracesArtifact.tsx
```typescript
interface ThinkingTracesArtifactProps {
  reasoning: string;
  reasoningDetails?: Array<{ type: 'text' | 'redacted'; text?: string }>;
  metadata?: {
    tokenCount?: number;
    reasoningTime?: number;
  };
}

export function ThinkingTracesArtifact({ 
  reasoning, 
  reasoningDetails, 
  metadata 
}: ThinkingTracesArtifactProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reasoning);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewText = reasoning.slice(0, 100) + (reasoning.length > 100 ? '...' : '');

  return (
    <div className="thinking-traces-artifact border border-purple-500/30 bg-purple-500/5 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-purple-400">🧠</span>
          <span className="text-sm font-medium text-purple-300">Thinking Traces</span>
          {metadata?.tokenCount && (
            <span className="text-xs text-purple-400/70">
              {metadata.tokenCount} tokens
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            {isExpanded ? '▼ Collapse' : '▶ Expand'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-all duration-200 ${isExpanded ? 'max-h-none' : 'max-h-20 overflow-hidden'}`}>
        {isExpanded ? (
          <pre className="text-sm text-purple-100 whitespace-pre-wrap font-mono bg-purple-900/20 p-3 rounded border border-purple-500/20 overflow-auto max-h-96">
            {reasoning}
          </pre>
        ) : (
          <p className="text-sm text-purple-200/80">
            {previewText}
          </p>
        )}
      </div>

      {/* Metadata Footer */}
      {metadata?.reasoningTime && (
        <div className="mt-3 pt-2 border-t border-purple-500/20">
          <span className="text-xs text-purple-400/70">
            Reasoning time: {metadata.reasoningTime}ms
          </span>
        </div>
      )}
    </div>
  );
}
```

### 4. Message Rendering Integration

#### components/chat/ToolResultRenderer.tsx Updates
```typescript
// Add reasoning part handling
export function ToolResultRenderer({ toolInvocation, thinkingTime = 15 }: ToolResultRendererProps) {
  // ... existing code

  // Add reasoning rendering
  if (toolInvocation.reasoning) {
    return (
      <ThinkingTracesArtifact
        reasoning={toolInvocation.reasoning}
        reasoningDetails={toolInvocation.reasoningDetails}
        metadata={{
          tokenCount: toolInvocation.reasoning.split(' ').length,
          reasoningTime: thinkingTime * 1000
        }}
      />
    );
  }

  // ... rest of existing code
}
```

### 5. Chat Message Component Updates

#### Update message rendering to handle reasoning parts
```typescript
// In chat message rendering logic
{message.parts?.map((part, index) => {
  if (part.type === 'reasoning') {
    return (
      <ThinkingTracesArtifact
        key={index}
        reasoning={part.details.map(detail => 
          detail.type === 'text' ? detail.text : '<redacted>'
        ).join('')}
        reasoningDetails={part.details}
      />
    );
  }
  // ... handle other part types
})}
```

## Implementation Timeline

### Phase 1: Core Integration (Day 1)
- [ ] Update model type definitions
- [ ] Add o4-mini to all model selectors
- [ ] Configure API with reasoning effort

### Phase 2: Thinking Traces (Day 2)
- [ ] Create ThinkingTracesArtifact component
- [ ] Integrate with message rendering
- [ ] Add proper TypeScript types

### Phase 3: UI/UX Polish (Day 3)
- [ ] Implement expand/collapse animations
- [ ] Add copy functionality
- [ ] Style consistency review
- [ ] Error handling implementation

### Phase 4: Testing & Validation (Day 4)
- [ ] Test all model selectors
- [ ] Verify reasoning traces collection
- [ ] UI/UX testing across devices
- [ ] Performance validation

## Success Criteria

1. **Functional Requirements**
   - [ ] o4-mini appears in all model selector components
   - [ ] Reasoning effort is set to medium
   - [ ] Raw thinking traces are collected and displayed
   - [ ] Artifacts default to collapsed state

2. **Technical Requirements**
   - [ ] Type safety maintained across all components
   - [ ] No breaking changes to existing functionality
   - [ ] Performance impact < 100ms additional render time
   - [ ] Memory usage increase < 5MB per conversation

3. **User Experience Requirements**
   - [ ] Intuitive expand/collapse interaction
   - [ ] Clear visual distinction for thinking traces
   - [ ] Accessible keyboard navigation
   - [ ] Responsive design on all screen sizes

## Risk Mitigation

### Potential Issues
1. **API Rate Limits**: o4-mini may have different rate limits
2. **Token Costs**: Reasoning traces increase token usage
3. **Performance**: Large thinking traces may impact UI performance
4. **Compatibility**: Ensure backward compatibility with existing chats

### Mitigation Strategies
1. **Rate Limiting**: Implement client-side rate limiting for o4-mini
2. **Cost Monitoring**: Add usage tracking and warnings
3. **Performance**: Implement virtual scrolling for large traces
4. **Compatibility**: Graceful degradation for missing reasoning data

## Next Steps

1. **Immediate**: Begin Phase 1 implementation
2. **Documentation**: Update API documentation with o4-mini details
3. **Testing**: Create comprehensive test suite for reasoning features
4. **Monitoring**: Add analytics for o4-mini usage patterns

This plan provides a comprehensive roadmap for implementing o4-mini with thinking traces while maintaining the high quality and performance standards of the STEM AI Assistant. 