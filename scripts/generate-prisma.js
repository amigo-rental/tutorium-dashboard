#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Generating Prisma client...');

try {
  // Ensure we're in the right directory
  const prismaDir = path.join(__dirname, '..', 'prisma');
  process.chdir(prismaDir);
  
  // Generate Prisma client
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('✅ Prisma client generated successfully!');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}
