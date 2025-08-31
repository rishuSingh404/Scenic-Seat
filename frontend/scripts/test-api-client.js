// Manual test script for API client functionality
// Run with: node scripts/test-api-client.js

const { getHealth, postRecommend, checkApiAvailability } = require('../lib/api.ts');
const { FROZEN_CONTRACT_EXAMPLES } = require('../lib/schemas.ts');

async function testApiClient() {
  console.log('🧪 Testing Scenic Seat API Client');
  console.log('=' .repeat(50));

  // Test 1: Check API availability
  console.log('\n1. Testing API availability...');
  const isAvailable = await checkApiAvailability();
  console.log(`   API Available: ${isAvailable ? '✅ Yes' : '❌ No'}`);
  
  if (!isAvailable) {
    console.log('   💡 Make sure backend server is running: cd backend && python run.bat run');
    return;
  }

  // Test 2: Health check
  console.log('\n2. Testing health endpoint...');
  try {
    const health = await getHealth();
    console.log('   ✅ Health check passed');
    console.log(`   📊 Status: ${health.status}`);
    console.log(`   🔢 Version: ${health.version}`);
    console.log(`   📚 Libraries: ${Object.keys(health.libraries).join(', ')}`);
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message);
    return;
  }

  // Test 3: Recommendation request
  console.log('\n3. Testing recommendation endpoint...');
  try {
    const request = FROZEN_CONTRACT_EXAMPLES.recommendRequest;
    console.log(`   📍 Route: ${request.origin.name} → ${request.destination.name}`);
    console.log(`   🕐 Time: ${request.local_datetime} (${request.interest})`);
    
    const recommendation = await postRecommend(request);
    console.log('   ✅ Recommendation received');
    console.log(`   🪟 Side: ${recommendation.side} window`);
    console.log(`   📊 Confidence: ${recommendation.confidence}`);
    console.log(`   🧭 Bearing: ${recommendation.bearing_deg}°`);
    console.log(`   ☀️ Sun Azimuth: ${recommendation.sun_azimuth_deg}°`);
    console.log(`   📐 Relative Angle: ${recommendation.relative_angle_deg}°`);
    console.log(`   ✨ Golden Hour: ${recommendation.golden_hour ? 'Yes' : 'No'}`);
    console.log(`   🎯 Stability: ${recommendation.stability}`);
    console.log(`   📝 Notes: ${recommendation.notes}`);
  } catch (error) {
    console.log('   ❌ Recommendation failed:', error.message);
    if (error.errorType) {
      console.log(`   🏷️ Error Type: ${error.errorType}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 API client test completed');
}

// Run the test
testApiClient().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});



