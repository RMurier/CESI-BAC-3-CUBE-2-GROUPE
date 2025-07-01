# Ressources Relationnelles

## 🏗️ Architecture du projet

- **API** : express + Prisma
- **Mobile** : React Native (Expo)
- **Admin** : React
- **Authentification** : Clerk + surcouche BDD
- **BDD** : PostgreSQL (docker)

## ⚙️ Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/RMurier/CESI-BAC-3-CUBE-2-GROUPE.git
cd CESI-BAC-3-CUBE-2-GROUPE
```

### 2. Installation des dépendances

Dans chaque projet (api/front/mobile), installez les dépendances.

```bash
npm install
```

### 3. Fichiers `.env`

#### 📁 `api/.env`

```env
DATABASE_URL="postgresql://xxxx:xxxx@localhost:21500/ressources?schema=public"
JWT_SECRET="MYSECRET"

CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxx
```

#### 📁 `front/.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
VITE_BASE_URL=http://localhost:3000
```

#### 📁 `mobile/.env`

```env

EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
EXPO_PUBLIC_API_BASE_URL=http://xxxx.xxxx.xxxx.xxxx:3000
```

_Remplace `192.168.x.x` par l’adresse IP locale de ta machine._

## 🚀 Lancement

### API

```bash
cd api
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Admin

```bash
cd admin
npm run dev
```

Accessible sur `http://localhost:5173`

### Mobile

```bash
cd mobile
npx expo start --tunnel
```

Scanner le QR code avec l'app **Expo Go**.

## 🧪 Tests

### Tests API

```bash
cd api
npm test
```

## 🧑‍🎓 Projet personnel – CDA CESI 2025

Ce projet a été réalisé dans le cadre du bloc 2 « Développer et tester les applications informatiques » pour le titre **Concepteur Développeur d’Applications** (CDA).