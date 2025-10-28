// Cliente tipado para as APIs com DTOs
import type {
  CreateProductDTO,
  UpdateProductDTO,
  ProductResponseDTO,
  CreateOrderDTO,
  OrderResponseDTO,
  CreatePixPaymentDTO,
  CreateCreditPaymentDTO,
  PaymentResponseDTO,
  ErrorResponseDTO,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/types/dto";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: string[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as ErrorResponseDTO;
      throw new ApiError(
        errorData.error,
        response.status,
        errorData.code,
        errorData.details
      );
    }

    return data;
  }

  // Products API
  async getProducts(): Promise<ProductResponseDTO[]> {
    return this.request<ProductResponseDTO[]>("/admin/products");
  }

  async getProduct(id: string): Promise<ProductResponseDTO> {
    return this.request<ProductResponseDTO>(`/admin/products/${id}`);
  }

  async createProduct(data: CreateProductDTO): Promise<ProductResponseDTO> {
    return this.request<ProductResponseDTO>("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(
    id: string,
    data: UpdateProductDTO
  ): Promise<ProductResponseDTO> {
    return this.request<ProductResponseDTO>(`/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/products/${id}`, {
      method: "DELETE",
    });
  }

  // Orders API
  async getOrders(): Promise<OrderResponseDTO[]> {
    return this.request<OrderResponseDTO[]>("/admin/orders");
  }

  async createOrder(data: CreateOrderDTO): Promise<OrderResponseDTO> {
    return this.request<OrderResponseDTO>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Payment API
  async createPixPayment(
    data: CreatePixPaymentDTO
  ): Promise<PaymentResponseDTO> {
    return this.request<PaymentResponseDTO>("/checkout/mercadopago-pix", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createCreditPayment(
    data: CreateCreditPaymentDTO
  ): Promise<PaymentResponseDTO> {
    return this.request<PaymentResponseDTO>("/checkout/mercadopago-credit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Upload API
  async uploadProductImage(
    productId: string,
    file: File
  ): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);

    return this.request<{ imageUrl: string }>("/admin/products/upload-image", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type para FormData
    });
  }
}

// Instance singleton
export const apiClient = new ApiClient();

// Hook para usar no React (opcional)
import { useState, useEffect } from "react";

export function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err as ApiError);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}

// Exemplo de uso:
// const { data: products, loading, error } = useApi(() => apiClient.getProducts());

export { ApiError };
