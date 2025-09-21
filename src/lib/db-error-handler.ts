import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export function handleDatabaseError(error: unknown): DatabaseError {
  console.error("Database error:", error);

  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return new DatabaseError(
          "Registro duplicado. Este item já existe.",
          "DUPLICATE_RECORD",
          false
        );
      case "P2025":
        return new DatabaseError(
          "Registro não encontrado.",
          "RECORD_NOT_FOUND",
          false
        );
      case "P2003":
        return new DatabaseError(
          "Violação de chave estrangeira. Verifique as dependências.",
          "FOREIGN_KEY_VIOLATION",
          false
        );
      default:
        return new DatabaseError(
          "Erro de banco de dados.",
          "DATABASE_ERROR",
          true
        );
    }
  }

  // Erros de conexão
  if (error instanceof Error) {
    if (error.message.includes("Can't reach database server")) {
      return new DatabaseError(
        "Não foi possível conectar ao banco de dados. Tente novamente em alguns instantes.",
        "CONNECTION_ERROR",
        true
      );
    }

    if (error.message.includes("timeout")) {
      return new DatabaseError(
        "Timeout na conexão com o banco. Tente novamente.",
        "TIMEOUT_ERROR",
        true
      );
    }

    if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("ECONNREFUSED")
    ) {
      return new DatabaseError(
        "Servidor de banco indisponível temporariamente.",
        "SERVER_UNAVAILABLE",
        true
      );
    }
  }

  return new DatabaseError(
    "Erro interno do banco de dados.",
    "UNKNOWN_ERROR",
    true
  );
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const dbError = handleDatabaseError(error);

      console.warn(
        `Tentativa ${attempt}/${maxRetries} falhou:`,
        dbError.message
      );

      if (!dbError.isRetryable || attempt === maxRetries) {
        throw dbError;
      }

      // Aguardar antes da próxima tentativa
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw handleDatabaseError(lastError);
}
