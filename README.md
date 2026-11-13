# Tech Challenge — Fase 4

App mobile em React Native do blog de professores e alunos (Tech Challenge da Pós-Tech FIAP).

Consome a API REST da Fase 2: https://github.com/MatheusMatiasUniver/Tech-Challeng-Fase-2

## Como rodar

Pré-requisitos: Node 20+ e o app **Expo Go** no celular (ou um emulador Android/iOS).

```bash
npm install
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL se for usar a API local
npx expo start         # leia o QR code com o Expo Go
```

Se usar a API rodando no seu computador, troque `localhost` pelo IP da máquina na rede (o celular não enxerga o `localhost` do PC).

## Arquitetura

As decisões de stack, navegação e autenticação, com o porquê de cada uma, estão em [docs/arquitetura.md](docs/arquitetura.md).
