# Tema SOL_ORIENTE_POP 🧡💛

## Visão Geral

O tema SOL_ORIENTE_POP é um sistema de design vibrante e popular que combina cores quentes (laranja e amarelo) com elementos neutros para criar uma experiência visual energética e acolhedora.

## Paleta de Cores

### Cores Principais

- **Laranja Principal**: `#D75413` - Cor de destaque para elementos interativos
- **Amarelo Acento**: `#E7C200` - Cor secundária para detalhes e contrastes

### Cores Neutras

- **Branco**: `#FFFFFF` - Fundo principal
- **Cinza Claro**: `#F8F8F8` - Fundos secundários e bordas
- **Cinza Médio**: `#666666` - Textos secundários
- **Cinza Escuro**: `#333333` - Textos principais

## Componentes

### Botões

```tsx
// Botão primário (laranja)
<Button variant="default">Ação Principal</Button>

// Botão secundário (outline laranja)
<Button variant="secondary">Ação Secundária</Button>

// Botão de acento (amarelo)
<Button variant="accent">Destaque</Button>

// Botão de destaque (amarelo forte)
<Button variant="highlight">Promoção</Button>
```

### Cards

```tsx
// Card padrão com tema SOL_ORIENTE_POP
<Card className="sol-card">
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição do conteúdo</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo do card</CardContent>
</Card>
```

### Inputs

```tsx
// Input com tema SOL_ORIENTE_POP
<Input placeholder="Digite aqui..." className="sol-input" />
```

## Classes CSS Utilitárias

### Layout

- `.sol-container` - Container principal com padding responsivo
- `.sol-section` - Seção com espaçamento padrão
- `.sol-grid` - Grid com gap padrão

### Tipografia

- `.sol-title-primary` - Título principal (cinza escuro)
- `.sol-title-secondary` - Título secundário (laranja)
- `.sol-text-primary` - Texto principal (cinza escuro)
- `.sol-text-secondary` - Texto secundário (cinza médio)
- `.sol-text-accent` - Texto de destaque (laranja)

### Badges e Tags

- `.sol-badge-primary` - Badge laranja
- `.sol-badge-accent` - Badge amarelo
- `.sol-badge-neutral` - Badge neutro

### Indicadores

- `.sol-indicator-active` - Indicador de aba ativa (amarelo)
- `.sol-indicator-primary` - Indicador primário (laranja)

### Animações

- `.sol-fade-in` - Animação de fade in
- `.sol-slide-up` - Animação de slide up
- `.sol-bounce-subtle` - Animação de bounce sutil

### Efeitos Especiais

- `.sol-glow` - Brilho laranja
- `.sol-glow-yellow` - Brilho amarelo

## Diretrizes de Uso

### ✅ Boas Práticas

1. **Use o laranja para ações principais** - Botões de compra, cadastro, etc.
2. **Use o amarelo para destaques** - Promoções, badges, indicadores
3. **Mantenha o branco como fundo principal** - Para destacar o conteúdo
4. **Use cinzas para textos** - Garantindo boa legibilidade
5. **Aplique bordas arredondadas** - Para um visual mais amigável

### ❌ Evite

1. **Laranja sobre amarelo** - Contraste baixo, difícil leitura
2. **Excesso de cores vibrantes** - Use neutros para "respirar"
3. **Textos pequenos em cores vibrantes** - Sempre use cores escuras para textos

## Exemplos de Aplicação

### Cabeçalho

```tsx
<header className="sol-header">
  <div className="sol-container">
    <h1 className="sol-title-primary">Mercadito</h1>
  </div>
</header>
```

### Card de Produto

```tsx
<div className="sol-card group">
  <img className="group-hover:scale-105 transition-transform" />
  <div className="p-4">
    <h3 className="sol-title-accent">Nome do Produto</h3>
    <p className="sol-text-secondary">Categoria</p>
    <span className="sol-badge-accent">Promoção</span>
  </div>
</div>
```

### Formulário

```tsx
<form className="space-y-4">
  <Input className="sol-input" placeholder="Email" />
  <Button variant="default" className="w-full">
    Entrar
  </Button>
</form>
```

## Responsividade

O tema é totalmente responsivo e funciona bem em:

- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## Acessibilidade

- Contraste WCAG AA garantido
- Foco visível em todos os elementos interativos
- Suporte a leitores de tela
- Cores não são o único indicador de estado

## Customização

Para personalizar o tema, edite as variáveis CSS em `src/styles/globals.css`:

```css
:root {
  --sol-orange: #d75413;
  --sol-yellow: #e7c200;
  --sol-gray-light: #f8f8f8;
  --sol-gray-dark: #333333;
  --sol-gray-medium: #666666;
  --sol-white: #ffffff;
}
```

---

**Tema SOL_ORIENTE_POP** - Vibrante, popular e acolhedor! 🌅✨
