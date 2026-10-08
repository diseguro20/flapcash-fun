const fs = require('fs');

async function run() {
  const chunks = [
    '3y9ik3m9j-9ma.js',
    '16h7e2bw0zeyr.js',
    '2n7pi2eysqm8g.js',
    '11to88o-s023e.js',
    '2uic3gah4un90.js',
    '3re0fzf8x4_sb.js',
    '3l3zffthxylox.js',
    '1yqrzf-lsw9wx.js',
    '08yr1j5sq4c4o.js',
    'turbopack-3iol2aqoh2dt_.js'
  ];

  for (const c of chunks) {
    const res = await fetch(`https://app.vizzionpay.com.br/_next/static/chunks/${c}?dpl=c96d3c80-753311710556859-1`);
    const text = await res.text();
    let idx = 0;
    while ((idx = text.indexOf('/gateway/checkout', idx)) !== -1) {
      console.log(`Found /gateway/checkout in ${c} at ${idx}:`);
      console.log(text.substring(Math.max(0, idx - 100), Math.min(text.length, idx + 300)));
      idx += 17;
    }
    let idx2 = 0;
    while ((idx2 = text.indexOf('/gateway/transfers', idx2)) !== -1) {
      console.log(`Found /gateway/transfers in ${c} at ${idx2}:`);
      console.log(text.substring(Math.max(0, idx2 - 100), Math.min(text.length, idx2 + 300)));
      idx2 += 18;
    }
  }
}

run().catch(console.error);
