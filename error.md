[10:40:02.925] Running build in Washington, D.C., USA (East) – iad1
[10:40:02.925] Build machine configuration: 2 cores, 8 GB
[10:40:02.941] Cloning github.com/EbrahimAbdelwahed/stemAI (Branch: surface, Commit: 03d5383)
[10:40:03.396] Cloning completed: 454.000ms
[10:40:03.442] Found .vercelignore
[10:40:03.448] Removed 4 ignored files defined in .vercelignore
[10:40:07.349] Restored build cache from previous deployment (EojvnGU2UimUvoGKmJX4gDL9pRkZ)
[10:40:08.085] Running "vercel build"
[10:40:08.662] Vercel CLI 42.2.0
[10:40:08.967] Running "install" command: `npm install`...
[10:40:11.148] 
[10:40:11.149] up to date, audited 983 packages in 2s
[10:40:11.149] 
[10:40:11.150] 315 packages are looking for funding
[10:40:11.150]   run `npm fund` for details
[10:40:11.151] 
[10:40:11.152] 3 moderate severity vulnerabilities
[10:40:11.152] 
[10:40:11.152] To address all issues (including breaking changes), run:
[10:40:11.153]   npm audit fix --force
[10:40:11.153] 
[10:40:11.153] Run `npm audit` for details.
[10:40:11.184] Detected Next.js version: 15.3.2
[10:40:11.185] Running "npm run build"
[10:40:11.303] 
[10:40:11.304] > stemai@1.0.0 prebuild
[10:40:11.304] > echo 'Starting production build - test files will be ignored'
[10:40:11.304] 
[10:40:11.309] Starting production build - test files will be ignored
[10:40:11.310] 
[10:40:11.310] > stemai@1.0.0 build
[10:40:11.311] > NODE_ENV=production next build
[10:40:11.311] 
[10:40:12.110]    ▲ Next.js 15.3.2
[10:40:12.113] 
[10:40:12.184]    Creating an optimized production build ...
[10:41:13.381]  ✓ Compiled successfully in 60s
[10:41:13.391]    Linting and checking validity of types ...
[10:41:23.299] 
[10:41:23.299] Failed to compile.
[10:41:23.299] 
[10:41:23.299] ./app/analytics/page.tsx
[10:41:23.299] 4:10  Warning: 'calculatePerformanceScore' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.299] 
[10:41:23.299] ./app/api/chat/route.ts
[10:41:23.299] 397:67  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.300] 572:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.300] 573:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.300] 597:100  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.300] 
[10:41:23.300] ./app/api/chat/visualization_tools.ts
[10:41:23.300] 12:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.300] 98:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.300] 139:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.301] 181:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.301] 208:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.301] 235:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.301] 273:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.301] 
[10:41:23.301] ./app/api/conversations/[id]/route.ts
[10:41:23.302] 66:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.302] 
[10:41:23.302] ./app/api/db/test/route.ts
[10:41:23.302] 5:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.303] 10:11  Warning: 'userCount' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.303] 13:11  Warning: 'conversationCount' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.303] 
[10:41:23.303] ./app/api/documents/route.ts
[10:41:23.303] 87:18  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.303] 
[10:41:23.304] ./app/api/performance/route.ts
[10:41:23.304] 17:16  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.304] 
[10:41:23.304] ./app/api/visualize/route.ts
[10:41:23.304] 1:28  Warning: 'req' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.305] 
[10:41:23.305] ./app/chat/[id]/page.tsx
[10:41:23.305] 10:10  Warning: 'Card' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.306] 11:10  Warning: 'Typography' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.306] 33:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.306] 34:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.307] 35:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.307] 42:17  Warning: 'session' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.307] 75:78  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.307] 104:6  Warning: React Hook useEffect has a missing dependency: 'setMessages'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[10:41:23.307] 163:5  Warning: 'reload' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.308] 165:12  Warning: 'chatError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.308] 167:5  Warning: 'append' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.313] 
[10:41:23.314] ./app/chat/page.tsx
[10:41:23.314] 84:6  Warning: React Hook useCallback has unnecessary dependencies: 'chatId' and 'realDataCollector'. Either exclude them or remove the dependency array.  react-hooks/exhaustive-deps
[10:41:23.314] 92:5  Warning: 'reload' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.316] 
[10:41:23.316] ./app/debug-mol/page.tsx
[10:41:23.316] 202:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.319] 
[10:41:23.322] ./app/generate/page.tsx
[10:41:23.323] 61:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.323] 
[10:41:23.323] ./app/test-3dmol/page.tsx
[10:41:23.323] 7:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.323] 96:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.323] 
[10:41:23.323] ./components/ChatMessages.tsx
[10:41:23.323] 63:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.324] 64:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.337] 65:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.338] 65:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.338] 66:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.338] 67:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.339] 68:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.339] 73:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.339] 76:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.339] 82:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.339] 85:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.340] 88:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.340] 198:62  Warning: 'toolIndex' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.340] 252:23  Warning: 'toolResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.341] 
[10:41:23.341] ./components/NavBar.tsx
[10:41:23.341] 6:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.341] 
[10:41:23.342] ./components/SplitPane.tsx
[10:41:23.342] 68:6  Warning: React Hook useEffect has missing dependencies: 'onMouseMove' and 'onMouseUp'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[10:41:23.342] 
[10:41:23.342] ./components/StreamingMarkdownRenderer.tsx
[10:41:23.342] 99:13  Warning: 'blockHash' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.343] 
[10:41:23.343] ./components/layout/Sidebar.tsx
[10:41:23.343] 45:5  Warning: 'createConversation' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.343] 48:5  Warning: 'searchConversations' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.344] 
[10:41:23.344] ./components/tool-results/ToolResultCard.tsx
[10:41:23.344] 5:10  Warning: 'ToolLoadingState' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.344] 5:28  Warning: 'TypingIndicator' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.344] 
[10:41:23.347] ./components/ui/button.tsx
[10:41:23.347] 97:3  Warning: 'size' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.347] 
[10:41:23.348] ./components/visualizations/Advanced3DMolViewer.tsx
[10:41:23.348] 8:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.348] 31:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.348] 49:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.349] 101:9  Warning: 'moleculeKey' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.349] 189:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.349] 277:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.349] 287:6  Warning: React Hook useEffect has missing dependencies: 'backgroundColor', 'cachedMolecule', 'colorScheme', 'identifier', 'identifierType', 'renderAdvancedMolecule', 'renderFromCache', 'representationStyle', 'selections', 'showLabels', 'showSurface', 'surfaceOpacity', 'surfaceType', and 'wasSuccessfullyRendered'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[10:41:23.349] 351:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.350] 363:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.350] 368:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.350] 
[10:41:23.352] ./components/visualizations/MatterSimulator.tsx
[10:41:23.353] 66:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.353] 67:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.353] 85:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.353] 169:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.360] 169:49  Warning: 'cw' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.360] 169:61  Warning: 'ch' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.361] 230:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.361] 233:9  Warning: 'type' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.361] 245:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.361] 405:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.362] 
[10:41:23.362] ./components/visualizations/MolStarWrapper.tsx
[10:41:23.362] 6:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.362] 11:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.363] 112:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.363] 120:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.363] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.363] 230:25  Warning: Assignments to the 'inputType' variable from inside React Hook useEffect will be lost after each render. To preserve the value over time, store it in a useRef Hook and keep the mutable value in the '.current' property. Otherwise, you can move this variable directly inside useEffect.  react-hooks/exhaustive-deps
[10:41:23.363] 317:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.364] 
[10:41:23.364] ./components/visualizations/Molecule2DDepiction.tsx
[10:41:23.364] 5:30  Warning: 'props' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.364] 5:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.364] 
[10:41:23.365] ./components/visualizations/Molecule3DViewer.tsx
[10:41:23.365] 12:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.365] 100:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.365] 325:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.366] 342:6  Warning: React Hook useEffect has missing dependencies: 'identifier', 'identifierType', 'loadRDKit', and 'processSMILES'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[10:41:23.366] 
[10:41:23.366] ./components/visualizations/PlotlyPlotter.tsx
[10:41:23.366] 119:22  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.367] 164:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.367] 
[10:41:23.367] ./components/visualizations/Simple3DMolViewer.tsx
[10:41:23.367] 8:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.367] 64:9  Warning: 'moleculeKey' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.368] 148:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.368] 226:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.368] 236:6  Warning: React Hook useEffect has missing dependencies: 'cachedMolecule', 'identifier', 'identifierType', 'renderFromCache', 'representationStyle', and 'wasSuccessfullyRendered'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[10:41:23.368] 296:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.369] 307:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.369] 
[10:41:23.369] ./lib/ai/molecular-search.ts
[10:41:23.369] 3:14  Warning: 'like' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.369] 
[10:41:23.370] ./lib/ai/smart-rag-cache.ts
[10:41:23.370] 94:19  Warning: 'hash' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.379] 
[10:41:23.379] ./lib/ai/tools/physicsSimulationTool.ts
[10:41:23.380] 147:51  Warning: 'config' is defined but never used.  @typescript-eslint/no-unused-vars
[10:41:23.380] 147:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.380] 193:69  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.380] 194:67  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.380] 195:77  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.381] 197:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.381] 
[10:41:23.381] ./lib/analytics/api-monitoring.ts
[10:41:23.381] 86:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.382] 158:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.382] 164:11  Warning: 'messageLength' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.382] 165:11  Warning: 'model' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.382] 184:15  Warning: 'tokenCount' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.383] 185:15  Warning: 'toolCalls' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.383] 202:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.383] 242:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.383] 
[10:41:23.384] ./lib/analytics/api-performance-middleware.ts
[10:41:23.384] 10:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.384] 63:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.384] 108:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.385] 117:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.385] 
[10:41:23.385] ./lib/analytics/migration-bridge.ts
[10:41:23.385] 16:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.385] 170:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.386] 
[10:41:23.386] ./lib/analytics/real-data-collector.ts
[10:41:23.386] 345:28  Warning: '_timeRangeHours' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[10:41:23.386] 
[10:41:23.387] ./lib/analytics/vercel-config.ts
[10:41:23.387] 108:8  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.387] 136:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.387] 141:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.388] 
[10:41:23.388] ./lib/cache/browser-cache.ts
[10:41:23.388] 10:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.388] 20:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.389] 
[10:41:23.389] ./lib/db/conversations.ts
[10:41:23.389] 17:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.389] 18:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.389] 19:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.390] 25:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.390] 26:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.390] 
[10:41:23.390] ./lib/db/index.ts
[10:41:23.391] 5:10  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.391] 
[10:41:23.391] ./lib/pdf-parse-clean.js
[10:41:23.391] 4:13  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
[10:41:23.392] 
[10:41:23.392] ./lib/performance/monitor.ts
[10:41:23.392] 6:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.392] 25:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.392] 29:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.393] 63:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.393] 85:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.393] 227:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.393] 253:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.394] 
[10:41:23.394] ./lib/performance/optimization.ts
[10:41:23.394] 17:61  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.394] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.394] 102:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.395] 109:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.395] 110:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.395] 123:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.395] 313:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.395] 313:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.396] 326:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.396] 326:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.396] 
[10:41:23.396] ./lib/utils.ts
[10:41:23.396] 25:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.397] 25:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[10:41:23.397] 
[10:41:23.397] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[10:41:23.483] Error: Command "npm run build" exited with 1
[10:41:23.890] 
[10:41:26.953] Exiting build container