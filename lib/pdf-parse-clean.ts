// Clean version of pdf-parse without debug code that causes build issues
// This replaces the original pdf-parse/index.js to avoid the test file access

// Import the core PDF parsing functionality directly (without debug code)
const Pdf = require('pdf-parse/lib/pdf-parse.js');

// Export the core functionality without debug code
export default Pdf;

// Note: Original pdf-parse had debug code that tried to read './test/data/05-versions-space.pdf'
// when !module.parent was true, causing ENOENT errors during builds.
// This clean version only exports the core functionality without debug code. 