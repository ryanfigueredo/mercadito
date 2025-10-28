import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

export interface MercadoPagoOrder {
  items: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer: {
    name: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
    phone?: {
      area_code: string;
      number: string;
    };
  };
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: string;
  notification_url?: string;
}

export interface MercadoPagoResponse {
  id: string;
  status: string;
  status_detail: string;
  payment_method_id: string;
  payment_type_id: string;
  transaction_amount: number;
  installments: number;
  description: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  status: string;
  payment_methods: {
    excluded_payment_methods: Array<{ id: string }>;
    excluded_payment_types: Array<{ id: string }>;
    installments: number;
  };
  items: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer: {
    name: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
}

export class MercadoPagoClient {
  private client: MercadoPagoConfig;
  private payment: Payment;
  private preference: Preference;

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurada");
    }

    this.client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: {
        timeout: 5000,
        idempotencyKey: "abc",
      },
    });

    this.payment = new Payment(this.client);
    this.preference = new Preference(this.client);
  }

  async createPreference(
    preferenceData: MercadoPagoOrder
  ): Promise<MercadoPagoPreferenceResponse> {
    try {
      const response = await this.preference.create({
        body: {
          items: preferenceData.items,
          payer: preferenceData.payer,
          payment_methods: preferenceData.payment_methods,
          back_urls: preferenceData.back_urls,
          auto_return: preferenceData.auto_return || "approved",
          notification_url: preferenceData.notification_url,
        },
      });

      return response;
    } catch (error: unknown) {
      console.error(
        "Erro ao criar preferência Mercado Pago:",
        (error as any)?.response?.data || (error as Error)?.message
      );
      throw new Error("Erro ao processar pagamento");
    }
  }

  async createPayment(paymentData: any): Promise<MercadoPagoResponse> {
    try {
      const response = await this.payment.create({
        body: paymentData,
      });

      return response;
    } catch (error: unknown) {
      console.error(
        "Erro ao criar pagamento Mercado Pago:",
        (error as any)?.response?.data || (error as Error)?.message
      );
      throw new Error("Erro ao processar pagamento");
    }
  }

  async getPayment(paymentId: string): Promise<MercadoPagoResponse> {
    try {
      const response = await this.payment.get({ id: paymentId });
      return response;
    } catch (error: unknown) {
      console.error(
        "Erro ao buscar pagamento Mercado Pago:",
        (error as any)?.response?.data || (error as Error)?.message
      );
      throw new Error("Erro ao buscar pagamento");
    }
  }

  async cancelPayment(paymentId: string): Promise<void> {
    try {
      await this.payment.cancel({ id: paymentId });
    } catch (error: unknown) {
      console.error(
        "Erro ao cancelar pagamento Mercado Pago:",
        (error as any)?.response?.data || (error as Error)?.message
      );
      throw new Error("Erro ao cancelar pagamento");
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      const response = await this.payment.refund({
        id: paymentId,
        body: amount ? { amount } : {},
      });
      return response;
    } catch (error: unknown) {
      console.error(
        "Erro ao estornar pagamento Mercado Pago:",
        (error as any)?.response?.data || (error as Error)?.message
      );
      throw new Error("Erro ao estornar pagamento");
    }
  }
}

export function getMercadoPagoClient() {
  return new MercadoPagoClient();
}
