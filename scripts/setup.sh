#!/bin/sh
# Configure Git pour utiliser les hooks versionnés dans .githooks/
# À lancer une fois après le clone, si npm install ne s'exécute pas en local (ex. Docker).
git config core.hooksPath .githooks
echo "Git hooks configured: .githooks/pre-commit activé."
