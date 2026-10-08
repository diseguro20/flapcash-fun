const fs = require('fs');

async function run() {
  const chunks = [
    '16h7e2bw0zeyr.js',
    '2uic3gah4un90.js',
    '3l3zffthxylox.js'
  ];

  for (const c of chunks) {
    const res = await fetch(`https://checkout.vizzionpay.com.br/_next/static/chunks/${c}?dpl=c96d3c80-753311710556859-1`);
    const text = await res.text();
    let idx = text.indexOf('ENABLED_CREATE_CHECKOUT_VIA_API');
    if (idx !== -1) {
      console.log(`Found ENABLED_CREATE_CHECKOUT_VIA_API in ${c} at ${idx}`);
      console.log(text.substring(Math.max(0, idx - 200), Math.min(text.length, idx + 500)));
    }
  }
}

run().catch(console.error);
