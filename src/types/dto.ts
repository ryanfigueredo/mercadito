// DTOs para Products
export interface CreateProductDTO {
  name: string;
  category: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
  promoText?: string;
}

export interface UpdateProductDTO {
  name?: string;
  category?: string;
  priceCents?: number;
  stock?: number;
  imageUrl?: string;
  promoText?: string;
}

export interface ProductResponseDTO {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
  promoText?: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs para Import
export interface ImportProductDTO {
  code: string;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
}

export interface ImportResultDTO {
  message: string;
  summary: {
    totalRows: number;
    validProducts: number;
    processed: number;
    created: number;
    updated: number;
    duplicatesInFile: number;
    processingErrors: number;
    databaseErrors: number;
  };
  details: {
    created: Array<{
      code: string;
      name: string;
      row: number;
      action: "created";
    }>;
    updated: Array<{
      code: string;
      name: string;
      row: number;
      action: "updated";
    }>;
    duplicatesInFile: Array<{
      code: string;
      name: string;
      row: number;
      duplicateOf: {
        code: string;
        name: string;
        row: number;
      };
    }>;
    processingErrors: Array<{
      error: string;
      row: number;
    }>;
    databaseErrors: Array<{
      success: false;
      error: string;
      code: string;
      row: number;
    }>;
  };
}

// DTOs para Orders
export interface CreateOrderDTO {
  items: Array<{
    id: string; // product slug
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  product?: {
    name: string;
    imageUrl?: string;
  };
}

export interface OrderResponseDTO {
  id: string;
  userId: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELED";
  totalCents: number;
  paymentMethod?: string;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
}

// DTOs para User/Auth
export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  document?: string;
  phone?: string;
}

export interface UpdateUserDTO {
  name?: string;
  document?: string;
  phone?: string;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  document?: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: string;
}

// DTOs para Checkout/Payment
export interface CreatePixPaymentDTO {
  items: Array<{
    id: string; // product slug
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface CreateCreditPaymentDTO {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  cardData: {
    number: string;
    holderName: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    installments: number;
    billingAddress?: {
      line1: string;
      zipCode: string;
      city: string;
      state: string;
    };
  };
}

export interface PaymentResponseDTO {
  orderId: string;
  status: "success" | "pending" | "failed";
  paymentMethod: "pix" | "credit";
  pixQrCode?: string;
  pixQrCodeUrl?: string;
  message?: string;
}

// DTOs para Upload
export interface UploadImageDTO {
  productId: string;
  file: File;
}

export interface UploadImageResponseDTO {
  imageUrl: string;
  message: string;
}

// DTOs para Error Handling
export interface ErrorResponseDTO {
  error: string;
  details?: string[];
  code?: string;
}

// DTOs para API Responses
export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string[];
  code?: string;
  timestamp?: string;
}
