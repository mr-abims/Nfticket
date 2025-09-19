// Quick configuration test script
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Ticketify Configuration...\n');

// Test 1: Check contract addresses
console.log('1. Contract Configuration:');
try {
  const configPath = path.join(__dirname, 'app/contracts/config.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  if (configContent.includes('0x70068bC17cb22ad28A2E2df5821d3f4Bf839a800')) {
    console.log('   ✅ EventFactory address configured');
  } else {
    console.log('   ❌ EventFactory address missing');
  }
  
  if (configContent.includes('50312')) {
    console.log('   ✅ Somnia Testnet configured');
  } else {
    console.log('   ❌ Somnia Testnet configuration missing');
  }
} catch (error) {
  console.log('   ❌ Config file error:', error.message);
}

// Test 2: Check ABI files
console.log('\n2. ABI Files:');
try {
  const factoryABI = path.join(__dirname, 'app/contracts/abis/EventFactory.json');
  const managerABI = path.join(__dirname, 'app/contracts/abis/EventManager.json');
  
  if (fs.existsSync(factoryABI)) {
    const factoryContent = JSON.parse(fs.readFileSync(factoryABI, 'utf8'));
    console.log(`   ✅ EventFactory ABI (${factoryContent.length} functions)`);
  } else {
    console.log('   ❌ EventFactory ABI missing');
  }
  
  if (fs.existsSync(managerABI)) {
    const managerContent = JSON.parse(fs.readFileSync(managerABI, 'utf8'));
    console.log(`   ✅ EventManager ABI (${managerContent.length} functions)`);
  } else {
    console.log('   ❌ EventManager ABI missing');
  }
} catch (error) {
  console.log('   ❌ ABI file error:', error.message);
}

// Test 3: Check environment setup
console.log('\n3. Environment Setup:');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env.local file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_PINATA_API_KEY')) {
    console.log('   ✅ Pinata API key configured');
  } else {
    console.log('   ⚠️  Pinata API key not set');
  }
} else {
  console.log('   ⚠️  .env.local file missing (create it for Pinata keys)');
}

// Test 4: Check key files
console.log('\n4. Key Files:');
const keyFiles = [
  'app/create-event/page.tsx',
  'app/events/page.tsx',
  'app/events/[id]/page.tsx',
  'app/dashboard/page.tsx',
  'app/hooks/useContracts.ts',
  'app/hooks/usePinata.ts',
  'app/lib/dateUtils.ts'
];

keyFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

console.log('\n🚀 Configuration Check Complete!');
console.log('\nNext Steps:');
console.log('1. Create .env.local with Pinata API keys');
console.log('2. Open http://localhost:3000');
console.log('3. Connect wallet to Somnia Testnet');
console.log('4. Start testing event creation!');
