# PW6-2023-24-RS
### Sommaire
1. [Cadre du projet](#cadre-du-projet)
2. [Objectif](#objectif)
3. [Contributeurs](#contributeurs)
4. [Installation](#installation)
5. [Utilisation](#utilisation)

### Cadre du projet

Projet en binôme pour le cours de Programmation Web 6 en 2023-2024 à l'Université Paris Cité (Campus Grands Moulins).

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
npm install express, ejs, bycrypt, express-session connect-pg-simple pg dotenv
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
