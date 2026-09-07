# Meu Filho

App React Native (Expo) para acompanhar peso, altura e batimentos cardíacos de um bebê durante a gestação.

## Pré-requisitos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli` (ou use `npx expo`)
- Expo Go instalado no celular (iOS/Android)

## Configuração

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar URL da API**

   Edite o arquivo `.env` na raiz do projeto:
   ```
   EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:4000
   ```

   Para descobrir seu IP local:
   - Windows: `ipconfig` → IPv4 Address
   - Mac/Linux: `ifconfig` ou `ip addr`

   > Use o IP da sua máquina na rede local (ex: `192.168.1.5`), não `localhost`.
   > `localhost` só funciona no emulador Android via `10.0.2.2`.

## Rodando o app

```bash
npm start
```

Isso abre o Expo Dev Tools. Então:

- **Dispositivo físico**: escaneie o QR Code com o app Expo Go
- **Emulador Android**: pressione `a`
- **Simulador iOS (macOS)**: pressione `i`

## Emulador Android — URL da API

No emulador Android, `localhost` não aponta para a sua máquina. Use:

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

## Estrutura do projeto

```
src/
├── context/       # AuthContext — estado global de autenticação
├── screens/       # LoginScreen, SignupScreen, HomeScreen, RecordScreen, HistoryScreen
├── hooks/         # useChild, useMeasurements (React Query)
├── services/      # api.ts — instância Axios com interceptor de refresh token
├── types/         # Tipos TypeScript da API
└── navigation/    # RootNavigator, AuthNavigator, AppNavigator, theme
```

## Fluxo de autenticação

- Tokens JWT salvos no `expo-secure-store`
- Access token: 15 min · Refresh token: 7 dias
- Ao receber 401, o interceptor tenta `/auth/refresh` automaticamente
- Se o refresh falhar, o usuário é deslogado e redirecionado para o login
