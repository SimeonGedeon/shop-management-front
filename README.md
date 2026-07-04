<<<<<<< HEAD
# shop-management-front
Client Next.js / TypeScript pour la plateforme shop-management. Gestion de points de vente, flux de crédits et soldes Mobile Money (M-Pesa, Orange, Airtel). Intégration API REST, gestion d'état asynchrone avec TanStack Query et interface optimisée en mode sombre.
=======
# DEV – PPUKIN (Front-End)

Interface front-end de l'application **shop-management**, dédiée à la gestion des opérations de point de vente et des services Mobile Money (M-Pesa, Orange Money, Airtel Money). Ce projet consomme l'API REST du backend Laravel pour centraliser le suivi des flux financiers et des stocks de crédits.

## Spécifications UI & Visual Charter

L'interface est structurée selon des exigences techniques strictes pour s'adapter aux conditions d'utilisation en cabine :
* **Mode sombre obligatoire :** Fond principal configuré sur `bg-[#0b0f19]`.
* **Palette de couleurs :** Utilisation exclusive des variantes de bleu `#3b82f6` (vivid) et `#1e3a8a` (dark) pour la structure et les focus.
* **Typographie :** Police *Inter* appliquée globalement pour assurer la lisibilité des données monétaires.
* **Composants d'interface :** Rendu de type application SaaS, aucun émoji brut dans le code UI, utilisation d'icônes SVG vectorielles.

## Fonctionnalités principales

* **Dashboard opérationnel :** Indicateurs financiers du jour, bénéfices réels, statuts de la caisse (matin/soir) et calcul automatique des écarts.
* **Gestion multi-réseaux :** Configuration des grilles tarifaires et des seuils d'alerte critiques pour Vodacom, Orange, Airtel et Africell.
* **Module Mobile Money :** Suivi des soldes des coffres et historique des transactions journalières.
* **Paramètres système :** Ajustement des objectifs hebdomadaires et des prix de vente unitaires.

## Architecture Technique

* **Framework :** Next.js (App Router, strict client/server component separation).
* **State Management & Fetching :** Axios + TanStack Query (gestion du cache, invalidation des requêtes lors des mutations).
* **Typage :** Interfaces TypeScript strictes pour mapper les réponses de l'API Laravel.

## Normes de code appliquées

* **Gestion des médias :** Les images distantes doivent obligatoirement utiliser la directive `url('storage/...')` pour pointer vers le storage lié du backend.
* **Cycles de vie des requêtes :** Appels API sécurisés avec obligation de lever les états de chargement (`setLoading(false)`) dans le bloc `finally` pour éviter les blocages de l'UI.

## Configuration locale

### Dépendances
* Node.js (LTS v20+)
* Backend Laravel opérationnel sur le port 8000

### Installation

1. Cloner le dépôt :
```bash
git clone [https://github.com/votre-compte/shop-management-front.git](https://github.com/votre-compte/shop-management-front.git)
cd shop-management-front
>>>>>>> dev
