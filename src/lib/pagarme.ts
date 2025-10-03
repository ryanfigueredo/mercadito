import axios from "axios";

export interface PagarMeOrder {
  items: Array<{
    amount: number; // valor em centavos
    description: string;
    quantity: number;
  }>;
  customer: {
    name: string;
    email: string;
    type: "individual" | "company";
    document: string;
    phones?: {
      home_phone?: {
        country_code: string;
        number: string;
        area_code: string;
      };
      mobile_phone?: {
        country_code: string;
        number: string;
        area_code: string;
      };
    };
  };
  payments: Array<{
    payment_method: "pix" | "credit_card";
    pix?: {
      expires_in: number; // segundos
      additional_information?: Array<{
        name: string;
        value: string;
      }>;
    };
    credit_card?: {
      installments?: number;
      statement_descriptor?: string;
      operation_type?: "auth_and_capture" | "auth_only" | "pre_auth";
      card?: {
        number: string;
        holder_name: string;
        exp_month: number;
        exp_year: number;
        cvv: string;
        billing_address?: {
          line_1: string;
          zip_code: string;
          city: string;
          state: string;
          country: string;
        };
      };
    };
  }>;
}

export interface PagarMeResponse {
  id: string;
  status: string;
  charges?: Array<{
    id: string;
    status: string;
    amount: number;
    paid_amount: number;
    payment_method: string;
    pix?: {
      qr_code: string;
      qr_code_url: string;
    };
    last_transaction?: {
      id: string;
      status: string;
      qr_code?: string;
      qr_code_url?: string;
      expires_at?: string;
      additional_information?: Array<{
        name: string;
        value: string;
      }>;
    };
  }>;
}

export class PagarMeClient {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.PAGARME_API_KEY || "";
    this.baseURL =
      process.env.PAGARME_BASE_URL || "https://api.pagar.me/core/v5";

    if (!this.apiKey) {
      throw new Error("PAGARME_API_KEY não configurada");
    }
  }

  private getHeaders() {
    return {
      Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString(
        "base64"
      )}`,
      "Content-Type": "application/json",
    };
  }

  async createOrder(order: PagarMeOrder): Promise<PagarMeResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/orders`, order, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: unknown) {
      console.error(
        "Erro ao criar pedido Pagar.me:",
        (error as any)?.response?.data || (error as Error)?.message
      );
      throw new Error("Erro ao processar pagamento");
    }
  }

  async getOrder(orderId: string): Promise<PagarMeResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/orders/${orderId}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: unknown) {
      console.error(
        "Erro ao buscar pedido Pagar.me:",
        (error as any)?.response?.data || (error as Error)?.message
      );
      throw new Error("Erro ao buscar pedido");
    }
  }

  async cancelCharge(chargeId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/charges/${chargeId}`, {
        headers: this.getHeaders(),
      });
    } catch (error: unknown) {
      console.error(
        "Erro ao cancelar cobrança:",
        (error as any)?.response?.data || (error as Error)?.message
      );
      throw new Error("Erro ao cancelar pagamento");
    }
  }
}

export function getPagarMeClient() {
  return new PagarMeClient();
}
