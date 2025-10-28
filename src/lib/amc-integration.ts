import { prisma } from "@/lib/prisma";

// Função para atualizar estoque na AMCSistema
export async function updateStockInAMC(
  productSlug: string,
  newStock: number,
  reason: string,
  orderId?: string
) {
  try {
    const amcApiUrl = process.env.AMC_API_URL;
    const amcToken = process.env.AMC_API_TOKEN;

    if (!amcApiUrl || !amcToken) {
      console.warn("⚠️ AMC API não configurada");
      return;
    }

    const payload = {
      estoque_atual: Math.max(0, newStock), // Não permitir estoque negativo
      motivo: reason,
      pedido_id: orderId || null,
      data_atualizacao: new Date().toISOString(),
    };

    const response = await fetch(
      `${amcApiUrl}/produtos/${productSlug}/estoque`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${amcToken}`,
          "Content-Type": "application/json",
          "User-Agent": "MercaditoApp/1.0",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(
        `AMC API falhou: ${response.status} ${response.statusText}`
      );
    }

    console.log(
      `✅ Estoque do produto ${productSlug} atualizado na AMC: ${newStock}`
    );

    return await response.json();
  } catch (error) {
    console.error(
      `❌ Erro ao atualizar estoque na AMC para produto ${productSlug}:`,
      error
    );
    throw error;
  }
}

// Função para sincronizar todos os produtos com AMC
export async function syncAllProductsWithAMC() {
  try {
    const products = await prisma.product.findMany({
      select: {
        slug: true,
        name: true,
        category: true,
        priceCents: true,
        stock: true,
      },
    });

    const amcApiUrl = process.env.AMC_API_URL;
    const amcToken = process.env.AMC_API_TOKEN;

    if (!amcApiUrl || !amcToken) {
      console.warn("⚠️ AMC API não configurada");
      return;
    }

    const payload = {
      produtos: products.map((product) => ({
        codigo_produto: product.slug,
        nome_produto: product.name,
        categoria: product.category,
        preco: product.priceCents / 100,
        estoque_atual: product.stock,
        ultima_atualizacao: new Date().toISOString(),
      })),
    };

    const response = await fetch(`${amcApiUrl}/produtos/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${amcToken}`,
        "Content-Type": "application/json",
        "User-Agent": "MercaditoApp/1.0",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `AMC sync falhou: ${response.status} ${response.statusText}`
      );
    }

    console.log(`✅ ${products.length} produtos sincronizados com AMC`);

    return await response.json();
  } catch (error) {
    console.error("❌ Erro na sincronização completa com AMC:", error);
    throw error;
  }
}
