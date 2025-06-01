#!/usr/bin/env node

/**
 * STEM AI Assistant - Setup Verification Script
 * This script checks if your environment is properly configured for document upload
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 STEM AI Assistant - Setup Verification\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log(`📁 Environment file (.env.local): ${envExists ? '✅ Found' : '❌ Missing'}`);

if (!envExists) {
  console.log('\n🚨 CRITICAL: .env.local file is missing!');
  console.log('\n📝 To fix this:');
  console.log('1. Create a .env.local file in your project root');
  console.log('2. Add the following essential variables:\n');
  console.log('RAG_ENABLED=true');
  console.log('DATABASE_URL=postgresql://username:password@your-neon-db.com/dbname');
  console.log('OPENAI_API_KEY=sk-your-openai-api-key');
  console.log('\n3. Replace the placeholder values with your actual credentials');
  console.log('\n📖 See docs/production-deployment-guide.md for detailed setup instructions');
  process.exit(1);
}

// Parse .env.local file manually
function parseEnvFile(filePath) {
  const envVars = {};
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  } catch (error) {
    console.log('❌ Error reading .env.local file:', error.message);
  }
  return envVars;
}

// Load environment variables
const envVars = parseEnvFile(envPath);

console.log('\n🔧 Configuration Check:');

// Check essential variables
const checks = [
  {
    name: 'RAG_ENABLED',
    value: envVars.RAG_ENABLED,
    required: true,
    expectedValue: 'true',
    description: 'Enables document upload and RAG functionality'
  },
  {
    name: 'DATABASE_URL',
    value: envVars.DATABASE_URL,
    required: true,
    hide: true,
    description: 'PostgreSQL connection string for Neon database'
  },
  {
    name: 'OPENAI_API_KEY',
    value: envVars.OPENAI_API_KEY,
    required: true,
    hide: true,
    description: 'OpenAI API key for embeddings and AI responses'
  },
  {
    name: 'NEXTAUTH_SECRET',
    value: envVars.NEXTAUTH_SECRET,
    required: false,
    hide: true,
    description: 'Secret for NextAuth session encryption (recommended)'
  }
];

let allGood = true;

checks.forEach(check => {
  const isSet = !!check.value;
  const isCorrect = !check.expectedValue || check.value === check.expectedValue;
  const status = isSet && isCorrect ? '✅' : (check.required ? '❌' : '⚠️');
  
  if (check.required && (!isSet || !isCorrect)) {
    allGood = false;
  }
  
  const displayValue = check.hide ? 
    (isSet ? `[SET - ${check.value.substring(0, 10)}...]` : '[NOT SET]') : 
    (check.value || '[NOT SET]');
  
  console.log(`   ${status} ${check.name}: ${displayValue}`);
  console.log(`      ${check.description}`);
  
  if (check.expectedValue && check.value !== check.expectedValue) {
    console.log(`      Expected: ${check.expectedValue}`);
  }
  console.log('');
});

// Show current values for debugging (only first few characters)
console.log('🔍 Current values found in .env.local:');
Object.keys(envVars).forEach(key => {
  const value = envVars[key];
  const displayValue = ['DATABASE_URL', 'OPENAI_API_KEY', 'NEXTAUTH_SECRET'].includes(key) ?
    (value ? `[SET - ${value.substring(0, 15)}...]` : '[NOT SET]') :
    (value || '[NOT SET]');
  console.log(`   ${key}: ${displayValue}`);
});
console.log('');

// Database connection test
if (envVars.RAG_ENABLED === 'true' && envVars.DATABASE_URL) {
  console.log('🔗 Database URL format check...');
  
  if (envVars.DATABASE_URL.startsWith('postgresql://') || envVars.DATABASE_URL.startsWith('postgres://')) {
    console.log('   ✅ Database URL format looks correct');
  } else {
    console.log('   ❌ Database URL should start with postgresql:// or postgres://');
    allGood = false;
  }
}

// Final verdict
console.log('\n📋 Summary:');
if (allGood) {
  console.log('✅ Your setup looks good! Document upload should work.');
  console.log('\n🚀 Next steps:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Navigate to http://localhost:3000/chat');
  console.log('3. Try uploading a document using the upload button');
} else {
  console.log('❌ Configuration issues found. Please fix the items marked with ❌ above.');
  console.log('\n📖 For detailed setup instructions, see:');
  console.log('   - docs/DOCUMENT_UPLOAD_FIX_GUIDE.md');
  console.log('   - docs/production-deployment-guide.md');
}

console.log('\n🔧 Quick fixes:');
console.log('• Missing variables? Edit your .env.local file');
console.log('• Need a Neon database? Visit https://console.neon.tech/');
console.log('• Need an OpenAI API key? Visit https://platform.openai.com/');
console.log('• After making changes, restart your dev server: npm run dev'); 