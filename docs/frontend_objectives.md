Understood! Let's integrate the details of the updated `app/api/chat/route.ts` (which now handles both call types and the visualization signal via `StreamData`) into our comprehensive summary.

This will be a complete, low-level summary reflecting all decisions and the current state of the planned backend implementation.

**Project Goal:** STEM AI Assistant with advanced visualizations (plots, physics, molecules), RAG, multi-LLM support, and a refined UX for visualization generation.

**I. Core LLM Interaction & Visualization Pipeline (Two-Stage with `StreamData` Signal):**

1.  **User Query:** Submitted to frontend.
2.  **Frontend Request:** `POST /api/chat` with `messages` and `requestOptions: { callType: 'text_generation' }`.
3.  **Backend (`/api/chat/route.ts` - `callType: 'text_generation' - 1st LLM Call`):**
    *   **RAG:** Performs document search via `searchDocuments` if a user message exists; prepends findings to system prompt.
    *   **System Prompt Construction:**
        *   Base system prompt from `getModelConfig(model, 'chat')`.
        *   Appends RAG context.
        *   Appends instruction for LLM: "If a visual representation (...) is relevant (...), include the special token `[NEEDS_VISUALIZATION:{\"type\":\"<viz_tool_name>\", \"details\": \"<parameters_or_description_for_viz>\"}]` in your response. `<viz_tool_name>` should be one of: `plotFunctionTool, physicsSimulationTool, moleculeViewerTool`." (Dynamically lists available tools).
    *   **`streamText` Invocation:**
        *   Uses constructed `system` prompt, `messages`, and configured `model`.
        *   `maxSteps: 1` (to prevent tool use by LLM in this text-focused call, other than emitting the signal).
        *   **`StreamData` Initialization:** `const streamData = new StreamData();`
        *   **`onFinish` Callback:**
            *   Receives final `text` from LLM.
            *   Regex `vizSignalRegex = /\[NEEDS_VISUALIZATION:({.*?})\]/g` parses this `text` to find signal(s).
            *   If signal(s) found, parses the JSON details.
            *   Appends the (first) parsed signal to `streamData`: `streamData.append({ visualizationSignal: parsedSignalObject });`.
            *   Closes `streamData`: `streamData.close();`.
    *   **Response:** Returns `result.toDataStreamResponse({ data: streamData })`.
        *   **Note:** The raw `[NEEDS_VISUALIZATION:{...}]` token will still be present in the main text stream parts (`text-delta`).
