## Mercadito — E-commerce local, mobile-first

Uma loja online pensada para mercearias de bairro: rápido no celular, simples para o cliente e prático para o lojista. Desenvolvi o projeto inteiro com Next.js (App Router), autenticação segura, carrinho persistente e checkout integrado ao Mercado Pago (PIX com QR na tela e cartão). No painel admin, dá para cadastrar produtos com upload de imagem (S3), gerenciar estoque e configurar frete dinâmico.

### Principais recursos
- Autenticação com verificação de e-mail e recuperação de senha
- Carrinho e checkout com Mercado Pago (PIX integrado na página e cartão de crédito)
- Webhook do Mercado Pago com verificação de assinatura
- Área do cliente com histórico e status de pedidos
- Painel admin completo:
  - Cadastro/edição de produtos com upload de imagem para AWS S3
  - Gestão de estoque
  - Configuração de frete dinâmica (com histórico de versões)
- Layout mobile-first com barra inferior fixa (sem encobrir conteúdo)

### Stack
- Next.js 15 (App Router, React 19) + TypeScript
- Prisma ORM + PostgreSQL
- NextAuth para sessão/autenticação
- Mercado Pago SDK (PIX e cartão)
- Resend para e-mails (verificação e reset de senha)
- AWS S3 para mídia de produtos
- Tailwind CSS + componentes próprios (shadcn-style)

---

## Como rodar localmente

1) Requisitos
- Node.js 18+
- PostgreSQL rodando e acessível (DATABASE_URL)

2) Variáveis de ambiente (.env)

Crie um arquivo `.env` na raiz com:

```
# Banco
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="uma_chave_segura"

# Mercado Pago
MERCADOPAGO_PUBLIC_KEY="pk_test_xxx_ou_pk_prod_xxx"
MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxx"
MERCADOPAGO_WEBHOOK_SECRET="uma-assinatura-secreta-para-validar-webhooks"

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="nome-do-bucket"

# Resend (e-mail)
RESEND_API_KEY="re_xxx"
```

3) Instalar e preparar
```
yarn
yarn prisma migrate dev
yarn dev
```
O app sobe em http://localhost:3000

4) Tornar um usuário admin (acesso ao painel `/admin`)

Depois de se cadastrar pela interface, rode:
```
node make-admin.js seu-email@exemplo.com
```

---

## Pagamentos (Mercado Pago)

- PIX Checkout Transparente: o QR Code e a chave copia-e-cola aparecem direto no checkout, sem redirecionar.
  - Observação: para o QR renderizado funcionar, a conta recebedora precisa ter a chave PIX habilitada no Mercado Pago. Caso contrário, a API retorna erro informando que a chave não está habilitada.
- Cartão de crédito: integração direta com a API do Mercado Pago, com valores tratados corretamente (reais ↔ centavos).
- Webhook: rota segura com verificação de assinatura para processar eventos de pagamento/atualização.

Configuração do Webhook no Mercado Pago:
- URL: `https://SEU_DOMINIO/api/checkout/mercadopago-webhook`
- Eventos: Pagamentos (e Orders se desejar acompanhar preferências)
- Assinatura secreta: usar o valor de `MERCADOPAGO_WEBHOOK_SECRET`

---

## Admin
- Produtos: criação/edição, upload de imagens para S3, preço, estoque, categoria, etc.
- Estoque: ajuste rápido e indicadores visuais.
- Frete: página para configurar endereço/base da loja, CEP e faixas de preço por distância/valor (persistido em banco via `ShippingConfig`).

---

## Modelagem e dados
- Prisma com PostgreSQL (migrations versionadas em `prisma/migrations`).
- Recursos adicionais:
  - `EmailVerification` para fluxo de verificação (código de 6 dígitos, expiração, tentativas, etc.).
  - `ShippingConfig` para frete com versionamento (sempre uma configuração ativa).

Comandos úteis do Prisma:
```
yarn prisma generate
yarn prisma migrate dev
yarn prisma studio
```

---

## Infra e mídia
- Upload de imagens via componente no admin, enviando para AWS S3 com presign.
- Otimização de UI para mobile; padding global para não ser encoberto pela bottom bar.

---

## E-mails
- Envio via Resend (templates HTML simples).
- Fluxo de verificação de e-mail em 2 etapas e reset de senha com mensagens claras de erro (ex.: “Usuário não encontrado”).

---

## Scripts e build
```
yarn dev       # desenvolvimento
yarn build     # prisma generate + next build
yarn start     # produção local
```

Deploy recomendado: Vercel (com as variáveis de ambiente configuradas e o webhook do Mercado Pago apontando para produção).

---

## O que não tem (e por quê)
- Pagar.me e integrações legadas foram removidas para manter o escopo enxuto e focado em Mercado Pago.
- Rotas de “reset de banco” de desenvolvimento foram desativadas/remoções para segurança em produção.

---

## Uso de IA
Não há uso de bibliotecas, SDKs ou APIs de Inteligência Artificial no código. Toda a lógica de negócio (checkout, webhook, e-mail, frete, admin, etc.) foi implementada manualmente.

---

## Roadmap curto
- Cupons de desconto
- Relatórios de vendas no admin
- Avaliações de produtos

---

## Licença
Projeto de portfólio. Uso livre para estudo e inspiração.


