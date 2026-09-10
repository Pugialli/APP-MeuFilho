# MeuFilho App

App mobile para acompanhamento de **gestação e desenvolvimento do bebê**, compartilhado entre dois responsáveis.

---

## Equipe

| Papel | Nome |
|---|---|
| Desenvolvimento | João Paulo Pugialli da Silva Souza |

---

## Sobre o projeto

Aplicativo React Native para o MeuFilho, permitindo que dois responsáveis (pai, mãe ou qualquer combinação) acompanhem juntos a gestação e o crescimento do bebê.

- **Autenticação** com JWT (access token + refresh token) — renovação automática via interceptor Axios
- **Filhos compartilhados** via código de convite — o segundo responsável entra com o código e passa a ter acesso completo
- **Medições independentes** — peso, altura e BPM são registros separados, cada um com data própria

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo 57 + React Native 0.86 (TypeScript) |
| Navegação | React Navigation 7 (Stack + Bottom Tabs) |
| Estado e cache | TanStack Query v5 |
| Formulários | React Hook Form v7 + Zod v4 |
| HTTP | Axios (interceptor de refresh token automático) |
| Armazenamento seguro | expo-secure-store (native) / localStorage (web) |
| Ícones | lucide-react-native + react-native-svg |
| Seletor de data | @react-native-community/datetimepicker |
| Web | react-native-web + Expo Metro bundler |
| Deploy web | Vercel (SPA, rewrites configurados) |
| Runtime | Node.js 20+ |

---

## Requisitos

- Node.js 20+
- pnpm
- Expo Go instalado no dispositivo físico (iOS ou Android)

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com a seguinte variável:

```env
EXPO_PUBLIC_API_URL=https://meu-filho-api.vercel.app
```

---

## Instalação e uso

```bash
# Instalar dependências
pnpm install
```

```bash
pnpm start
```

Após `pnpm start`, escaneie o QR Code exibido no terminal com o app **Expo Go** no celular. Certifique-se de que o celular e o computador estão na mesma rede Wi-Fi.

---

## Telas

| Tela | Descrição |
|---|---|
| Login | Autenticação com email e senha |
| Cadastro | Criação de conta com nome, email, senha e papel (Pai / Mãe) |
| Bebê (Home) | Lista todos os filhos; edição inline de nome, sexo e data prevista; adicionar novo bebê ou entrar com código |
| Registrar | Formulário de medição — peso (g), altura (cm) e BPM com seletor de data |
| Histórico | Lista de medições agrupadas por data, filtros por tipo e pull-to-refresh |

---

## Estrutura de pastas

```
src/
├── context/       # AuthContext — estado global de autenticação
├── hooks/         # useChild, useMeasurements (wrappers de React Query)
├── navigation/    # RootNavigator, AuthNavigator, AppNavigator, theme
├── screens/       # LoginScreen, SignupScreen, HomeScreen, RecordScreen, HistoryScreen
├── services/      # api.ts — instância Axios com interceptor de refresh token
└── types/         # Tipos TypeScript da API (User, Child, Measurement…)
```

---

## Versionamento

Este projeto segue o padrão **Semantic Versioning (semver)**: `MAJOR.MINOR.PATCH`

- **MAJOR** — mudanças que quebram compatibilidade (breaking changes, grandes migrações)
- **MINOR** — novas funcionalidades sem quebrar o que existe
- **PATCH** — correções de bugs e ajustes menores

---

## Changelog

### v1.3.0 — Correções de UX web e ajustes visuais
> Setembro 2026

**Código de convite em modal**
- Removido do card principal; substituído por botão discreto "Convidar parceiro(a)"
- Modal centralizado com código em destaque e botão de compartilhar

**Largura máxima responsiva**
- Auth screens (Login/Signup): conteúdo limitado a 480px e centralizado
- Telas do app (Bebê, Registrar, Histórico): conteúdo limitado a 560–680px

**Date picker no web**
- Componente `DateField` criado em `src/components/DateField.tsx`
- Web: `<input type="date">` nativo sobreposto ao campo estilizado — abre seletor do browser
- Native: DateTimePicker com display inline (iOS) e dialog (Android) como antes

**Formulário de edição do bebê**
- Chips de sexo agora se expandem corretamente (modo de edição usava `alignItems: center` incorretamente)
- `childCardEdit` corrige o alinhamento para `stretch`

**Safe area no Safari (iOS)**
- `SafeAreaProvider` adicionado em App.tsx — corrige sobreposição da barra do Safari no bottom da tela

---

### v1.2.0 — Múltiplos filhos, edição de perfil e suporte web
> Setembro 2026

**Múltiplos filhos**
- Home exibe todos os filhos cadastrados em cards individuais
- Botão "Adicionar outro bebê" para criar ou entrar com código sem sair da tela
- `useChildren` já retornava lista; agora a UI renderiza todos os itens

**Edição de perfil do bebê**
- Botão de lápis em cada card abre edição inline (nome, sexo, data prevista)
- Novo hook `useUpdateChild` — chama `PATCH /children/:id`
- Cancelar restaura os valores originais sem chamar a API

**Campo de sexo**
- Tipo `Sex` adicionado (`MALE` / `FEMALE` / `UNKNOWN`)
- Componente `SexSelector` — chips Menino / Menina / Não definido
- Exibido como badge no card de visualização quando definido
- Incluído no create e no update

**Suporte web**
- `react-native-web` adicionado; `app.json` configurado com `output: "single-page"`
- Armazenamento multiplataforma: `expo-secure-store` no nativo, `localStorage` na web
- `vercel.json` criado com rewrite SPA para deploy na Vercel

