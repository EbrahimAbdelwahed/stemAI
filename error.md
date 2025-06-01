[20:14:18.327] Running build in Washington, D.C., USA (East) – iad1
[20:14:18.328] Build machine configuration: 2 cores, 8 GB
[20:14:18.367] Cloning github.com/EbrahimAbdelwahed/stemAI (Branch: surface, Commit: 062337c)
[20:14:18.787] Cloning completed: 419.000ms
[20:14:21.705] Restored build cache from previous deployment (7sm8VCjuj264sy3ZsPL1gqBA3Bh9)
[20:14:22.455] Running "vercel build"
[20:14:22.884] Vercel CLI 42.2.0
[20:14:23.185] Running "install" command: `npm install`...
[20:14:25.990] 
[20:14:25.991] added 5 packages, and audited 983 packages in 2s
[20:14:25.992] 
[20:14:25.992] 315 packages are looking for funding
[20:14:25.992]   run `npm fund` for details
[20:14:25.994] 
[20:14:25.994] 3 moderate severity vulnerabilities
[20:14:25.994] 
[20:14:25.995] To address all issues (including breaking changes), run:
[20:14:25.995]   npm audit fix --force
[20:14:25.995] 
[20:14:25.996] Run `npm audit` for details.
[20:14:26.031] Detected Next.js version: 15.3.2
[20:14:26.032] Running "npm run build"
[20:14:26.153] 
[20:14:26.154] > stemai@1.0.0 build
[20:14:26.154] > next build
[20:14:26.154] 
[20:14:27.006]    ▲ Next.js 15.3.2
[20:14:27.008] 
[20:14:27.076]    Creating an optimized production build ...
[20:15:26.256]  ✓ Compiled successfully in 58s
[20:15:26.261]    Linting and checking validity of types ...
[20:15:36.039] 
[20:15:36.040] ./app/analytics/page.tsx
[20:15:36.040] 4:10  Warning: 'calculatePerformanceScore' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.041] 
[20:15:36.041] ./app/api/chat/route.ts
[20:15:36.041] 397:67  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.042] 572:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.042] 573:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.043] 597:100  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.043] 
[20:15:36.043] ./app/api/chat/visualization_tools.ts
[20:15:36.043] 12:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.044] 98:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.044] 139:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.044] 181:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.044] 208:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.045] 235:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.045] 273:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.045] 
[20:15:36.045] ./app/api/conversations/[id]/route.ts
[20:15:36.046] 66:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.046] 
[20:15:36.046] ./app/api/db/test/route.ts
[20:15:36.046] 5:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.047] 10:11  Warning: 'userCount' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.047] 13:11  Warning: 'conversationCount' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.047] 
[20:15:36.047] ./app/api/documents/route.ts
[20:15:36.048] 87:18  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.048] 
[20:15:36.048] ./app/api/performance/route.ts
[20:15:36.049] 17:16  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.049] 
[20:15:36.050] ./app/api/visualize/route.ts
[20:15:36.050] 1:28  Warning: 'req' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.050] 
[20:15:36.050] ./app/chat/[id]/page.tsx
[20:15:36.051] 10:10  Warning: 'Card' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.051] 11:10  Warning: 'Typography' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.051] 33:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.051] 34:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.052] 35:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.057] 42:17  Warning: 'session' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.058] 75:78  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.058] 104:6  Warning: React Hook useEffect has a missing dependency: 'setMessages'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:36.059] 163:5  Warning: 'reload' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.059] 165:12  Warning: 'chatError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.062] 167:5  Warning: 'append' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.062] 
[20:15:36.062] ./app/chat/page.tsx
[20:15:36.063] 84:6  Warning: React Hook useCallback has unnecessary dependencies: 'chatId' and 'realDataCollector'. Either exclude them or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:36.063] 92:5  Warning: 'reload' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.063] 
[20:15:36.063] ./app/debug-mol/page.tsx
[20:15:36.063] 202:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.064] 
[20:15:36.064] ./app/generate/page.tsx
[20:15:36.064] 61:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.064] 
[20:15:36.065] ./app/test-3dmol/page.tsx
[20:15:36.065] 7:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.065] 96:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.065] 
[20:15:36.066] ./components/ChatMessages.tsx
[20:15:36.066] 63:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.066] 64:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.066] 65:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.067] 65:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.067] 66:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.067] 67:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.067] 68:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.067] 73:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.068] 76:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.068] 82:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.068] 85:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.068] 88:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.077] 198:62  Warning: 'toolIndex' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.078] 252:23  Warning: 'toolResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.078] 
[20:15:36.079] ./components/NavBar.tsx
[20:15:36.079] 6:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.079] 
[20:15:36.079] ./components/SplitPane.tsx
[20:15:36.080] 68:6  Warning: React Hook useEffect has missing dependencies: 'onMouseMove' and 'onMouseUp'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:36.080] 
[20:15:36.080] ./components/StreamingMarkdownRenderer.tsx
[20:15:36.080] 99:13  Warning: 'blockHash' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.081] 
[20:15:36.081] ./components/layout/Sidebar.tsx
[20:15:36.081] 45:5  Warning: 'createConversation' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.081] 48:5  Warning: 'searchConversations' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.082] 
[20:15:36.082] ./components/tool-results/ToolResultCard.tsx
[20:15:36.082] 5:10  Warning: 'ToolLoadingState' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.082] 5:28  Warning: 'TypingIndicator' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.082] 
[20:15:36.083] ./components/ui/button.tsx
[20:15:36.083] 97:3  Warning: 'size' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.083] 
[20:15:36.084] ./components/visualizations/Advanced3DMolViewer.tsx
[20:15:36.084] 8:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.084] 31:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.084] 49:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.085] 101:9  Warning: 'moleculeKey' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.085] 189:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.085] 277:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.086] 287:6  Warning: React Hook useEffect has missing dependencies: 'backgroundColor', 'cachedMolecule', 'colorScheme', 'identifier', 'identifierType', 'renderAdvancedMolecule', 'renderFromCache', 'representationStyle', 'selections', 'showLabels', 'showSurface', 'surfaceOpacity', 'surfaceType', and 'wasSuccessfullyRendered'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:36.086] 351:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.086] 363:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.086] 368:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.087] 
[20:15:36.087] ./components/visualizations/MatterSimulator.tsx
[20:15:36.087] 66:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.089] 67:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.089] 85:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.089] 169:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.089] 169:49  Warning: 'cw' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.090] 169:61  Warning: 'ch' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.091] 230:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.091] 233:9  Warning: 'type' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.091] 245:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.092] 405:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.092] 
[20:15:36.092] ./components/visualizations/MolStarWrapper.tsx
[20:15:36.092] 6:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.093] 11:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.093] 112:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.093] 120:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.094] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.094] 230:25  Warning: Assignments to the 'inputType' variable from inside React Hook useEffect will be lost after each render. To preserve the value over time, store it in a useRef Hook and keep the mutable value in the '.current' property. Otherwise, you can move this variable directly inside useEffect.  react-hooks/exhaustive-deps
[20:15:36.094] 317:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.094] 
[20:15:36.095] ./components/visualizations/Molecule2DDepiction.tsx
[20:15:36.095] 5:30  Warning: 'props' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.095] 5:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.095] 
[20:15:36.096] ./components/visualizations/Molecule3DViewer.tsx
[20:15:36.096] 12:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.096] 100:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.096] 325:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.096] 342:6  Warning: React Hook useEffect has missing dependencies: 'identifier', 'identifierType', 'loadRDKit', and 'processSMILES'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:36.097] 
[20:15:36.097] ./components/visualizations/PlotlyPlotter.tsx
[20:15:36.097] 119:22  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.098] 164:17  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.098] 
[20:15:36.098] ./components/visualizations/Simple3DMolViewer.tsx
[20:15:36.098] 8:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.099] 64:9  Warning: 'moleculeKey' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.099] 148:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.099] 226:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.099] 236:6  Warning: React Hook useEffect has missing dependencies: 'cachedMolecule', 'identifier', 'identifierType', 'renderFromCache', 'representationStyle', and 'wasSuccessfullyRendered'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:36.100] 296:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.100] 307:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.100] 
[20:15:36.101] ./lib/ai/molecular-search.ts
[20:15:36.101] 3:14  Warning: 'like' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.101] 
[20:15:36.101] ./lib/ai/smart-rag-cache.ts
[20:15:36.102] 94:19  Warning: 'hash' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.102] 
[20:15:36.102] ./lib/ai/tools/physicsSimulationTool.ts
[20:15:36.102] 147:51  Warning: 'config' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:36.103] 147:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.103] 193:69  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.103] 194:67  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.103] 195:77  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.104] 197:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.104] 
[20:15:36.104] ./lib/analytics/api-monitoring.ts
[20:15:36.104] 86:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.105] 158:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.106] 164:11  Warning: 'messageLength' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.106] 165:11  Warning: 'model' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.106] 184:15  Warning: 'tokenCount' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.106] 185:15  Warning: 'toolCalls' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.107] 202:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.107] 242:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.107] 
[20:15:36.107] ./lib/analytics/api-performance-middleware.ts
[20:15:36.108] 10:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.108] 63:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.108] 108:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.109] 117:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.109] 
[20:15:36.109] ./lib/analytics/migration-bridge.ts
[20:15:36.109] 16:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.110] 170:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.110] 
[20:15:36.110] ./lib/analytics/real-data-collector.ts
[20:15:36.110] 345:28  Warning: '_timeRangeHours' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:36.111] 
[20:15:36.111] ./lib/analytics/vercel-config.ts
[20:15:36.111] 108:8  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.112] 136:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.112] 141:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.112] 
[20:15:36.112] ./lib/cache/browser-cache.ts
[20:15:36.113] 10:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.113] 20:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.113] 
[20:15:36.113] ./lib/db/conversations.ts
[20:15:36.114] 17:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.114] 18:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.114] 19:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.115] 25:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.115] 26:12  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.115] 
[20:15:36.115] ./lib/db/index.ts
[20:15:36.116] 5:10  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.116] 
[20:15:36.116] ./lib/performance/monitor.ts
[20:15:36.116] 6:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.117] 25:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.117] 29:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.117] 63:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.117] 85:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.124] 227:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.124] 253:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.124] 
[20:15:36.124] ./lib/performance/optimization.ts
[20:15:36.125] 17:61  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.125] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.125] 102:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.125] 109:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.126] 110:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.126] 123:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.126] 313:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.126] 313:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.126] 326:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.127] 326:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.127] 
[20:15:36.127] ./lib/utils.ts
[20:15:36.127] 25:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.128] 25:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:36.128] 
[20:15:36.128] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[20:15:41.882]    Collecting page data ...
[20:15:42.418] RAG_ENABLED is true, attempting to initialize database...
[20:15:42.420] Database initialized for RAG.
[20:15:42.522] Error: ENOENT: no such file or directory, open './test/data/05-versions-space.pdf'
[20:15:42.522]     at 36188 (.next/server/app/api/documents/route.js:1:531437)
[20:15:42.522]     at t (.next/server/webpack-runtime.js:1:143)
[20:15:42.522]     at 89788 (.next/server/app/api/documents/route.js:3:688)
[20:15:42.522]     at t (.next/server/webpack-runtime.js:1:143)
[20:15:42.523]     at r (.next/server/app/api/documents/route.js:3:4582)
[20:15:42.525]     at <unknown> (.next/server/app/api/documents/route.js:3:4621)
[20:15:42.525]     at t.X (.next/server/webpack-runtime.js:1:1285)
[20:15:42.526]     at <unknown> (.next/server/app/api/documents/route.js:3:4595) {
[20:15:42.526]   errno: -2,
[20:15:42.526]   code: 'ENOENT',
[20:15:42.526]   syscall: 'open',
[20:15:42.527]   path: './test/data/05-versions-space.pdf'
[20:15:42.527] }
[20:15:42.529] 
[20:15:42.529] > Build error occurred
[20:15:42.536] [Error: Failed to collect page data for /api/documents] {
[20:15:42.536]   type: 'Error'
[20:15:42.536] }
[20:15:42.635] Error: Command "npm run build" exited with 1
[20:15:43.074] 
[20:15:46.049] Exiting build container