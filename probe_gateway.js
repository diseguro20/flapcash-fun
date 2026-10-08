const headers = {
  'x-public-key': 'diseguro20_qehtu8wfzw5fxb0y',
  'x-secret-key': '516tm5rji3e0waheikvebtha8j3jwus9ifbygqa09oopwmqxmjd0vja4ns01kw78',
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const words = [
  'transaction', 'transactions',
  'pix', 'pix/charge', 'pix/payment', 'pix/create', 'pix/qrcode',
  'charge', 'charges', 'charge/pix', 'charges/pix',
  'pay', 'payment', 'payments', 'payment/pix', 'payments/pix',
  'order', 'orders', 'order/pix', 'orders/pix',
  'sale', 'sales',
  'deposit', 'deposits', 'cashin', 'cashout',
  'checkout', 'checkouts', 'session', 'sessions', 'checkout/session',
  'withdraw', 'withdraws', 'withdrawal', 'withdrawals', 'withdraw/pix', 'withdraws/pix',
  'transfer', 'transfers', 'transfer/pix', 'transfers/pix',
  'wallet', 'wallets', 'balance', 'balances',
  'webhook', 'webhooks', 'postback',
  'qrcode', 'qrcodes', 'client', 'customer', 'customer/pix',
  'billing', 'billings', 'invoice', 'invoices'
];

async function test(w) {
  const url = `https://app.vizzionpay.com.br/api/v1/gateway/${w}`;
  try {
    const resGet = await fetch(url, { method: 'GET', headers });
    if (resGet.status !== 404) {
      console.log(`[FOUND GET]  gateway/${w} => ${resGet.status}: ${(await resGet.text()).substring(0, 150)}`);
    }
  } catch(e) {}

  try {
    const resPost = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount: 2000,
        amount_float: 20,
        value: 20,
        paymentMethod: 'PIX',
        client: { name: 'Diego Seguro', email: 'diseguro20@gmail.com', document: '12345678909' },
        customer: { name: 'Diego Seguro', email: 'diseguro20@gmail.com', document: '12345678909' }
      })
    });
    if (resPost.status !== 404) {
      console.log(`[FOUND POST] gateway/${w} => ${resPost.status}: ${(await resPost.text()).substring(0, 150)}`);
    }
  } catch(e) {}
}

async function run() {
  console.log(`Testing ${words.length} gateway routes...`);
  for (let i = 0; i < words.length; i += 4) {
    const chunk = words.slice(i, i + 4);
    await Promise.all(chunk.map(test));
  }
  console.log('Finished testing.');
}

run();
