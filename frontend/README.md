frontend-tester# TP3 — Application Mobile de Gestion des Tâches · React Native

**Étudiant :** Aziz Beji  
**Technologie :** React Native (Expo SDK 51, Expo Router, `@react-native-async-storage/async-storage`)  
**Mode de fonctionnement :** 100% Hors-ligne / Stockage Local persistant avec **AsyncStorage**.

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

---

## 🚀 Démarrage Rapide

### 1. Aller dans le dossier frontend
```bash
cd "e:\beji_medaziz_reactnative_tp3_local\frontend"
```

### 2. Lancer l'application dans le navigateur Web
```bash
npx expo start --web
```
> L'application s'ouvrira immédiatement sur **`http://localhost:8081`**.  
> *(Astuce : appuyez sur F12 dans votre navigateur puis activez la vue Mobile pour tester au format smartphone).*

### 3. Lancer sur l'Émulateur Android (Android Studio)
1. Démarrez votre émulateur dans **Android Studio** (*Tools > Device Manager > ▶️ Play*).
2. Dans le terminal Expo, appuyez simplement sur la touche **`a`**.

### 4. Lancer sur votre Smartphone physique (Expo Go)
1. Installez l'application **Expo Go** (Android / iOS).
2. Connectez votre téléphone au même Wi-Fi que le PC.
3. Lancez `npx expo start` et scannez le QR code avec votre téléphone.

# beji_medaziz_reactnative_tp3_local
