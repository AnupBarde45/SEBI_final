const fetch = require('node-fetch');

const BACKEND_URL = 'http://10.244.64.90:3000';

async function testAdminEndpoints() {
  console.log('Testing admin endpoints...\n');
  
  try {
    // Test risk factors endpoint
    console.log('1. Testing /api/admin/risk-factors');
    const factorsResponse = await fetch(`${BACKEND_URL}/api/admin/risk-factors`);
    if (factorsResponse.ok) {
      const factors = await factorsResponse.json();
      console.log(`✅ Risk factors: ${factors.length} factors found`);
      console.log(`   Age factors: ${factors.filter(f => f.factor_type === 'age').length}`);
      console.log(`   Income factors: ${factors.filter(f => f.factor_type === 'income').length}`);
    } else {
      console.log(`❌ Risk factors failed: ${factorsResponse.status}`);
    }
    
    // Test risk profiles endpoint
    console.log('\n2. Testing /api/admin/risk-profiles');
    const profilesResponse = await fetch(`${BACKEND_URL}/api/admin/risk-profiles`);
    if (profilesResponse.ok) {
      const profiles = await profilesResponse.json();
      console.log(`✅ Risk profiles: ${profiles.length} profiles found`);
      profiles.forEach(p => console.log(`   ${p.profile_name}: ${p.min_score}-${p.max_score}`));
    } else {
      console.log(`❌ Risk profiles failed: ${profilesResponse.status}`);
    }
    
    // Test quiz questions endpoint
    console.log('\n3. Testing /api/admin/quiz-questions');
    const questionsResponse = await fetch(`${BACKEND_URL}/api/admin/quiz-questions`);
    if (questionsResponse.ok) {
      const questions = await questionsResponse.json();
      console.log(`✅ Quiz questions: ${questions.length} questions found`);
    } else {
      console.log(`❌ Quiz questions failed: ${questionsResponse.status}`);
    }
    
    // Test guru tips endpoint
    console.log('\n4. Testing /api/admin/guru-tips');
    const tipsResponse = await fetch(`${BACKEND_URL}/api/admin/guru-tips`);
    if (tipsResponse.ok) {
      const tips = await tipsResponse.json();
      console.log(`✅ Guru tips: ${tips.length} tips found`);
    } else {
      console.log(`❌ Guru tips failed: ${tipsResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testAdminEndpoints();