---

### v1.1.0 — Redesign visual + melhorias de UX
> Setembro 2026

**Ícones**
- Todos os emojis substituídos por ícones vetoriais `lucide-react-native` em todas as telas (Baby, Leaf, User, Scale, Ruler, Heart, Calendar, Trash2, ClipboardList, Share2)
- Instaladas dependências `lucide-react-native` e `react-native-svg`

**Assets**
- Novos assets criados e configurados: ícone light, dark e tinted (iOS 18+), splash screen, favicon e ícones Android (foreground, background, monochrome)
- `app.json` atualizado com `ios.icon` como objeto `{ light, dark, tinted }`, splash screen e cor de fundo Android corrigida para `#F7F4EF`
- `app.json` sincronizado com versão `1.1.0`

**Tela Registrar**
- Redesenhada com seletor de tipo (Peso / Altura / BPM) — um campo por vez em vez de três campos sempre visíveis
- Teclado numérico fecha automaticamente via tecla Done (`returnKeyType="done"`)
- Seletor de data em estilo calendário (`display="inline"` iOS, `display="default"` Android) mostrando dia da semana
- Botão "Confirmar data" para fechar o calendário inline no iOS

**Correções**
- `dueDate` agora envia ISO datetime completo — corrige erro de validação `body/dueDate Invalid ISO datetime` da API
- Histórico: cabeçalho de data corrigido para lidar com ISO datetime completo vindo da API (era `Invalid Date`)
- Histórico: nome longo do responsável truncado com `ellipsis` — impedia o valor de aparecer no card
- `DateTimePicker`: `onChange` substituído por `onValueChange` + `onDismiss` (API depreciada)
- Login: adicionados `textContentType` e `autoComplete` para suporte a autofill iOS
- Botões: padding via `paddingVertical`/`paddingHorizontal` em vez de `height` fixo

---

### v1.0.8 — Fix: instalação do @expo/vector-icons
> Setembro 2026

- `@expo/vector-icons` adicionado explicitamente às dependências — necessário para os ícones de olho nos campos de senha

---

### v1.0.7 — Remoção do @expo/ngrok
> Setembro 2026

- `@expo/ngrok` removido das devDependencies — não é mais necessário

---

### v1.0.6 — Fix: remoção de flags de conexão desnecessárias
> Setembro 2026

- Scripts `start`, `android` e `ios` voltaram para `expo start` puro — conexão LAN direta funciona sem flags adicionais
- README simplificado: instrução de uso resume-se a `pnpm start` + QR code

---

### v1.0.5 — Fix: substituição do tunnel @expo/ngrok por ngrok v3 manual
> Setembro 2026

- `@expo/ngrok@4.1.0` descontinuado — usa binário ngrok v2 incompatível com os servidores atuais do ngrok
- Scripts `start`, `android` e `ios` alterados de `--tunnel` para `--lan`
- Workflow de desenvolvimento passa a usar ngrok v3 standalone em terminal separado (`ngrok http 8081`)
- README atualizado com instruções dos dois terminais e entrada manual de URL no Expo Go

---

### v1.0.4 — Remoção do .env.example
> Setembro 2026

- `.env.example` removido — URL de produção é pública e já está documentada no README

---

### v1.0.3 — API deployada na Vercel + olho nos campos de senha
> Setembro 2026

- `EXPO_PUBLIC_API_URL` atualizado para `https://meu-filho-api.vercel.app` — API deixou de ser local
- `.env.example` atualizado com a URL de produção
- Adicionado toggle de visibilidade (ícone olho) nos campos de senha do Login e Cadastro

---

### v1.0.2 — Fix: tunnel para Expo Go
> Setembro 2026

- Adicionado `@expo/ngrok@4.1.0` como devDependency — necessário para o modo tunnel funcionar com pnpm (Expo busca o pacote no `node_modules` local, não no global)
- Scripts `start`, `android` e `ios` atualizados com flag `--tunnel` — contorna o AP Isolation ativo no roteador
- README atualizado com nota explicativa sobre o uso do tunnel

---

### v1.0.1 — Migração para pnpm
> Setembro 2026

- Migração do package manager de npm para **pnpm@10.30.2**
- Adicionado campo `packageManager` no `package.json` (Corepack bloqueia `npm install` acidental)
- Adicionado `pnpm.onlyBuiltDependencies` para aprovar builds nativos sem prompt interativo
- `package-lock.json` removido e substituído por `pnpm-lock.yaml`
- `.gitignore` atualizado com `package-lock.json`
- README atualizado com comandos `pnpm`

---

### v1.0.0 — Estrutura inicial do app
> Setembro 2026

- Setup do projeto com Expo 57, React Native 0.86 e TypeScript
- Autenticação completa: signup, login, logout e refresh token automático via interceptor Axios
- Tokens JWT armazenados com segurança no `expo-secure-store`
- Fluxo de filhos: criar perfil do bebê, gerar código de convite e entrar com código
- Compartilhamento do código de convite via Share API do React Native
- Registro de medições independentes (peso, altura, BPM) com seletor de data
- Validação local com Zod antes de enviar para a API
- Histórico de medições agrupado por data com filtros por tipo (abas)
- Pull-to-refresh e exclusão de medições com confirmação
- Design em tons pastéis verdes (verde sálvia e menta, fundo off-white)
- Navegação com React Navigation 7: Stack para autenticação e Bottom Tabs para o app
- Cache e invalidação automática com TanStack Query v5
