# 💰 financialChurch - Gestão Financeira para Igrejas

Um SaaS moderno e robusto para gestão financeira de igrejas, templos e comunidades religiosas. Centraliza operações de dízimos, ofertas, despesas e gera relatórios em tempo real com transparência total.

![financialChurch](https://img.shields.io/badge/financialChurch-SaaS%20Church%20Management-gold)
![TanStack](https://img.shields.io/badge/TanStack-Router%20%2B%20Query%20%2B%20Start-blue)
![Appwrite](https://img.shields.io/badge/Appwrite-Backend%20%2B%20Auth-9f6cf2)
![Stripe](https://img.shields.io/badge/Stripe-Subscriptions-darkblue)

---

## 📋 O que é financialChurch?

**financialChurch** é uma plataforma SaaS completa para gestão de finanças eclesiásticas. Oferece painéis intuitivos, operações por papel (Dono SaaS, Administrador, Tesoureiro, Pastor, Membro) e relatórios detalhados em múltiplos formatos.

### Principais Funcionalidades

- ✅ **Registro de Dízimos** – Rastreamento de contribuições periódicas com filtros por período e forma de pagamento
- ✅ **Gestão de Ofertas** – Classificação por campanha, tipo e contribuinte com metas de arrecadação
- ✅ **Controle de Despesas** – Lançamento de saídas com categorias, aprovação e status de pagamento
- ✅ **Relatórios Financeiros** – PDF, Excel, CSV e impressão direta de consolidados mensais
- ✅ **Votos e Promessas** – Registro especial para contribuições futuras/promessas da congregação
- ✅ **Autenticação Segura** – Sistema de login com recuperação de senha e autenticação por cookie signed
- ✅ **Multi-Tenant** – Múltiplas igrejas em um só SaaS com isolamento de dados
- ✅ **Controle de Acesso** – Papéis diferenciados com permissões granulares
- ✅ **Integração Stripe** – Checkout seguro para assinaturas de planos
- ✅ **Dashboard Responsivo** – Interface moderna e adaptável para desktop e mobile

---

## 🎯 Como Funciona

### Fluxo de Uso

#### 1. **Landing Page** (`/`)
Apresenta a plataforma, recursos, módulos financeiros e planos de assinatura em layout elegante.

#### 2. **Autenticação** (`/_auth/*`)
```
├── /sign-in          → Login com email/usuário e senha
├── /sign-up          → Criar nova conta
├── /forgot-password  → Solicitar email de recuperação
└── /reset-password   → Redefinir senha
```

#### 3. **Dashboard Protegido** (`/_protected/dashboard`)
Painel customizado por papel do usuário com:

- **Dono SaaS** – Visão executiva da plataforma
  - Métricas de MRR, churn, conversão
  - Distribuição de planos por template
  - Auditoria de assinaturas
  - Uso por tenant

- **Administrador** – Controle da Igreja
  - Resumo financeiro (receitas, despesas, usuários)
  - Gestão de dízimos, ofertas, despesas
  - Relatorios consolidados
  - Gerenciar usuários da equipe

- **Tesoureiro** – Operações Diárias
  - Entrada/saída diária
  - Formulários para dízimos, ofertas, votos e saídas
  - Totais mensais por categoria
  - Exportação de relatórios (CSV, JSON, TXT, PDF)

- **Pastor** – Acompanhamento Ministerial
  - Visualização somente leitura
  - Campanhas e metas
  - Relatórios de contribuintes
  - Transparência com a congregação

- **Membro** – Totais Pessoais
  - Resumo mensal de contribuições
  - Visualização de dízimos, ofertas e votos
  - Dados disponibilizados pelo administrador

#### 4. **Assinaturas** (`/assinaturas`)
Página de planos com checkout Stripe:

- **Plano Inicial** (Gratuito)
  - Até 50 membros
  - Dízimos e ofertas
  - Dashboard básico
  - Exportação CSV

- **Plano Padrão** (R$ 89/mês)
  - Membros ilimitados
  - Módulos financeiros completos
  - Relatórios PDF e Excel
  - Checkout Stripe integrado

- **Plano Premium** (R$ 249/mês)
  - Múltiplas filiais
  - Relatórios consolidados
  - Onboarding dedicado
  - SLA e integrações avançadas

---

## 🏗️ Arquitetura Tech

### Frontend
- **TanStack Router** – Roteamento de arquivo baseado
- **TanStack Query** – State management e cache de dados
- **TanStack Start** – Server functions (isomorfe)
- **React 19** – Componentes e hooks
- **Tailwind CSS** – Estilização
- **Shadcn/UI** – Componentes acessíveis

### Backend
- **TanStack Start Server Functions** – API isomorfe (TypeScript full-stack)
- **Appwrite** – Auth, banco de dados, storage
- **Stripe SDK** – Processamento de pagamentos
- **Zod** – Validação de schemas

### Infraestrutura
- **Node.js/Bun** – Runtime
- **Vite** – Build tool
- **Vitest** – Testes unitários
- **ESLint + Prettier** – Code quality

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+ ou Bun
- Conta Appwrite (self-hosted ou cloud)
- Chave Stripe (opcional, para checkouts)

### Instalação

```bash
# Clonar repositório
git clone https://github.com/messias1976/financeiro-igreja.git
cd financeiro-igreja

# Instalar dependências
bun install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas chaves Appwrite, Stripe, etc.

# Executar em desenvolvimento
bun run dev

# Abrir http://localhost:3000 no navegador
```

---

## 🔧 Configuração de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Appwrite
APPWRITE_ENDPOINT=https://seu-appwrite.com/v1
APPWRITE_API_KEY=sua_chave_api_appwrite
APPWRITE_PROJECT_ID=seu_project_id
APPWRITE_DATABASE_ID=seu_database_id
APPWRITE_COLLECTION_TITHES_ID=colecao_dizimos
APPWRITE_COLLECTION_OFFERINGS_ID=colecao_ofertas
APPWRITE_COLLECTION_EXPENSES_ID=colecao_despesas
APPWRITE_BUCKET_ID=seu_bucket_storage

# Stripe
STRIPE_SECRET_KEY=sk_live_sua_chave
STRIPE_PRICE_PADRAO=price_stripe_padrao
STRIPE_PRICE_PREMIUM=price_stripe_premium

# Aplicação
APP_URL=http://localhost:3000
VITE_SAAS_OWNER_EMAIL=dono@financialchurch.com
```

---

## 💻 Scripts Disponíveis

```bash
# Desenvolvimento
bun run dev              # Inicia servidor em localhost:3000

# Build e Deploy
bun run build            # Compila para produção
bun start                # Executa build de produção
bun run build:node       # Build otimizado para Node.js

# Código
bun run lint             # ESLint checker
bun run format           # Prettier formatter
bun run format:check     # Verifica formatação
bun run test             # Vitest runner
bun run generate:routes  # Regenera TanStack Router

# Banco de Dados (Prisma - futuro)
bun run db:migrate       # Aplica migrações
bun run db:studio        # Abre Prisma Studio
```

---

## 📊 Estrutura de Dados

### Usuários (Appwrite Auth)
```typescript
{
  id: string
  email: string
  name?: string
  prefs: {
    role: 'dono_saas' | 'administrador' | 'tesoureiro' | 'pastor' | 'membro'
    churchId: string
    churchName: string
    churchPlan: 'inicial' | 'padrao' | 'premium'
  }
}
```

### Dízimos
```typescript
{
  $id: string
  amount: number
  titheDate: string (ISO)
  periodReference: string (YYYY-MM)
  paymentMethod: 'dinheiro' | 'pix' | 'transferencia' | 'cartao' | 'deposito'
  contributorName?: string
  referenceNumber?: string
  notes?: string
  churchId: string
}
```

### Ofertas
```typescript
{
  $id: string
  amount: number
  offeringDate: string (ISO)
  offeringType: 'geral' | 'missoes' | 'construcao' | 'acao-social' | 'especial' | 'voto'
  campaign?: string
  paymentMethod: string
  contributorName?: string
  notes?: string
  churchId: string
}
```

### Despesas
```typescript
{
  $id: string
  description: string
  amount: number
  expenseDate: string (ISO)
  category: 'infraestrutura' | 'ministerio' | 'manutencao' | 'administrativo' | 'outros'
  vendor?: string
  paymentMethod: string
  status: 'pending' | 'approved' | 'paid'
  notes?: string
  churchId: string
}
```

---

## 🔐 Segurança e Autenticação

- **Autenticação JWT** via Appwrite + Cookie Signed Custom
- **Session Fallback** – Cookie HMAC assinado para confiabilidade em múltiplos ambientes
- **Isolamento Multi-Tenant** – Todos os queries filtram por `churchId`
- **CORS** – Configurado para aceitar origem dinâmica em produção
- **HTTPS** – Recomendado em produção; detectado via `x-forwarded-proto`

---

## 🌐 Deploy

### Vercel / Edge Runtime
```bash
bun run build
git push  # Vercel CI/CD automático
```

### Self-Hosted
```bash
bun run build:node
NODE_ENV=production bun start
```

### Docker (Exemplo)
```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY . .
RUN bun install --production
ENV NODE_ENV=production
CMD ["bun", "start"]
```

---

## 📈 Roadmap

- [ ] Integração com banco de dados Prisma Postgres
- [ ] Relatórios avançados com gráficos interativos
- [ ] Mobile app nativa (React Native)
- [ ] Integração PayPal e PIX direto
- [ ] Webhooks para SMS/email automático
- [ ] Analytics e KPIs customizáveis
- [ ] White-label para dioceses

---

## 🤝 Contribuindo

Este é um projeto privado. Para contribuir, abra uma issue ou pull request no repositório.

---

## 📄 Licença

Proprietary © 2024 financialChurch. Todos os direitos reservados.

---

## 👥 Suporte

**Email:** contato@financialchurch.com  
**Docs:** [Leia a documentação técnica](./docs/README.md)  
**GitHub:** [messias1976/financeiro-igreja](https://github.com/messias1976/financeiro-igreja)

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from '@tanstack/react-router'
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/people',
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json() as Promise<{
      results: {
        name: string
      }[]
    }>
  },
  component: () => {
    const data = peopleRoute.useLoaderData()
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    )
  },
})
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
bun install @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ...

const queryClient = new QueryClient()

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
})
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from '@tanstack/react-query'

import './App.css'

function App() {
  const { data } = useQuery({
    queryKey: ['people'],
    queryFn: () =>
      fetch('https://swapi.dev/api/people')
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  })

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
bun install @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

function App() {
  const count = useStore(countStore)
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  )
}

export default App
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from '@tanstack/react-store'
import { Store, Derived } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
})
doubledStore.mount()

function App() {
  const count = useStore(countStore)
  const doubledCount = useStore(doubledStore)

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  )
}

export default App
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
## Classic Snake demo

Start the dev server with `bun run dev`, open `http://localhost:3000`, and scroll to the �Classic Snake� tile on the landing page. The game runs inside the hero area and uses the existing dark styling; use the arrow keys, WASD, or the on-screen pad to steer and gather food.

### Manual verification checklist

- Controls respond to keyboard or on-screen input without adding new animation systems.
- The restart control resets the grid, score, and snake immediately.
- Hitting the wall or the snake�s own body ends the run and halts scoring.
