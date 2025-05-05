# Projet CESI-BAC-3-CUBE-2-GROUPE

## 📝 Description
Bienvenue dans le projet CESI-BAC-3-CUBE-2-GROUPE ! Ce projet est développé dans le cadre du Bachelor (BAC+3) au CESI et contient trois sous-projets interconnectés formant une solution complète.

## 🚀 Structure du Projet
Le projet est divisé en trois sous-projets principaux :

### 1. API Backend (ExpressJS/NextJS)
Le backend de notre application qui gère les requêtes API, la logique métier et les interactions avec la base de données.

- Technologies : ExpressJS / NextJS
- Fonctionnalités :
  - Authentification et autorisation
  - Gestion des données 
  - Communication avec la base de données
  - Endpoints REST pour les opérations CRUD

### 2. Application Frontend (React/Vue.js)
L'interface utilisateur de notre application qui permet aux utilisateurs d'interagir avec notre service.

- Technologies : React / Vue.js
- Fonctionnalités :
  - Interface utilisateur réactive et moderne
  - Visualisation de données
  - Formulaires et validation
  - Communication avec l'API backend

### 3. Application Mobile (React Native/Kotlin)
L'application mobile pour accéder à notre service sur les appareils Android et iOS.

- Technologies : React Native / Kotlin
- Fonctionnalités :
  - Interface utilisateur native
  - Fonctionnalités hors ligne
  - Notifications push
  - Accès aux fonctionnalités de l'appareil (caméra, GPS, etc.)

## 🛠️ Technologies 

### Backend
- ExpressJS / NextJS 
- Base de données (MySQL, PostgreSQL, MongoDB)
- Système d'authentification (fait-main ou Clerk)

### Frontend
- React / Vue.js
- State management (Redux, Context API, Pinia)
- Styled-components / Tailwind CSS / SCSS

### Mobile
- React Native / Kotlin
- Navigation (React Navigation, Jetpack Navigation)
- State management (Redux, MobX, ViewModel/LiveData)

## 📋 Prérequis
- Node.js (v16+)
- npm ou yarn
- Base de données configurée (MySQL, PostgreSQL, MongoDB)
- [Android Studio / Xcode] pour le développement mobile
- [Tout autre logiciel ou outil nécessaire]

## 🔧 Installation

### Cloner le projet
```bash
git clone https://github.com/RMurier/CESI-BAC-3-CUBE-2-GROUPE.git
cd CESI-BAC-3-CUBE-2-GROUPE
```

### Installation des dépendances

#### Backend
```bash
cd backend
npm install
# Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

#### Frontend
```bash
cd frontend
npm install
# Configurer les variables d'environnement si nécessaire
cp .env.example .env
```

#### Mobile
```bash
cd mobile
npm install
# Pour React Native
npx pod-install # pour iOS
```

## 🚀 Démarrage

### Backend
```bash
cd backend
npm run dev # pour le développement
# ou
npm start # pour la production
```

### Frontend
```bash
cd frontend
npm run dev # pour le développement
# ou
npm run build && npm start # pour la production
```

### Mobile
```bash
cd mobile
# React Native
npm run android
# ou
npm run ios
```

## 📚 Documentation
- [Documentation Backend](./backend/README.md)
- [Documentation Frontend](./frontend/README.md)
- [Documentation Mobile](./mobile/README.md)

## 🧪 Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# Mobile
cd mobile
npm test
```

## 📝 Contribution
1. Forker le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commiter vos changements (`git commit -m 'Add some amazing feature'`)
4. Pousser votre branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 👥 Équipe
- Fadi BOUCHNAK - Développeur Fullstack
- Romain Murier - Développeur Fullstack

## 📜 Licence
Ce projet est sous licence CESI - voir le fichier [LICENSE.md](LICENSE.md) pour plus de détails.

## 🙏 Remerciements
- CESI pour l'encadrement du projet
- Les intervenants très compétants
