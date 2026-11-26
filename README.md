# TP3 — Application Mobile de Gestion des Tâches · React Native

**Étudiant :** Aziz Beji  
**Technologie :** React Native (Expo SDK 51, Expo Router, `@react-native-async-storage/async-storage`) + Backend **Laravel 12** (API REST & SQLite)  
**Mode de fonctionnement :** API REST Laravel en ligne avec synchronisation automatique (toutes les 10 s), Pull-to-refresh et cache local hors-ligne (**AsyncStorage**).

---

## 📱 Les 5 Parties du TP Réalisées

### 1. Partie 1 — Composant TaskCard avec Props et Styles
- Composant [`TaskCard.js`](file:///frontend/src/components/TaskCard.js) affichant les informations complètes d'une tâche.
- Bordure latérale gauche dynamique selon la priorité (🔴 Élevée, 🟠 Moyenne, 🟢 Faible).
- Badges stylisés pour la **priorité** (*Faible*, *Moyenne*, *Élevée*) et le **statut** (*À faire*, *Terminée*).
- Date de création avec icône calendrier (`Créée le JJ/MM/AAAA`) et chevron de navigation (`>`).

### 2. Partie 2 — Affichage dynamique et gestion de l'état
- Écran [`tasks.js`](file:///frontend/app/(tabs)/tasks.js) avec titre **Mes tâches** et bouton `(+)`.
- **Cartes de statistiques en haut** : `Total`, `Terminées`, `À faire`.
- **Barre de recherche textuelle** en temps réel avec bouton d'effacement `(X)`.
- **Filtres par pilules** : `Toutes`, `À faire`, `Terminées` avec badge de comptage dynamique.
- Rendu performant avec `FlatList` et rafraîchissement par glissement (*Pull-to-refresh*).
- Barre d'onglets inférieure moderne : **Accueil**, **Tâches**, **Ajouter**, **Profil**.

### 3. Partie 3 — Formulaire et opérations CRUD
- Écrans d'ajout ([`add.js`](file:///frontend/app/(tabs)/add.js)) et de modification ([`edit/[id].js`](file:///frontend/app/edit/[id].js)).
- Validation obligatoire du champ **Titre** avec message d'erreur d'aide.
- Champ **Description** multilignes.
- Sélecteurs tactiles de **Priorité** (*Faible*, *Moyenne*, *Élevée*) et de **Statut** (*À faire*, *Terminée*).
- Bouton **Enregistrer** et bouton **Supprimer** (avec dialogue de confirmation).

### 4. Partie 4 — Navigation entre les 4 écrans
1. **Écran Accueil** ([`index.js`](file:///frontend/app/(tabs)/index.js)) : Titre *MyTasks*, slogan, KPIs statistiques, raccourcis *Mes tâches* et *Ajouter une tâche*, et tâches récentes.
2. **Écran Liste des tâches** ([`tasks.js`](file:///frontend/app/(tabs)/tasks.js)) : Recherche, filtres, FlatList, bouton flottant `(+)`.
3. **Écran Détails d'une tâche** ([`details/[id].js`](file:///frontend/app/details/[id].js)) : Fiche complète de la tâche avec boutons *Modifier* et *Supprimer*.
4. **Écran Formulaire** ([`add.js`](file:///frontend/app/(tabs)/add.js) / [`edit/[id].js`](file:///frontend/app/edit/[id].js)) : Formulaire complet d'ajout et d'édition.
5. **Écran Profil** ([`profile.js`](file:///frontend/app/(tabs)/profile.js)) : Informations étudiantes (Aziz Beji), métriques AsyncStorage, restauration des tâches de démo.

### 5. Partie 5 — Persistance des données avec AsyncStorage
- Service dédié centralisé : [`src/services/storage.js`](file:///frontend/src/services/storage.js).
- Les données restent **100% conservées** après la fermeture et la réouverture de l'application.
- Écran de chargement avec `ActivityIndicator` : **"Chargement de vos tâches..."** à chaque initialisation.
- Gestion d'état réactive instantanée via [`TasksContext.js`](file:///frontend/src/context/TasksContext.js).

### 6. Fonctionnalités Avancées Ajoutées
- **📷 Caméra & Galerie** : Prise de photo directe (`expo-image-picker`) et upload depuis la galerie avec conversion persistance Base64/local.
- **📄 Documents & PDF** : Sélection de fichiers PDF ou autres (`expo-document-picker`) avec visionneuse et bouton d'ouverture directe.
- **🌐 Récupération de fichiers via API REST** ([`apiService.js`](file:///frontend/src/services/apiService.js) & [`ApiFilePicker.js`](file:///frontend/src/components/ApiFilePicker.js)) : téléchargement d'un fichier via URL personnalisée ou galerie distante (ex: Picsum), upload multipart/form-data.
- **⏰ Rappels Date & Heure** ([`notificationService.js`](file:///frontend/src/services/notificationService.js) & [`ReminderPicker.js`](file:///frontend/src/components/ReminderPicker.js)) : planification d'alertes via `expo-notifications` (mobile) et Notification API (web).
- **🗺️ Rappel de Position OpenStreetMap** ([`locationService.js`](file:///frontend/src/services/locationService.js) & [`LocationPicker.js`](file:///frontend/src/components/LocationPicker.js)) : sélection sur carte OpenStreetMap interactive (Leaflet / iframe), géolocalisation GPS (`expo-location`), recherche d'adresse et géocodage inverse gratuit (Nominatim OSM).
- **👥 Observateurs & Commentaires avec Notifications** ([`ObserversPanel.js`](file:///frontend/src/components/ObserversPanel.js)) : attribution d'observateurs par nom/email, fil de discussion par tâche, et notification instantanée envoyée aux observateurs à chaque nouveau commentaire.
- **🏷️ Badges sur TaskCard** ([`TaskCard.js`](file:///frontend/src/components/TaskCard.js)) : indicateurs visuels immédiats sur la liste des tâches (📎 fichiers, ⏰ rappel, 📍 position, 👥 observateurs, 💬 commentaires).

### 7. Backend API Laravel & Synchronisation Multi-Appareils
- **Backend Laravel (`backend/`)** : API REST complète (`GET/POST /api/tasks`, `PATCH/DELETE /api/tasks/{id}`, `POST /api/tasks/reset-demo`, `POST /api/upload`, `GET /api/files/{filename}`, `GET /api/health`) avec base SQLite pré-remplie et CORS activé.
- **Synchronisation automatique (10s)** dans [`TasksContext.js`](file:///frontend/src/context/TasksContext.js) + file d'attente hors-ligne dans [`storage.js`](file:///frontend/src/services/storage.js).
- **Configuration dynamique de l'URL serveur** dans l'onglet **Profil** ([`profile.js`](file:///frontend/app/(tabs)/profile.js)) pour pointer vers votre serveur local (`http://<IP-PC>:8000/api`) ou en ligne (`https://...`).

---

## 🚀 Démarrage Rapide

### 1. Lancer le backend Laravel (API en ligne / réseau local)
```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```
> L'API est accessible sur `http://localhost:8000/api` (ou `http://<IP-DE-VOTRE-PC>:8000/api` depuis un autre téléphone/appareil sur le même Wi-Fi).

### 2. Lancer l'application frontend
```bash
cd frontend
npm install
npm start
```
> - `npm start` détecte automatiquement l'IP Wi-Fi du PC (évite `127.0.0.1` en présence de WSL/Hyper-V/VMware) et affiche le QR code pour **Expo Go** ainsi que **`http://localhost:8081`** sur Web.
> - Si le pare-feu Windows bloque la connexion sur le Wi-Fi, utilisez `npm run start:tunnel`.
