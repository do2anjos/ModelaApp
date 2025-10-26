# Design System de Tipografia - Modela+

## Visão Geral

Este documento define o sistema de tipografia do projeto Modela+, baseado em princípios de design moderno e acessibilidade.

## Fontes

### Famílias de Fonte
- **Heading**: `'Montserrat', sans-serif` - Para títulos e elementos de destaque
- **Body**: `'Roboto', sans-serif` - Para texto corrido e interface

### Pesos de Fonte
```css
--font-weight-light: 300
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-extrabold: 800
```

## Escala Tipográfica

### Tamanhos de Fonte
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

### Hierarquia de Cabeçalhos
- **H1**: `text-5xl` (48px) - Títulos principais
- **H2**: `text-4xl` (36px) - Seções principais
- **H3**: `text-2xl` (24px) - Subseções
- **H4**: `text-xl` (20px) - Títulos de componentes
- **H5**: `text-lg` (18px) - Subtítulos
- **H6**: `text-base` (16px) - Labels

## Espaçamento de Linha

```css
--leading-tight: 1.25    /* Para títulos */
--leading-snug: 1.375    /* Para subtítulos */
--leading-normal: 1.5    /* Para texto padrão */
--leading-relaxed: 1.625  /* Para texto longo */
--leading-loose: 2       /* Para texto espaçado */
```

## Espaçamento de Letras

```css
--tracking-tighter: -0.05em  /* Para títulos grandes */
--tracking-tight: -0.025em   /* Para títulos */
--tracking-normal: 0em       /* Para texto padrão */
--tracking-wide: 0.025em     /* Para labels */
--tracking-wider: 0.05em     /* Para botões */
--tracking-widest: 0.1em     /* Para elementos especiais */
```

## Classes Utilitárias

### Tamanhos
```css
.text-xs     /* 12px */
.text-sm     /* 14px */
.text-base   /* 16px */
.text-lg     /* 18px */
.text-xl     /* 20px */
.text-2xl    /* 24px */
.text-3xl    /* 30px */
.text-4xl    /* 36px */
.text-5xl    /* 48px */
.text-6xl    /* 60px */
```

### Pesos
```css
.font-light     /* 300 */
.font-normal    /* 400 */
.font-medium    /* 500 */
.font-semibold  /* 600 */
.font-bold      /* 700 */
.font-extrabold /* 800 */
```

### Alinhamento
```css
.text-left
.text-center
.text-right
```

### Espaçamento de Linha
```css
.leading-tight
.leading-normal
.leading-relaxed
```

### Espaçamento de Letras
```css
.tracking-tight
.tracking-normal
.tracking-wide
```

## Componentes Específicos

### Botões
- **Padrão**: `text-sm`, `font-medium`
- **Pequeno**: `text-xs`
- **Grande**: `text-base`, `font-semibold`
- **Extra Grande**: `text-lg`, `font-semibold`

### Ranking
- **Posição**: `text-lg`, `font-bold`, `font-heading`
- **Nome**: `text-base`, `font-medium`, `font-heading`
- **Pontuação**: `text-base`, `font-semibold`
- **Detalhes**: `text-sm`, `font-normal`

### Pódio
- **Rank**: `text-4xl`, `font-extrabold`, `font-heading`
- **Nome**: `text-lg`, `font-semibold`, `font-heading`
- **Pontuação**: `text-base`, `font-semibold`

## Responsividade

### Desktop (>1024px)
- Base: 14px
- H1: `text-5xl`
- H2: `text-4xl`
- H3: `text-2xl`

### Tablet (768px - 1024px)
- Base: 13px
- H1: `text-4xl`
- H2: `text-3xl`
- H3: `text-xl`

### Mobile (<768px)
- Base: 12px
- H1: `text-3xl`
- H2: `text-2xl`
- H3: `text-lg`

### Mobile Pequeno (<480px)
- Base: 12px
- H1: `text-2xl`
- H2: `text-xl`
- H3: `text-base`

## Acessibilidade

### Contraste
- Todos os textos seguem o padrão WCAG AA
- Contraste mínimo de 4.5:1 para texto normal
- Contraste mínimo de 3:1 para texto grande

### Legibilidade
- Line-height mínimo de 1.5 para texto corrido
- Espaçamento adequado entre elementos
- Tamanhos de fonte respeitando limites mínimos

## Uso Recomendado

### Títulos de Página
```html
<h1 class="text-5xl font-extrabold leading-tight tracking-tighter">
  Título Principal
</h1>
```

### Subtítulos
```html
<h2 class="text-4xl font-bold leading-tight">
  Seção Principal
</h2>
```

### Texto Corrido
```html
<p class="text-base leading-relaxed">
  Parágrafo de texto corrido com boa legibilidade.
</p>
```

### Botões
```html
<button class="button button-primary">
  Ação Principal
</button>
```

### Cards de Ranking
```html
<div class="podium-name text-lg font-semibold">
  Nome do Usuário
</div>
<div class="podium-score text-base font-semibold">
  1.250 pts
</div>
```

## Manutenção

### Adicionando Novos Tamanhos
1. Defina a variável CSS na seção `:root`
2. Adicione a classe utilitária correspondente
3. Atualize a documentação
4. Teste em diferentes dispositivos

### Modificando Pesos
1. Ajuste as variáveis de peso
2. Verifique o contraste em modo claro e escuro
3. Teste a legibilidade em diferentes tamanhos

### Responsividade
1. Sempre teste em múltiplos dispositivos
2. Use as variáveis CSS para consistência
3. Mantenha a hierarquia visual clara

