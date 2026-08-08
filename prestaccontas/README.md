# PrestaContas — Gestão Financeira para Igrejas

Sistema de prestação de contas simplificada para igrejas, construído com Next.js 14 (App Router) e Supabase.

## Stack Tecnológica

- **Frontend:** Next.js 14, React 18, Tailwind CSS v4
- **Backend/DB:** Supabase (PostgreSQL) com Row Level Security
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Multi-Tenancy:** Isolamento via RLS no Supabase

## Funcionalidades

- **Dashboard Cinematográfico:** Visão geral financeira com gráficos interativos e modo telão
- **Controle de Entradas:** Registro de dízimos, ofertas e doações com filtros e paginação
- **Controle de Despesas:** Registro de saídas operacionais por categoria
- **Multi-Tenant:** Isolamento total de dados entre igrejas
- **Responsivo:** Interface adaptada para desktop e mobile

## Início Rápido

### 1. Clone e instale dependências

```bash
cd prestaccontas
npm install
```

### 2. Configure o Supabase

1. Crie um projeto no [Supabase](https://app.supabase.com)
2. Execute o script SQL em `database/schema.sql` no SQL Editor do Supabase
3. Copie `.env.local.example` para `.env.local` e preencha suas credenciais

### 3. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
src/
├── app/
│   ├── dashboard/
│   │   ├── entries/      # Página de entradas
│   │   ├── expenses/     # Página de despesas
│   │   ├── layout.tsx    # Layout com sidebar
│   │   └── page.tsx      # Dashboard principal
│   ├── login/
│   │   └── page.tsx      # Tela de login
│   ├── globals.css       # Tema cinematográfico
│   ├── layout.tsx        # Layout raiz
│   └── page.tsx          # Redirect para login
├── components/
│   ├── AreaChart.tsx     # Gráfico de área mensal
│   ├── DataTable.tsx     # Tabela com paginação
│   ├── DonutChart.tsx    # Gráfico de rosca
│   ├── EntryModal.tsx    # Modal de lançamento
│   ├── MetricCard.tsx    # Card de métrica
│   ├── RecentTransactions.tsx
│   └── Sidebar.tsx       # Navegação lateral
├── lib/
│   ├── supabase.ts       # Cliente Supabase
│   ├── supabase-server.ts
│   └── utils.ts          # Utilitários
└── types/
    └── database.ts       # Tipos TypeScript
```

## Multi-Tenancy

O isolamento de dados é garantido via Row Level Security (RLS) do Supabase:

- Cada igreja é um `tenant`
- Usuários são vinculados a um `tenant` via tabela `profiles`
- Todas as queries respeitam o `tenant_id` do usuário autenticado
- Políticas RLS impedem acesso cross-tenant

## Design

A interface segue um estilo cinematográfico ultra-dark:

- Fundo `zinc-950` com cards em glassmorphism
- Destaques em dourado (entradas) e rubi (despesas)
- Tipografia Geist (Inter) com mono para números
- Animações fluidas e redução de movimento respeitada

## Licença

MIT
