# AV Ranking

App de classement pour matchs d'aqua-volley (2v2 / 3v3, victoire à 20 pts avec 2 pts d'écart).

## Stack

- React 19 + Vite
- Tailwind CSS 4
- Supabase (Postgres + Auth) — login + données partagées entre appareils

## Configuration

Crée un `.env.local` (non commité) avec les clés du projet Supabase (Project Settings → API) :

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Schéma de base à exécuter une fois dans le SQL Editor Supabase : `supabase/schema.sql`.

Créer l'utilisateur admin : dashboard Supabase → Authentication → Users → Add user (Auto Confirm User).

## Commandes

```bash
make install   # installe les dépendances
make dev       # lance le serveur dev en arrière-plan (http://localhost:5183)
make stop      # stoppe le serveur dev
make build     # build de production
make preview   # preview du build
```

Sans Makefile, équivalent npm :

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Fonctionnalités

- **Login** — Supabase Auth
- **Joueurs** — ajout/édition/suppression (Réglages)
- **Nouveau match** — sélection joueurs présents, répartition équipes 2v2/3v3, saisie score
- **Classement** — tri par points (barème configurable), filtre 2v2/3v3/tous, vue par date
- **Profil joueur** — stats globales, série en cours, meilleur/pire adversaire et coéquipier
- **Points** — barème victoire/défaite configurable (Réglages)
