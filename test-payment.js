const axios = require("axios");

// Configurações do Pagar.me
const PAGARME_API_KEY = "sk_e0c0ca9a0edb4cb08f4b0c9c15ece35d";
const PAGARME_BASE_URL = "https://api.pagar.me/core/v5";

// Cartões de teste
const testCards = {
  approved: {
    number: "4000000000000010",
    holderName: "Teste Pagar.me",
    expMonth: "12",
    expYear: "2030",
    cvv: "123",
  },
  denied: {
    number: "4000000000000002",
    holderName: "Teste Pagar.me",
    expMonth: "12",
    expYear: "2030",
    cvv: "123",
  },
};

// Função para testar PIX
async function testPixPayment() {
  try {
    console.log("🧪 Testando PIX...");

    const response = await axios.post(
      `${PAGARME_BASE_URL}/orders`,
      {
        items: [
          {
            amount: 100, // R$ 1,00
            description: "Teste PIX",
            quantity: 1,
          },
        ],
        customer: {
          name: "Teste Pagar.me",
          email: "teste@pagarme.com",
          type: "individual",
          document: "11144477735",
          phones: {
            mobile_phone: {
              country_code: "55",
              area_code: "11",
              number: "999999999",
            },
          },
        },
        payments: [
          {
            payment_method: "pix",
            pix: {
              expires_in: 3600,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(PAGARME_API_KEY + ":").toString(
            "base64"
          )}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ PIX criado com sucesso!");
    console.log("Order ID:", response.data.id);
    console.log(
      "PIX QR Code:",
      response.data.charges?.[0]?.last_transaction?.qr_code
    );
    console.log(
      "PIX URL:",
      response.data.charges?.[0]?.last_transaction?.qr_code_url
    );

    return response.data;
  } catch (error) {
    console.error("❌ Erro no PIX:", error.response?.data || error.message);
    throw error;
  }
}

// Função para testar Cartão de Crédito
async function testCreditCardPayment(cardType = "approved") {
  try {
    console.log(`🧪 Testando Cartão de Crédito (${cardType})...`);

    const card = testCards[cardType];

    const response = await axios.post(
      `${PAGARME_BASE_URL}/orders`,
      {
        items: [
          {
            amount: 100, // R$ 1,00
            description: "Teste Cartão",
            quantity: 1,
          },
        ],
        customer: {
          name: "Teste Pagar.me",
          email: "teste@pagarme.com",
          type: "individual",
          document: "11144477735",
          phones: {
            mobile_phone: {
              country_code: "55",
              area_code: "11",
              number: "999999999",
            },
          },
        },
        payments: [
          {
            payment_method: "credit_card",
            credit_card: {
              installments: 1,
              statement_descriptor: "TESTE",
              card: {
                number: card.number,
                holder_name: card.holderName,
                exp_month: card.expMonth,
                exp_year: card.expYear,
                cvv: card.cvv,
                billing_address: {
                  line_1: "Rua Teste, 123",
                  zip_code: "01234567",
                  city: "São Paulo",
                  state: "SP",
                  country: "BR",
                },
              },
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(PAGARME_API_KEY + ":").toString(
            "base64"
          )}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Cartão processado com sucesso!");
    console.log("Order ID:", response.data.id);
    console.log("Status:", response.data.charges?.[0]?.status);
    console.log("Amount:", response.data.charges?.[0]?.amount);

    return response.data;
  } catch (error) {
    console.error("❌ Erro no Cartão:", error.response?.data || error.message);
    throw error;
  }
}

// Função principal de teste
async function runTests() {
  console.log("🚀 Iniciando testes do Pagar.me...\n");

  try {
    // Teste PIX
    await testPixPayment();
    console.log("\n");

    // Teste Cartão Aprovado
    await testCreditCardPayment("approved");
    console.log("\n");

    // Teste Cartão Negado
    try {
      await testCreditCardPayment("denied");
    } catch (error) {
      console.log("✅ Cartão negado funcionando corretamente (esperado)");
    }

    console.log("\n🎉 Todos os testes concluídos!");
  } catch (error) {
    console.error("💥 Erro geral:", error.message);
  }
}

// Executar testes
runTests();
