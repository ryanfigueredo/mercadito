const https = require('https');

// Função para testar o webhook atualizado
async function testWebhookUpdated() {
  console.log('🔗 Testando Webhook Atualizado...\n');

  const webhookUrl = 'https://www.seumercadito.com.br/api/checkout/mercadopago-webhook';
  
  // Simular evento de teste do Mercado Pago (como o que você recebeu)
  const testEvent = {
    action: "payment.updated",
    api_version: "v1",
    data: {"id": "123456"},
    date_created: "2021-11-01T02:02:02Z",
    id: "123456",
    live_mode: false,
    type: "payment",
    user_id: 2933676269
  };

  const postData = JSON.stringify(testEvent);

  // Headers simulando requisição do Mercado Pago
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'MercadoPago-Webhook/1.0',
      'X-MercadoPago-Signature': 'test-signature'
    }
  };

  console.log('📤 Enviando evento de teste do Mercado Pago...');
  console.log(`   URL: ${webhookUrl}`);
  console.log(`   Evento: ${JSON.stringify(testEvent, null, 2)}`);
  console.log(`   Headers: ${JSON.stringify(options.headers, null, 2)}`);

  const req = https.request(webhookUrl, options, (res) => {
    console.log(`\n📥 Resposta recebida:`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`   Body: ${data}`);
      
      if (res.statusCode === 200) {
        console.log('\n✅ Webhook funcionando! Teste do Mercado Pago aceito!');
      } else {
        console.log('\n❌ Webhook ainda retornando erro');
        console.log('   Verifique os logs do servidor para mais detalhes');
      }
    });
  });

  req.on('error', (error) => {
    console.error('\n❌ Erro ao testar webhook:', error.message);
  });

  req.write(postData);
  req.end();
}

// Executar teste
testWebhookUpdated();
