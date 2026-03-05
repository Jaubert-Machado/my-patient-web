# my-patient-web

Frontend da plataforma de simulação de atendimento médico com agentes de IA.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Estilização:** Tailwind CSS + shadcn/ui
- **Animações:** GSAP
- **Estado servidor:** TanStack Query
- **Fontes:** Geist Sans / Geist Mono

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # inicia build
```

## Estrutura

```
app/
  layout.tsx          # providers globais: ReactQuery, Session, Notes
  page.tsx            # dashboard (/)
  login/page.tsx      # autenticação
  chat/page.tsx       # simulação de consulta
  avaliacao/page.tsx  # avaliação pós-consulta com score
components/
  chat/               # ChatWindow, MessageList, ChatInput, LabSheet, etc.
  ui/                 # componentes shadcn/ui
contexts/
  session-context.tsx # estado da sessão de consulta (mensagens, ficha, isFinished)
  notes-context.tsx   # anotações do médico
hooks/
  use-patient-init.ts # inicializa caso clínico via TanStack Query
```

## Autenticação

- Login faz `POST` direto para `NEXT_PUBLIC_API_URL/auth/login`
- Token retornado no body e salvo via `document.cookie` (`auth_token`)
- Demais chamadas enviam `credentials: 'include'` para o Railway

## Chamadas à API

- Usar sempre `${process.env.NEXT_PUBLIC_API_URL}/...` nas chamadas fetch
- Endpoints de agentes usam SSE — ler chunks com `ReadableStream` e `TextDecoder`
- Formato dos eventos SSE: `data: { type: 'text'|'done'|'error', ... }`

## Variáveis de ambiente

```
NEXT_PUBLIC_API_URL=https://my-patientapi-production.up.railway.app
NEXT_PUBLIC_MOCK_PATIENT=true   # ativa paciente mock para dev sem chamar a API
```
