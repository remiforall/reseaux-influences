#!/usr/bin/env bash
# Démarrage one-shot du dev local — reseaux-influences (alpha fermée, ADR-010).
#
# Pré-requis :
#   - Docker Desktop installé et lancé (vérification ci-dessous)
#   - backend/.env présent (copier docs/env-dev-local.txt si absent)
#
# Ce que le script fait :
#   1. Vérifie Docker
#   2. Démarre MariaDB via docker compose
#   3. Attend que la BDD soit healthy
#   4. Synchronise le schema Prisma + génère le client + seed + seed:demo
#   5. Affiche les instructions pour lancer backend + frontend
#
# Usage :
#   chmod +x bin/dev-start.sh   # une fois
#   ./bin/dev-start.sh

set -euo pipefail

cd "$(dirname "$0")/.."

ROUGE='\033[0;31m'
VERT='\033[0;32m'
JAUNE='\033[0;33m'
GRIS='\033[0;90m'
RAZ='\033[0m'

log_info()    { echo -e "${GRIS}→${RAZ} $1"; }
log_succes()  { echo -e "${VERT}✓${RAZ} $1"; }
log_erreur()  { echo -e "${ROUGE}✗${RAZ} $1" >&2; }
log_attente() { echo -e "${JAUNE}⏳${RAZ} $1"; }

# -----------------------------------------------------------------------------
# 1. Vérifications
# -----------------------------------------------------------------------------

if ! command -v docker >/dev/null 2>&1; then
  log_erreur "Docker introuvable. Installer Docker Desktop : https://www.docker.com/products/docker-desktop/"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  log_erreur "Docker n'est pas lancé. Ouvre Docker Desktop puis relance ce script."
  exit 1
fi
log_succes "Docker disponible et lancé"

if [ ! -f backend/.env ]; then
  log_erreur "backend/.env absent. Lance d'abord :"
  echo "    cp docs/env-dev-local.txt backend/.env"
  exit 1
fi
log_succes "backend/.env présent"

# -----------------------------------------------------------------------------
# 2. Démarrage MariaDB via Docker
# -----------------------------------------------------------------------------

log_info "Démarrage du conteneur MariaDB..."
docker compose up -d db
log_succes "Conteneur démarré"

log_attente "Attente que MariaDB soit healthy (peut prendre 30 s au premier démarrage)..."
TENTATIVES=0
MAX_TENTATIVES=60
while [ "$(docker inspect -f '{{.State.Health.Status}}' reseaux-influences-db 2>/dev/null || echo starting)" != "healthy" ]; do
  TENTATIVES=$((TENTATIVES + 1))
  if [ $TENTATIVES -ge $MAX_TENTATIVES ]; then
    log_erreur "MariaDB n'est pas devenue healthy en 2 min. Vérifier : docker compose logs db"
    exit 1
  fi
  sleep 2
done
log_succes "MariaDB healthy"

# -----------------------------------------------------------------------------
# 3. Prisma : push schema + generate client
# -----------------------------------------------------------------------------

log_info "Synchronisation du schema Prisma..."
cd backend
npx prisma db push --skip-generate
log_succes "Schema synchronisé"

log_info "Génération du client Prisma..."
npx prisma generate
log_succes "Client Prisma généré"

# -----------------------------------------------------------------------------
# 4. Seed des données de référence + démo
# -----------------------------------------------------------------------------

log_info "Seed des types de liens, badges et configuration..."
node prisma/seed.js
log_succes "Seed standard inséré"

log_info "Seed du corpus démo (Bolloré / Macron)..."
node bin/seed-demo.js
log_succes "Corpus démo inséré"

cd ..

# -----------------------------------------------------------------------------
# 5. Instructions finales
# -----------------------------------------------------------------------------

cat <<EOF

┌─ Prêt à coder ─────────────────────────────────────────────────────┐

  Compte démo créé :
    Email       : remi@reseauxinfluences.fr
    Mot de passe : AlphaDev2026!
    Rôle        : ADMIN

  Backend prêt sur :   http://localhost:3001
  Swagger sur     :   http://localhost:3001/docs
  Frontend prêt :     http://localhost:5173

  Lance les deux serveurs dans 2 terminaux séparés :

    Terminal 1 (backend) :
      cd backend && npm run dev

    Terminal 2 (frontend) :
      cd frontend && npm run dev

  Puis ouvre http://localhost:5173

  Pour arrêter MariaDB :  docker compose down
  Pour reset total     :  docker compose down -v && ./bin/dev-start.sh

└────────────────────────────────────────────────────────────────────┘

EOF
