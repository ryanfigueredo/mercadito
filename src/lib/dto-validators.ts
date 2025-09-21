import { z } from "zod";
import type {
  CreateProductDTO,
  UpdateProductDTO,
  CreateOrderDTO,
  RegisterUserDTO,
  UpdateUserDTO,
  CreatePixPaymentDTO,
  CreateCreditPaymentDTO,
} from "@/types/dto";

// Validators para Products
export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  category: z.enum([
    "Grãos",
    "Bebidas",
    "Padaria",
    "Limpeza",
    "Hortifruti",
    "Diversos",
  ]),
  priceCents: z.number().min(1, "Preço deve ser maior que zero"),
  stock: z
    .number()
    .min(0, "Estoque não pode ser negativo")
    .int("Estoque deve ser um número inteiro"),
  imageUrl: z.string().url("URL da imagem inválida").optional(),
  promoText: z.string().max(50, "Texto promocional muito longo").optional(),
}) satisfies z.ZodType<CreateProductDTO>;

export const updateProductSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome muito longo")
      .optional(),
    category: z
      .enum([
        "Grãos",
        "Bebidas",
        "Padaria",
        "Limpeza",
        "Hortifruti",
        "Diversos",
      ])
      .optional(),
    priceCents: z.number().min(1, "Preço deve ser maior que zero").optional(),
    stock: z
      .number()
      .min(0, "Estoque não pode ser negativo")
      .int("Estoque deve ser um número inteiro")
      .optional(),
    imageUrl: z
      .string()
      .min(1, "URL da imagem não pode estar vazia")
      .optional(),
    promoText: z
      .string()
      .max(50, "Texto promocional muito longo")
      .nullable()
      .optional(),
  })
  .partial() // Todos os campos são opcionais
  .refine(
    (data) => Object.keys(data).length > 0,
    "Pelo menos um campo deve ser fornecido para atualização"
  ) satisfies z.ZodType<UpdateProductDTO>;

// Schema específico para upload de imagem
export const updateProductImageSchema = z.object({
  imageUrl: z.string().min(1, "URL da imagem é obrigatória"),
});

// Validators para Orders
const orderItemSchema = z.object({
  id: z.string().min(1, "ID do produto é obrigatório"),
  name: z.string().min(1, "Nome do produto é obrigatório"),
  price: z.number().min(0, "Preço deve ser positivo"),
  quantity: z
    .number()
    .min(1, "Quantidade deve ser pelo menos 1")
    .int("Quantidade deve ser um número inteiro"),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Pelo menos um item é obrigatório"),
}) satisfies z.ZodType<CreateOrderDTO>;

// Validators para User/Auth
export const registerUserSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  document: z.string().length(11, "CPF deve ter 11 dígitos").optional(),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .max(15, "Telefone inválido")
    .optional(),
}) satisfies z.ZodType<RegisterUserDTO>;

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome muito longo")
    .optional(),
  document: z.string().length(11, "CPF deve ter 11 dígitos").optional(),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .max(15, "Telefone inválido")
    .optional(),
}) satisfies z.ZodType<UpdateUserDTO>;

// Validators para Payment
export const createPixPaymentSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Pelo menos um item é obrigatório"),
}) satisfies z.ZodType<CreatePixPaymentDTO>;

const cardDataSchema = z.object({
  number: z
    .string()
    .min(13, "Número do cartão inválido")
    .max(19, "Número do cartão inválido"),
  holderName: z.string().min(2, "Nome do portador é obrigatório"),
  expMonth: z.string().length(2, "Mês deve ter 2 dígitos"),
  expYear: z.string().length(4, "Ano deve ter 4 dígitos"),
  cvv: z.string().min(3, "CVV inválido").max(4, "CVV inválido"),
  installments: z
    .number()
    .min(1, "Parcelas inválidas")
    .max(12, "Máximo 12 parcelas")
    .int(),
  billingAddress: z
    .object({
      line1: z.string().min(5, "Endereço muito curto"),
      zipCode: z.string().length(8, "CEP deve ter 8 dígitos"),
      city: z.string().min(2, "Cidade inválida"),
      state: z.string().length(2, "Estado deve ter 2 caracteres"),
    })
    .optional(),
});

export const createCreditPaymentSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Pelo menos um item é obrigatório"),
  cardData: cardDataSchema,
}) satisfies z.ZodType<CreateCreditPaymentDTO>;

// Helper para validar DTOs
export function validateDTO<T>(
  schema: z.ZodType<T>,
  data: unknown
):
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: string[];
    } {
  try {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }

    // Log detalhado para debug
    console.error("=== ERRO DE VALIDAÇÃO DTO ===");
    console.error("Dados recebidos:", JSON.stringify(data, null, 2));
    console.error("Result:", result);
    console.error("Result.error:", result.error);
    console.error("Result.error.errors:", result.error?.errors);

    // Verificar se errors existe
    if (
      !result.error ||
      !result.error.errors ||
      !Array.isArray(result.error.errors)
    ) {
      console.error("Estrutura de erro inválida:", result.error);
      return {
        success: false,
        errors: ["Erro de validação - estrutura inválida"],
      };
    }

    const errors = result.error.errors.map(
      (err) =>
        `${err.path?.join?.(".") || "campo"}: ${
          err.message || "erro desconhecido"
        }`
    );
    return { success: false, errors };
  } catch (error) {
    console.error("Erro no validateDTO:", error);
    return {
      success: false,
      errors: ["Erro interno na validação"],
    };
  }
}

// Helper para criar respostas de erro padronizadas
export function createErrorResponse(
  error: string,
  details?: string[],
  code?: string
) {
  return {
    error,
    details,
    code,
    timestamp: new Date().toISOString(),
  };
}

// Helper para criar respostas de sucesso padronizadas
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    data,
    message,
  };
}
