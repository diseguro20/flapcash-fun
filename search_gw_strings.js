const fs = require('fs');

async function run() {
  const chunks = [
    '3y9ik3m9j-9ma.js',
    '16h7e2bw0zeyr.js',
    '2n7pi2eysqm8g.js',
    '11to88o-s023e.js',
    '2uic3gah4un90.js',
    '3re0fzf8x4_sb.js'
  ];

  for (const c of chunks) {
    const res = await fetch(`https://checkout.vizzionpay.com.br/_next/static/chunks/${c}?dpl=c96d3c80-753311710556859-1`);
    const text = await res.text();
    const regex = /["']([^"']*(?:gateway|transfers|checkout|transactions)[^"']*)["']/gi;
    let m;
    const matches = new Set();
    while ((m = regex.exec(text)) !== null) {
      if (m[1].length < 60 && !m[1].includes(' ')) {
        matches.add(m[1]);
      }
    }
    console.log(`=== Matches in ${c} ===`);
    console.log(Array.from(matches).slice(0, 30));
  }
}

run().catch(console.error);
