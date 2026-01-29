// Test Cloudflare Stream API connectivity
const https = require('https');

const CLOUDFLARE_ACCOUNT_ID = '40c0413b311ad2186f643011bee07ea5';
const CLOUDFLARE_API_TOKEN = 'Jo5hYUgtmoIFXcDxm3zbY1mF5fxN1OmasoXk4YAm';

console.log('Testing Cloudflare Stream API...\n');

// Test 1: Verify token
console.log('1. Verifying API token...');
https.get('https://api.cloudflare.com/client/v4/user/tokens/verify', {
  headers: {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.success) {
      console.log('✅ Token is VALID and ACTIVE\n');
      
      // Test 2: List videos (test Stream API access)
      console.log('2. Testing Stream API access...');
      https.get(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?limit=1`, {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }, (streamRes) => {
        let streamData = '';
        streamRes.on('data', chunk => streamData += chunk);
        streamRes.on('end', () => {
          const streamResult = JSON.parse(streamData);
          if (streamResult.success) {
            console.log('✅ Stream API is ACCESSIBLE');
            console.log(`   Videos in account: ${streamResult.result ? streamResult.result.length : 0}`);
          } else {
            console.log('❌ Stream API access DENIED');
            console.log('   Error:', streamResult.errors[0].message);
            console.log('\n⚠️  Your API token does NOT have Stream permissions!');
            console.log('   Please create a new token with "Stream:Edit" permissions at:');
            console.log('   https://dash.cloudflare.com/profile/api-tokens\n');
          }
        });
      });
    } else {
      console.log('❌ Token is INVALID');
      console.log('   Errors:', result.errors);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
