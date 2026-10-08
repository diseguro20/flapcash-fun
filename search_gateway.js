const fs = require('fs');

async function run() {
  const content = fs.readFileSync('C:/Users/diseg/.gemini/antigravity/brain/d01b3527-6586-4424-8aca-5a4e936a7cff/.system_generated/steps/1492/content.md', 'utf8');
  const scriptRegex = /src="(\/_next\/static\/chunks\/[^"]+\.js[^"]*)"/g;
  let m;
  const chunkUrls = [];
  while ((m = scriptRegex.exec(content)) !== null) {
    chunkUrls.push(m[1]);
  }

  for (const chunk of chunkUrls) {
    const res = await fetch('https://checkout.vizzionpay.com.br' + chunk);
    const code = await res.text();
    if (code.includes('GATEWAY_') || code.includes('/gateway/')) {
      console.log(`Found GATEWAY in chunk ${chunk}`);
      const matches = code.match(/["'](?:\/api\/v1\/gateway\/[^"']+|GATEWAY_[A-Z_]+)["']/g);
      if (matches) console.log(matches);
    }
  }
}

run().catch(console.error);
