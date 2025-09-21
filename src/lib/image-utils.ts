/**
 * Converte uma URL S3 direta em uma URL segura da nossa API
 * que serve imagens através de signed URLs
 */
export function getSecureImageUrl(s3Url?: string | null): string {
  if (!s3Url) {
    return "/api/images/placeholder";
  }

  // Se já é uma URL da nossa API, retorna como está
  if (s3Url.startsWith("/api/images/")) {
    return s3Url;
  }

  // Se é uma URL S3, extrair o path e converter para nossa API
  if (s3Url.includes("amazonaws.com/")) {
    try {
      const url = new URL(s3Url);
      const path = url.pathname.substring(1); // Remove a barra inicial
      return `/api/images/${path}`;
    } catch {
      return "/api/images/placeholder";
    }
  }

  // Se é um path relativo, assumir que é uma imagem local
  if (s3Url.startsWith("/")) {
    return s3Url;
  }

  // Fallback para placeholder
  return "/api/images/placeholder";
}

/**
 * Extrai o path S3 de uma URL completa
 */
export function extractS3Path(s3Url: string): string | null {
  try {
    if (s3Url.includes("amazonaws.com/")) {
      const url = new URL(s3Url);
      return url.pathname.substring(1); // Remove a barra inicial
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Verifica se uma URL é uma imagem S3 válida
 */
export function isS3ImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.includes("amazonaws.com/") && url.includes("/products/");
}

/**
 * Gera uma URL de imagem otimizada baseada no contexto
 */
export function getOptimizedImageUrl(
  imageUrl?: string | null,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): string {
  const secureUrl = getSecureImageUrl(imageUrl);

  // Se é placeholder, retorna direto
  if (secureUrl === "/api/images/placeholder") {
    return secureUrl;
  }

  // Para URLs da nossa API, podemos adicionar parâmetros de otimização no futuro
  const params = new URLSearchParams();
  if (options.width) params.set("w", options.width.toString());
  if (options.height) params.set("h", options.height.toString());
  if (options.quality) params.set("q", options.quality.toString());

  const queryString = params.toString();
  return queryString ? `${secureUrl}?${queryString}` : secureUrl;
}
