const fs = require('fs');

async function run() {
  const chunks = [
    '16h7e2bw0zeyr.js',
    '2uic3gah4un90.js',
    '3l3zffthxylox.js',
    '1yqrzf-lsw9wx.js'
  ];

  for (const c of chunks) {
    const res = await fetch(`https://checkout.vizzionpay.com.br/_next/static/chunks/${c}?dpl=c96d3c80-753311710556859-1`);
    const text = await res.text();
    // Look for gateway/checkout or Checkout via API
    let idx = text.indexOf('Checkout via API não está habilitado');
    if (idx !== -1) {
      console.log(`Found message in ${c} at ${idx}`);
      console.log(text.substring(Math.max(0, idx - 500), Math.min(text.length, idx + 500)));
    }
  }
}

run().catch(console.error);
