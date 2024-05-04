# PW6-2023-24-RS

### Sommaire

1. [Cadre du projet](#cadre-du-projet)
2. [Objectif](#objectif)
3. [Contributeurs](#contributeurs)
4. [Installation](#installation)
5. [Utilisation](#utilisation)

### Cadre du projet

Projet en binôme pour le cours de Programmation Web du semestre 6 en 2023-2024 à l'Université Paris Cité (Campus Grands Moulins).

### Objectif

[sujet du projet](sujet.pdf)

### Contributeurs

| Nom        | Prénom   | pseudo    |
| ---------- | -------- | --------- |
| RAOUL      | Théo     | @raoul    |
| SELVAKUMAR | MATHUSAN | @selvakum |

### Installation

1. Cloner le dépôt
2. Installer les dépendances

```bash
npm install express, ejs, bcryptjs, express-session connect-pg-simple pg dotenv http-status-codes
```

3. Créez l'utilisateur et la base de données nécessaires pour le projet

```bash
psql -U postgres
```

```sql
CREATE ROLE myuser LOGIN PASSWORD 'mypassword';
CREATE DATABASE loyalty_card_db WITH OWNER = myuser;
```

4. Lancez le script de l'initialisation de la base de données

```bash
node db_setup.js
```

### Utilisation

1. Lancer le serveur

```bash
npm start
```

2. Ouvrir un navigateur et aller à l'adresse [`http://localhost:3000`](http://localhost:3000)

### Administration

Pour accéder à l'interface d'administration, il faut se connecter avec les identifiants suivants :

| email                | mot de passe |
| -------------------- | ------------ |
| `rtheo@mail.com`     | `theo`       |
| `smathusan@mail.com` | `mathusan`   |

Pour ajouter un nouvel administrateur, il faut ajouter un enregistrement dans la table `admin` de la base de données ou utiliser le script `db_setup.js` après avoir modifié le fichier `db_setup.js` en ajoutant un nouvel administrateur dans la liste `admins`.

### Pour voir la base de données postgres

```bash
psql -U myuser -d loyalty_card_db
```

```sql
set search_path to loyalty_card;
\dt -- pour voir les tables
```
