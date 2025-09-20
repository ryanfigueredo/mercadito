# 🔐 Sistema Admin - Configuração

## Funcionalidades Implementadas

✅ **Autenticação por usuário**: Apenas usuários com `isAdmin: true` podem acessar  
✅ **Design mobile-first**: Interface otimizada para dispositivos móveis  
✅ **Responsividade desktop**: Layout adaptado para telas maiores  
✅ **Dashboard com estatísticas**: Resumo de pedidos, produtos e métricas  
✅ **Navegação intuitiva**: Menu de navegação entre seções

## 🚀 Como Configurar um Usuário Admin

### 1. Primeiro, crie uma conta normal

- Acesse `/register` e crie uma conta
- Faça login normalmente

### 2. Promover usuário a admin via banco de dados

**Opção A: Usando Prisma Studio**

```bash
npx prisma studio
```

- Abra a tabela `User`
- Encontre seu usuário pelo email
- Altere o campo `isAdmin` para `true`
- Salve

**Opção B: Usando SQL direto**

```sql
UPDATE "User"
SET "isAdmin" = true
WHERE email = 'seu-email@exemplo.com';
```

**Opção C: Script Node.js**

```javascript
// make-admin.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function makeAdmin() {
  await prisma.user.update({
    where: { email: "seu-email@exemplo.com" },
    data: { isAdmin: true },
  });
  console.log("✅ Usuário promovido a admin!");
}

makeAdmin();
```

### 3. Teste o acesso

- Faça logout e login novamente
- Acesse `/admin` - deve funcionar normalmente
- Se não for admin, será redirecionado para home com erro

## 📱 Interface Admin

### Dashboard (`/admin`)

- **Estatísticas**: Pedidos pendentes, total de pedidos, produtos cadastrados
- **Ações rápidas**: Links diretos para principais funcionalidades
- **Alertas**: Notificações importantes (ex: nenhum produto cadastrado)

### Seções Disponíveis

- **Dashboard** (`/admin`) - Visão geral e estatísticas
- **Pedidos** (`/admin/pedidos`) - Gerenciar pedidos (aprovar, enviar, entregar)
- **Produtos** (`/admin/produtos`) - Cadastrar e editar produtos
- **Estoque** (`/admin/estoque`) - Controle de quantidades

## 🎨 Design System

### Mobile-First

- Container: `max-w-sm` (384px)
- Padding: `px-4` (16px)
- Cards: `rounded-2xl` com bordas suaves
- Cores: Paleta consistente com o app principal

### Desktop (lg+)

- Container: `max-w-6xl` (1152px)
- Layout em grid para melhor aproveitamento do espaço
- Elementos maiores e mais espaçados
- Seção adicional para gráficos/relatórios (futuro)

### Cores Principais

- **Primary**: `#F8B075` (laranja do app)
- **Background**: `bg-gray-50`
- **Cards**: `bg-white` com `border`
- **Text**: `text-gray-900` / `text-gray-600`

## 🔒 Segurança

### Middleware de Autenticação

- Função `requireAdmin()` verifica se usuário é admin
- Redirecionamento automático se não autorizado
- Sessão verificada em cada página admin

### Proteções Implementadas

- ✅ Verificação de sessão ativa
- ✅ Verificação de flag `isAdmin`
- ✅ Redirecionamento para login se não autenticado
- ✅ Redirecionamento para home se não for admin

## 🚧 Próximos Passos

1. **Melhorar páginas específicas**:

   - `/admin/pedidos` - Lista e ações nos pedidos
   - `/admin/produtos` - CRUD de produtos
   - `/admin/estoque` - Controle de inventário

2. **Funcionalidades futuras**:
   - Gráficos e relatórios
   - Notificações em tempo real
   - Histórico de ações
   - Configurações do sistema

## 📋 Checklist de Implementação

- [x] Campo `isAdmin` no modelo User
- [x] Migration para adicionar campo
- [x] Função `requireAdmin()`
- [x] Layout admin responsivo
- [x] Dashboard com estatísticas
- [x] Navegação entre seções
- [x] Design mobile-first
- [x] Responsividade desktop
- [ ] Páginas específicas (pedidos, produtos, estoque)
- [ ] Funcionalidades avançadas
