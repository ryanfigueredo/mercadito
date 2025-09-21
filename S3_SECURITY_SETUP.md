# 🔒 Configuração de Segurança S3

## Problema Atual

O bucket S3 está **privado** (access denied), mas as imagens precisam ser acessíveis de forma segura.

## ✅ Solução Implementada: Signed URLs

### **Como funciona:**

1. **Bucket privado** - Ninguém pode acessar diretamente
2. **API proxy** - Nossa API gera URLs temporárias e seguras
3. **URLs assinadas** - Válidas por 1 hora, depois expiram
4. **Controle total** - Apenas nossa aplicação pode gerar os links

### **Fluxo de segurança:**

```
❌ Antes: https://bucket.s3.amazonaws.com/image.jpg (público)
✅ Agora: /api/images/products/abc/123.jpg → URL assinada temporária
```

## 🔧 Configuração do Bucket S3

### 1. **Bucket Policy (Recomendado)**

No AWS Console → S3 → Seu bucket → Permissions → Bucket Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyDirectPublicAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mercaditoapp/*",
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalServiceName": "s3.amazonaws.com"
        }
      }
    },
    {
      "Sid": "AllowSignedURLAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::SEU_ACCOUNT_ID:user/SEU_USER"
      },
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::mercaditoapp/*"
    }
  ]
}
```

### 2. **Block Public Access (Recomendado)**

- ✅ Block all public access: **ON**
- ✅ Block public access to buckets and objects granted through new access control lists (ACLs): **ON**
- ✅ Block public access to buckets and objects granted through any access control lists (ACLs): **ON**
- ✅ Block public access to buckets and objects granted through new public bucket or access point policies: **ON**
- ✅ Block public access to buckets and objects granted through any public bucket or access point policies: **ON**

## 🚀 Como Funciona no Código

### **1. Upload (Continua igual)**

```typescript
// Upload normal para S3 (privado)
const imageUrl = await uploadToS3(buffer, key, contentType);
// Salva URL S3 no banco: https://bucket.s3.amazonaws.com/products/...
```

### **2. Exibição (Agora segura)**

```typescript
// Antes (inseguro)
<img src={product.imageUrl} /> // ❌ Access denied

// Agora (seguro)
<img src={getSecureImageUrl(product.imageUrl)} /> // ✅ Funciona!
// Resultado: /api/images/products/abc/123.jpg
```

### **3. API Proxy**

```typescript
// /api/images/[...path]/route.ts
GET /api/images/products/abc/123.jpg
↓
Gera signed URL válida por 1 hora
↓
Redireciona para URL assinada temporária
```

## 🛡️ Benefícios de Segurança

### **✅ Vantagens:**

- **Bucket privado** - Ninguém pode acessar diretamente
- **URLs temporárias** - Expiram em 1 hora
- **Controle de acesso** - Apenas nossa API pode gerar links
- **Logs completos** - Sabemos quem acessa o quê
- **Proteção contra hotlinking** - Links não funcionam em outros sites

### **🔒 Proteções:**

- URLs não podem ser compartilhadas permanentemente
- Links expiram automaticamente
- Acesso apenas através da nossa aplicação
- Bucket totalmente privado
- Controle granular de permissões

## 📋 Checklist de Implementação

- [x] API proxy criada (`/api/images/[...path]`)
- [x] Função `getSecureImageUrl()` implementada
- [x] ProductCard atualizado
- [x] Admin estoque atualizado
- [x] Admin produtos atualizado
- [x] Página de edição atualizada
- [x] Fallback placeholder criado
- [ ] Configurar bucket S3 como privado
- [ ] Testar acesso seguro

## 🎯 Próximo Passo

**Configure o bucket como privado** no AWS Console e teste - as imagens devem aparecer normalmente através da nossa API, mas os links diretos S3 devem dar access denied. Isso é o comportamento desejado! 🔐✨
