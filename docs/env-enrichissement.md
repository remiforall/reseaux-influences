# Variables d'environnement — module d'enrichissement OSINT

À copier dans `backend/.env.example` (et adapter dans `backend/.env`) lors du déploiement du module.

Le hook `protect-sensitive.sh` bloque l'édition automatique de `.env*` — c'est volontaire. Recopier manuellement le bloc ci-dessous.

```dotenv
# === Enrichissement OSINT (module d'enrichissement) ===
# Liste CSV des connecteurs actifs (chargés dynamiquement par registry.js)
ENRICHISSEMENT_CONNECTEURS_ACTIFS="wikidata,rdap,ign-ban,ign-dvf,ign-carto-cadastre,ign-carto-gpu,ign-geoplateforme"

# User-Agent envoyé aux APIs publiques (politesse + traçabilité)
ENRICHISSEMENT_USER_AGENT="reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)"

# Cache fichier disque
CACHE_TTL_MS="86400000"
CACHE_DIR="./.cache/connecteurs"

# Pappers — laisser vide pour désactiver le connecteur (skip propre dans registry)
PAPPERS_API_KEY=""
PAPPERS_RATE_LIMIT_DEBIT="5"
PAPPERS_RATE_LIMIT_CAPACITE="5"

# Wikidata SPARQL (open data, User-Agent obligatoire)
WIKIDATA_RATE_LIMIT_DEBIT="2"
WIKIDATA_RATE_LIMIT_CAPACITE="5"

# RDAP + DNS (open data)
RDAP_RATE_LIMIT_DEBIT="2"
RDAP_RATE_LIMIT_CAPACITE="3"

# IGN — toutes en open data, pas de clé API requise
IGN_BAN_RATE_LIMIT_DEBIT="10"
IGN_BAN_RATE_LIMIT_CAPACITE="20"
IGN_DVF_RATE_LIMIT_DEBIT="5"
IGN_DVF_RATE_LIMIT_CAPACITE="10"
IGN_CARTO_RATE_LIMIT_DEBIT="5"
IGN_CARTO_RATE_LIMIT_CAPACITE="10"
```

## Aussi à corriger dans `.env.example`

L'ADR-001 a tranché `reseauxinfluences.fr` comme domaine canonique. Aligner la ligne `CORS_ORIGIN` :

```diff
- CORS_ORIGIN="https://influence-network.net"
+ CORS_ORIGIN="https://reseauxinfluences.fr,https://www.reseauxinfluences.fr"
```
