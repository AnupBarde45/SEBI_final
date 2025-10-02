const http = require('http');

function testAPIEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/dashboard/dashboard/bef2e804-3ae2-4289-814e-c10d6fcdcfdb',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📡 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('📊 API Response:');
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('📄 Raw Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.end();
}

console.log('🧪 Testing API endpoint...');
testAPIEndpoint();



