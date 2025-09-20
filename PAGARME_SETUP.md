# 🔧 Como Configurar o Pagar.me

## Problema Atual

A API Key do Pagar.me está incorreta. Você está usando uma **Public Key** (`pk_`) quando deveria usar uma **Secret Key** (`sk_`).

## ❌ Configuração Atual (Incorreta)

```
PAGARME_API_KEY="pk_P7V5p1ZTr1SY2aro"  # ❌ Public Key (pk_)
```

## ✅ Configuração Correta

```
PAGARME_API_KEY="sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"  # ✅ Secret Key (sk_)
```

## Passos para Corrigir:

### 1. Acesse o Dashboard do Pagar.me

- Entre em https://dashboard.pagar.me/
- Faça login na sua conta

### 2. Vá para API Keys

- No menu lateral, clique em **"Configurações"** ou **"API Keys"**
- Você verá duas chaves:
  - **Public Key** (pk\_...) - para frontend
  - **Secret Key** (sk\_...) - para backend ⭐ **Esta é a que precisamos!**

### 3. Copie a Secret Key

- Copie a chave que começa com `sk_test_...` (para ambiente de teste)
- A chave completa deve ter aproximadamente 40-50 caracteres

### 4. Atualize o arquivo .env

```bash
# Substitua a linha atual por:
PAGARME_API_KEY="sk_test_SUA_CHAVE_COMPLETA_AQUI"
```

### 5. Reinicie o servidor

```bash
# Pare o servidor (Ctrl+C) e rode novamente:
npm run dev
# ou
yarn dev
```

## 🔒 Segurança

- **NUNCA** exponha a Secret Key no frontend
- **NUNCA** commite a Secret Key no Git
- Use a chave de **teste** (`sk_test_`) em desenvolvimento
- Use a chave de **produção** (`sk_live_`) apenas em produção

## 📝 Exemplo de .env Correto

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Pagar.me - USE A SECRET KEY (sk_)
PAGARME_API_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
PAGARME_BASE_URL="https://api.pagar.me/core/v5"
PAGARME_WEBHOOK_USER="mercadito"
PAGARME_WEBHOOK_PASSWORD="mercadito_webhook_2024_secret_key"
```

## ✅ Como Testar se Funcionou

Após atualizar a chave, tente fazer um pagamento PIX novamente. O erro de autorização deve desaparecer.
