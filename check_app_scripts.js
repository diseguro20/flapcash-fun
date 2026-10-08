const fs = require('fs');

async function run() {
  const res = await fetch('https://app.vizzionpay.com.br', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  const scripts = text.match(/src="(\/_next\/static\/chunks\/[^"]+\.js[^"]*)"/g);
  console.log('Found scripts:', scripts ? scripts.length : 0);
  if (scripts) {
    const urls = scripts.map(s => s.replace('src="', '').replace('"', ''));
    for (const u of urls) {
      console.log('Checking chunk:', u);
      const r = await fetch('https://app.vizzionpay.com.br' + u);
      const c = await r.text();
      // Look for API endpoints in app chunk
      const apiMatches = c.match(/\/api\/v1\/[a-zA-Z0-9_\-\/]+/g);
      if (apiMatches) {
        console.log(`   API in ${u}:`, Array.from(new Set(apiMatches)));
      }
    }
  }
}

run().catch(console.error);