4.  **Frontend (`ChatPage.tsx` using `useChat` and `ChatMessages.tsx`):**
    *   **Message Processing (`useChat`'s `messages` & `data`):**
        *   Receives text stream parts and separate `StreamData` chunks.
        *   When a `StreamData` chunk with `visualizationSignal` arrives:
            *   Store `visualizationSignal.type` and `visualizationSignal.details` in local `pendingVisualizations` state (associated with the assistant's `message.id`), status `'pending'/'loading'`.
    *   **Message Rendering (`ChatMessages.tsx`):**
        *   **Clean Text:** Display assistant's textual content AFTER filtering out any raw `[NEEDS_VISUALIZATION:{...}]` tokens using a regex.
        *   **Informative Placeholder:** If `pendingVisualizations[message.id]` status is `'loading'` or `'pending'`, render `<PendingVisualizationCard vizType={signal.type} detailsSummary={...} />`.
    *   **Trigger 2nd LLM Call:** Logic in `ChatPage.tsx` (on `visualizationSignal` detection) makes a new `POST /api/chat`.
        *   **Request Body:** `messages` (can be minimal or context-specific), `requestOptions: { callType: 'visualization_generation', visualizationTask: { type: <toolNameFromSignal>, details: <detailsFromSignal>, originalQuery: <...>, previousResponse: <cleaned1stResponseText> } }`.
5.  **Backend (`/api/chat/route.ts` - `callType: 'visualization_generation' - 2nd LLM Call`):**
    *   Validates `requestOptions.visualizationTask`.
    *   Identifies `selectedTool` from `allVisualizationTools` map using `visualizationTask.type`.
    *   **`toolCallMessages` Construction:** Creates a focused prompt for the LLM (e.g., "Original user query: '...', Assistant's previous response: '...'. Generate params for `<toolName>` with details: `<task.details>`.").
    *   **`streamText` Invocation for Tool Use:**
        *   Uses `modelConfig(model, 'chat')` or a specialized tool-usage model.
        *   Passes `toolCallMessages`.
        *   `tools: { [selectedTool.name]: selectedTool }`.
        *   `toolChoice: { type: 'tool', toolName: selectedTool.name }` (to force specific tool).
    *   **Stream Processing:**
        *   Iterates `result.fullStream` once, collecting `tool-result` (for the selected tool), `error` parts, and `text-delta` parts.
    *   **Response Logic:**
        *   If `tool-result` (containing `{ vizType, params, description }` from tool's `execute`) is found:
            *   `return NextResponse.json(toolResultObject);`
        *   Else (no tool result):
            *   Construct error message from collected `error` parts or unexpected `text` parts.
            *   `return NextResponse.json({ error: errorMessage }, { status: 500 });`
6.  **Frontend (`ChatPage.tsx` updating `pendingVisualizations`):**
    *   Receives JSON response from 2nd call.
    *   Updates `pendingVisualizations[message.id]` status to `'success'` (with `generatedParams`, `vizTypeFromAPI`, `descriptionFromAPI`) or `'error'`.
7.  **Frontend (`ChatMessages.tsx` re-rendering):**
    *   `PendingVisualizationCard` is replaced by the actual lazy-loaded visualization component OR an error display.

**II. Backend AI Tools (`lib/ai/tools/*.ts`):**

*   Each tool file exports a tool object: `{ name, description, schema, execute }`.
*   `allVisualizationTools` map in `chat/route.ts` for dynamic access.
*   **`plotFunctionTool`:**
    *   **Schema (`plotFunctionToolSchema`):** `functionString` (string, math.js syntax), `variables` (array of {name, range:[min,max]}), `plotType` (enum: 'scatter', 'line', 'surface', 'contour'), `title` (optional string).
    *   **`execute`:** Returns `{ vizType: 'plotly', params: <validatedParams>, description: <generatedString> }`.
*   **`physicsSimulationTool`:** [DONE - Basic schema and execute implemented in `lib/ai/tools/physicsSimulationTool.ts`]
    *   **Schema (`physicsSimulationToolSchema`):** `simulationType` (enum: 'falling_objects', 'pendulum', 'custom_matter_js_setup'), `initialConditions` (nested object for objects, pendulum specifics, or `customSetupInstructions` string), `constants` (optional: gravity, timeScale), `simulationDuration`, `title`.
    *   **`execute`:** Returns `{ vizType: 'matterjs', params: <validatedParams>, description: <generatedString> }`.
*   **`moleculeViewerTool`:** [DONE - Basic schema and execute implemented in `lib/ai/tools/moleculeViewerTool.ts`]
    *   **Schema (`moleculeViewerToolSchema`):** `identifierType` (enum: 'smiles', 'inchi', 'inchikey', 'name', 'cid'), `identifier` (string), `representationStyle` (optional enum, default 'stick'), `colorScheme` (optional enum, default 'element'), `title`.
    *   **`execute`:** Returns `{ vizType: 'molecule3d', params: <validatedParams>, description: <generatedString> }`. (TODO: Future identifier resolution logic).

**III. Frontend Visualization Components (`components/visualizations/`):**

*   **`PlotlyPlotter.tsx`:** Lib: `react-plotly.js` + `mathjs`.
*   **`MatterSimulator.tsx`:** Lib: `matter-js`.
*   **`Molecule3DViewer.tsx`:** Lib: `3dmol.js` (initial) -> `Mol*`. Uses `RDKit.js`.
*   **`Molecule2DDepiction.tsx`:** Lib: `RDKit.js`.
*   **`PendingVisualizationCard.tsx`:** Displays loading/info for pending viz.
*   **`VisualizationErrorBoundary.tsx`:** Wraps viz components.
*   Lazy loading (`React.lazy()`, `React.Suspense`).

**IV. Molecule Handling:**

*   **LLM I/O:** **SMILES**.
*   **Canonical Storage:** **InChI/InChIKey** & **canonical SMILES** in DB.
*   **`RDKit.js`:** Client-side for SMILES validation, canonicalization, coord gen.

**V. RAG for Molecules/Proteins:**

*   **Table: `known_molecules` (Supabase):** `primary_name`, `canonical_smiles`, `inchi`, `inchikey`, `synonyms`, `description`, `embedding`.
*   **Query Flow:** Embed user query -> vector search -> context for 1st LLM call.
*   **Disambiguation:** LLM tool `disambiguateMoleculeTool` if needed.

**VI. Database:**

*   **Platform:** **Supabase** (PostgreSQL + `vector` extension).

**VII. Dependencies to Install:**

*   `react-plotly.js plotly.js`, `mathjs`, `matter-js`, `3dmol` (or `molstar`), `@rdkit/rdkit`, `zod`.

This detailed summary now reflects the sophisticated two-part API structure, the `StreamData` mechanism for signaling, and the responsibilities of each part of the system.