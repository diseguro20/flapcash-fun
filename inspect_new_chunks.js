const fs = require('fs');

async function run() {
  const chunks = ['3q1xt5g5eyve3.js', '0umr8lwx911u7.js'];
  for (const c of chunks) {
    const res = await fetch(`https://app.vizzionpay.com.br/_next/static/chunks/${c}?dpl=c96d3c80-753311710556859-1`);
    const text = await res.text();
    console.log(`=== ${c} (len ${text.length}) ===`);
    // print strings
    const strings = text.match(/"([^"\\]|\\.)*"/g);
    if (strings) {
      const filtered = Array.from(new Set(strings.map(s => s.slice(1, -1)))).filter(s => s.length > 5 && !s.includes('class') && !s.includes('data-'));
      console.log(filtered.slice(0, 30));
    }
  }
}

run().catch(console.error);
