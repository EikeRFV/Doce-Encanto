#!/bin/bash

# Script para executar migrations do banco de dados

echo "🔧 Executando Migrations do Banco de Dados..."
echo ""

# Verificar se o PostgreSQL está rodando
echo "1️⃣ Verificando conexão com PostgreSQL..."
if ! docker ps | grep -q postgres; then
    echo "⚠️  PostgreSQL não está rodando. Iniciando com Docker Compose..."
    docker-compose up -d postgres
    echo "⏳ Aguardando PostgreSQL iniciar (10 segundos)..."
    sleep 10
fi

# Executar migrations
echo ""
echo "2️⃣ Executando migrations..."
npm run typeorm migration:run

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations executadas com sucesso!"
    echo ""
    echo "📊 Para verificar as tabelas criadas, execute:"
    echo "   docker exec -it doce-encanto-postgres psql -U root -d doce_encanto -c '\\dt'"
else
    echo ""
    echo "❌ Erro ao executar migrations!"
    echo "Verifique os logs acima para mais detalhes."
    exit 1
fi
