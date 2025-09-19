// Tipos para o sistema de pagamentos
// Payment data interface for Pagar.me integration
export interface PaymentData {
  orderId: string;
  pixQrCode?: string;
  pixQrCodeUrl?: string;
  total: number;
  expiresIn?: number;
  status?: string;
  chargeId?: string;
}
/**
 * Dados do cartão de crédito
 */

export interface CardData {
  number: string;
  holderName: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  installments: number;
  zipCode: string;
  city: string;
  state: string;
  billingAddress?: {
    line1: string;
    zipCode: string;
    city: string;
    state: string;
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  qty: number;
}

export interface ProductImportResult {
  success: boolean;
  error?: string;
  product?: {
    id: string;
    name: string;
    priceCents: number;
  };
}

export interface ImportResponse {
  message: string;
  total: number;
  success: number;
  errors: number;
  results: ProductImportResult[];
}

export interface WebhookEvent {
  type: string;
  data: {
    id: string;
    status: string;
    amount?: number;
    paid_amount?: number;
    payment_method?: string;
    pix?: {
      qr_code: string;
      qr_code_url: string;
    };
    last_transaction?: {
      id: string;
      status: string;
    };
  };
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  confirm: string;
}

export interface LoginError {
  error?: string;
}
