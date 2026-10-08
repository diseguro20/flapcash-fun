const headers = {
  'x-public-key': 'diseguro20_qehtu8wfzw5fxb0y',
  'x-secret-key': '516tm5rji3e0waheikvebtha8j3jwus9ifbygqa09oopwmqxmjd0vja4ns01kw78',
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const words = [
  'pix', 'charges', 'charge', 'payments', 'payment', 'pay',
  'orders', 'order', 'sales', 'sale', 'transactions', 'transaction',
  'checkout', 'checkouts', 'session', 'sessions', 'transfers', 'transfer',
  'deposits', 'deposit', 'withdraws', 'withdraw', 'withdrawals', 'withdrawal',
  'cashin', 'cashout', 'billing', 'billings', 'invoices', 'invoice',
  'wallet', 'wallets', 'balances', 'balance', 'customers', 'customer',
  'clients', 'client', 'producers', 'producer', 'webhook', 'webhooks',
  'cards', 'card', 'boletos', 'boleto', 'links', 'link', 'generate', 'create'
];

async function run() {
  for (const w of words) {
    const url = `https://app.vizzionpay.com.br/api/v1/gateway/${w}`;
    try {
      const resG = await fetch(url, { method: 'GET', headers });
      if (resG.status !== 404) {
        console.log(`[FOUND GET]  ${w} => ${resG.status}: ${(await resG.text()).substring(0, 100)}`);
      }
    } catch(e) {}
    try {
      const resP = await fetch(url, { method: 'POST', headers, body: JSON.stringify({}) });
      if (resP.status !== 404) {
        console.log(`[FOUND POST] ${w} => ${resP.status}: ${(await resP.text()).substring(0, 100)}`);
      }
    } catch(e) {}
  }
}

run().catch(console.error);
