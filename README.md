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
| Armazenamento seguro | expo-secure-store |
| Seletor de data | @react-native-community/datetimepicker |
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
| Bebê (Home) | Exibe o perfil do bebê com código de convite; ou opções de criar / entrar com código |
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
