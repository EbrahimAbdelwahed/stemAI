[15:30:03.552] Running build in Washington, D.C., USA (East) – iad1
[15:30:03.553] Build machine configuration: 2 cores, 8 GB
[15:30:03.566] Cloning github.com/EbrahimAbdelwahed/stemAI (Branch: surface, Commit: 8539fc7)
[15:30:04.303] Cloning completed: 735.000ms
[15:30:04.605] Found .vercelignore
[15:30:04.630] Removed 4 ignored files defined in .vercelignore
[15:30:07.585] Restored build cache from previous deployment (3pxhN2P9P9omDoqzyg76MCySeLNp)
[15:30:08.322] Running "vercel build"
[15:30:08.746] Vercel CLI 42.2.0
[15:30:09.077] Running "install" command: `npm install`...
[15:30:11.105] 
[15:30:11.106] up to date, audited 983 packages in 2s
[15:30:11.107] 
[15:30:11.108] 315 packages are looking for funding
[15:30:11.108]   run `npm fund` for details
[15:30:11.109] 
[15:30:11.109] 3 moderate severity vulnerabilities
[15:30:11.109] 
[15:30:11.110] To address all issues (including breaking changes), run:
[15:30:11.110]   npm audit fix --force
[15:30:11.110] 
[15:30:11.111] Run `npm audit` for details.
[15:30:11.140] Detected Next.js version: 15.3.2
[15:30:11.141] Running "npm run build"
[15:30:11.254] 
[15:30:11.255] > stemai@1.0.0 prebuild
[15:30:11.255] > echo 'Starting production build - test files will be ignored'
[15:30:11.255] 
[15:30:11.259] Starting production build - test files will be ignored
[15:30:11.260] 
[15:30:11.261] > stemai@1.0.0 build
[15:30:11.261] > next build
[15:30:11.262] 
[15:30:12.045]    ▲ Next.js 15.3.2
[15:30:12.046] 
[15:30:12.111]    Creating an optimized production build ...
[15:30:28.181]  ✓ Compiled successfully in 15.0s
[15:30:28.186]    Linting and checking validity of types ...
[15:30:36.376] 
[15:30:36.377] Failed to compile.
[15:30:36.377] 
[15:30:36.377] ./app/chat/[id]/page.tsx
[15:30:36.378] 104:6  Warning: React Hook useEffect has a missing dependency: 'setMessages'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[15:30:36.378] 
[15:30:36.378] ./app/test-conway/page.tsx
[15:30:36.379] 7:50  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[15:30:36.379] 18:67  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[15:30:36.379] 23:17  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[15:30:36.379] 
[15:30:36.379] ./components/SplitPane.tsx
[15:30:36.379] 68:6  Warning: React Hook useEffect has missing dependencies: 'onMouseMove' and 'onMouseUp'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[15:30:36.379] 
[15:30:36.379] ./components/visualizations/Advanced3DMolViewer.tsx
[15:30:36.380] 287:6  Warning: React Hook useEffect has missing dependencies: 'backgroundColor', 'cachedMolecule', 'colorScheme', 'identifier', 'identifierType', 'renderAdvancedMolecule', 'renderFromCache', 'representationStyle', 'selections', 'showLabels', 'showSurface', 'surfaceOpacity', 'surfaceType', and 'wasSuccessfullyRendered'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[15:30:36.380] 
[15:30:36.380] ./components/visualizations/ConwaysGameOfLife.tsx
[15:30:36.380] 305:17  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[15:30:36.380] 
[15:30:36.380] ./components/visualizations/MolStarWrapper.tsx
[15:30:36.381] 230:25  Warning: Assignments to the 'inputType' variable from inside React Hook useEffect will be lost after each render. To preserve the value over time, store it in a useRef Hook and keep the mutable value in the '.current' property. Otherwise, you can move this variable directly inside useEffect.  react-hooks/exhaustive-deps
[15:30:36.381] 
[15:30:36.381] ./components/visualizations/Molecule3DViewer.tsx
[15:30:36.381] 342:6  Warning: React Hook useEffect has missing dependencies: 'identifier', 'identifierType', 'loadRDKit', and 'processSMILES'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[15:30:36.381] 
[15:30:36.381] ./components/visualizations/Simple3DMolViewer.tsx
[15:30:36.383] 236:6  Warning: React Hook useEffect has missing dependencies: 'cachedMolecule', 'identifier', 'identifierType', 'renderFromCache', 'representationStyle', and 'wasSuccessfullyRendered'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[15:30:36.384] 
[15:30:36.384] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[15:30:36.459] Error: Command "npm run build" exited with 1
[15:30:36.821] 
[15:30:39.932] Exiting build container