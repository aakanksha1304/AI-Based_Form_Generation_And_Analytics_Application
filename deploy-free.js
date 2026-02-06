#!/usr/bin/env node

/**
 * 🚀 FREE Deployment Automation Script
 * Netlify + Render + MongoDB Atlas
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🎨 Artistic Forms - FREE Deployment Setup');
console.log('==========================================\n');

// Configuration
const config = {
  frontendName: '',
  backendName: '',
  githubRepo: '',
  mongodbEmail: '',
  customDomain: ''
};

// Helper functions
function updateFile(filePath, searchValue, replaceValue) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(new RegExp(searchValue, 'g'), replaceValue);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.log(`❌ Error updating ${filePath}:`, error.message);
  }
}

function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.log(`❌ Error: ${description} failed`);
    console.log(error.message);
  }
}

// Main deployment function
async function deployApp() {
  console.log('📋 Please provide the following details:\n');
  
  // Get user input (you'll provide these)
  config.frontendName = 'artistic-forms-app'; // You'll change this
  config.backendName = 'artistic-forms-api';   // You'll change this
  config.githubRepo = 'your-username/artistic-forms'; // You'll change this
  
  console.log('🔧 Setting up deployment configurations...\n');
  
  // Update Netlify configuration
  updateFile(
    'netlify.toml',
    'your-backend-name',
    config.backendName
  );
  
  // Update Render configuration
  updateFile(
    'render.yaml',
    'your-app-name',
    config.frontendName
  );
  
  // Update package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  packageJson.scripts['deploy:netlify'] = 'netlify deploy --prod';
  packageJson.scripts['deploy:render'] = 'echo "Push to GitHub to deploy to Render"';
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  
  console.log('✅ All configuration files updated!\n');
  
  console.log('📝 Next Steps:');
  console.log('==============');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect GitHub repo to Render (backend)');
  console.log('3. Connect GitHub repo to Netlify (frontend)');
  console.log('4. Set up MongoDB Atlas database');
  console.log('5. Configure environment variables');
  console.log('\n📖 See FREE_DEPLOYMENT_SETUP.md for detailed instructions');
}

// Run deployment setup
deployApp().catch(console.error);