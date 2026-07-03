# AV Ranking

App de classement pour matchs d'aqua-volley (2v2 / 3v3, victoire à 20 pts avec 2 pts d'écart).

## Stack

- React 19 + Vite
- Tailwind CSS 4
- Supabase (Postgres + Auth) — login + données partagées entre appareils

## Fonctionnalités

- **Login** — Supabase Auth
- **Joueurs** — ajout/édition/suppression (Réglages)
- **Nouveau match** — sélection joueurs présents, répartition équipes 2v2/3v3, saisie score
- **Classement** — tri par points (barème configurable), filtre 2v2/3v3/tous, vue par date
- **Profil joueur** — stats globales, série en cours, meilleur/pire adversaire et coéquipier
- **Points** — barème victoire/défaite configurable (Réglages)
