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
# URL base da API (use o IP local da sua máquina para testar no dispositivo físico)
EXPO_PUBLIC_API_URL=http://192.168.X.X:4001
```

> **Por que IP local e não localhost?** O dispositivo físico e o computador estão na mesma rede, mas `localhost` no celular aponta para o próprio celular. Use o IP da sua máquina na rede Wi-Fi (`ipconfig` no Windows, `ifconfig` no Mac/Linux).
>
> **Emulador Android:** use `http://10.0.2.2:4001` — esse é o alias que o emulador usa para acessar a máquina host.

---

## Instalação e uso

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm start

# Rodar direto no Android
pnpm android

# Rodar direto no iOS (requer macOS)
pnpm ios
```

Após `npm start`, escaneie o QR Code exibido no terminal com o app **Expo Go** no celular.

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
