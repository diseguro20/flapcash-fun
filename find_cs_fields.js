const fs = require('fs');

async function run() {
  const chunks = ['16h7e2bw0zeyr.js', '2uic3gah4un90.js', '3l3zffthxylox.js'];
  for (const c of chunks) {
    const res = await fetch(`https://app.vizzionpay.com.br/_next/static/chunks/${c}?dpl=c96d3c80-753311710556859-1`);
    const text = await res.text();
    // Search for checkout session or checkout fields
    const matches = text.match(/CheckoutSessionScalarFieldEnum[^}]+}/g);
    if (matches) {
      console.log(`CheckoutSession fields in ${c}:`);
      console.log(matches);
    }
  }
}

run().catch(console.error);
