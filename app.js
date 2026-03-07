// Point d'entrée pour Phusion Passenger (Infomaniak mutualisé)
// Passenger détecte automatiquement ce fichier à la racine du projet
//
// Sur Infomaniak :
// 1. Configurer l'application Node.js dans le panneau de contrôle
// 2. Pointer le "Application root" vers ce dossier
// 3. Pointer le "Application startup file" vers app.js
// 4. S'assurer que NODE_ENV=production dans les variables d'environnement

import './backend/src/server.js'
