#!/usr/bin/env node

// Verification script for Netlify deployment readiness
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Netlify deployment readiness...\n');

const checks = [
  {
    name: 'netlify.toml configuration',
    path: 'netlify.toml',
    required: true
  },
  {
    name: 'package.json build script',
    path: 'package.json',
    required: true,
    validate: (content) => {
      const pkg = JSON.parse(content);
      return pkg.scripts && pkg.scripts.build;
    }
  },
  {
    name: 'Chat serverless function',
    path: 'netlify/functions/chat.js',
    required: true
  },
  {
    name: 'Health check function',
    path: 'netlify/functions/health.js',
    required: true
  },
  {
    name: 'Frontend source files',
    path: 'DRAG_TO_DOMAIN/index.html',
    required: true
  },
  {
    name: 'Built frontend files',
    path: 'dist/index.html',
    required: true
  },
  {
    name: 'GitHub Actions workflow',
    path: '.github/workflows/netlify-deploy.yml',
    required: false
  }
];

let allPassed = true;

checks.forEach(check => {
  const filePath = path.join(__dirname, check.path);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    if (check.validate) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const isValid = check.validate(content);
        if (isValid) {
          console.log(`✅ ${check.name}`);
        } else {
          console.log(`❌ ${check.name} - validation failed`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`❌ ${check.name} - validation error: ${error.message}`);
        allPassed = false;
      }
    } else {
      console.log(`✅ ${check.name}`);
    }
  } else {
    if (check.required) {
      console.log(`❌ ${check.name} - file missing`);
      allPassed = false;
    } else {
      console.log(`⚠️  ${check.name} - optional file missing`);
    }
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Ready for Netlify deployment.');
  console.log('\nNext steps:');
  console.log('1. git add .');
  console.log('2. git commit -m "Add Netlify deployment configuration"');
  console.log('3. git push origin main');
  console.log('4. Connect repository to Netlify');
  console.log('5. Set environment variables in Netlify dashboard');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  process.exit(1);
}

console.log('\nEnvironment variables to set in Netlify:');
console.log('- OPENAI_API_KEY');
console.log('- ASSISTANT_ID');
console.log('- NODE_ENV=production');
console.log('- SUPABASE_URL (if using Supabase)');
console.log('- SUPABASE_ANON_KEY (if using Supabase)');
console.log('- SUPABASE_SERVICE_ROLE_KEY (if using Supabase)');