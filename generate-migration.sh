#!/bin/bash

# Script para gerar migration inicial do banco de dados
# Este script cria uma migration com todas as entidades do projeto

echo "🚀 Gerando migration inicial..."

# Gera a migration
npm run typeorm migration:generate -- src/database/migrations/InitialSchema

echo "✅ Migration gerada com sucesso!"
echo ""
echo "Para executar a migration, use:"
echo "npm run typeorm migration:run"
