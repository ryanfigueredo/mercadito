// Teste básico da integração Mercado Pago
const MERCADOPAGO_ACCESS_TOKEN = "your_access_token_here";

async function testMercadoPagoPix() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/checkout/mercadopago-pix",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your_session_token",
        },
        body: JSON.stringify({
          items: [
            {
              id: "produto-teste",
              name: "Produto Teste",
              price: 10.0,
              quantity: 1,
            },
          ],
          deliveryAddress: {
            street: "Rua Teste, 123",
            city: "São Paulo",
            state: "SP",
            zip: "01234-567",
          },
          shippingInfo: {
            rateCents: 500,
            rateReais: 5.0,
            distanceKm: 10,
            estimatedDays: 2,
          },
        }),
      }
    );

    const data = await response.json();
    console.log("Resposta PIX:", data);
  } catch (error) {
    console.error("Erro no teste PIX:", error);
  }
}

async function testMercadoPagoCredit() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/checkout/mercadopago-credit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your_session_token",
        },
        body: JSON.stringify({
          items: [
            {
              id: "produto-teste",
              name: "Produto Teste",
              price: 10.0,
              quantity: 1,
            },
          ],
          deliveryAddress: {
            street: "Rua Teste, 123",
            city: "São Paulo",
            state: "SP",
            zip: "01234-567",
          },
          shippingInfo: {
            rateCents: 500,
            rateReais: 5.0,
            distanceKm: 10,
            estimatedDays: 2,
          },
          cardData: {
            number: "4111111111111111", // Cartão de teste
            holderName: "TESTE TESTE",
            expMonth: "12",
            expYear: "25",
            cvv: "123",
            installments: 1,
            billingAddress: {
              line1: "Rua Teste, 123",
              zipCode: "01234-567",
              city: "São Paulo",
              state: "SP",
            },
          },
        }),
      }
    );

    const data = await response.json();
    console.log("Resposta Cartão:", data);
  } catch (error) {
    console.error("Erro no teste Cartão:", error);
  }
}

// Executar testes
console.log("Testando integração Mercado Pago...");
testMercadoPagoPix();
testMercadoPagoCredit();
