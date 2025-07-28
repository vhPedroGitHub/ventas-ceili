#!/bin/bash

# Script de monitoreo para Ventas Ceili
# Verifica el estado de todos los servicios

echo "🔍 Verificando estado de Ventas Ceili..."
echo "======================================="

# Verificar contenedores
echo "📦 Estado de contenedores:"
docker-compose -f docker-compose.prod.yml ps
echo ""

# Verificar salud de servicios
echo "🏥 Verificación de salud:"

# MongoDB
if docker-compose -f docker-compose.prod.yml exec -T mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB: OK"
else
    echo "❌ MongoDB: ERROR"
fi

# Backend
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Backend API: OK"
else
    echo "❌ Backend API: ERROR"
fi

# Frontend
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: ERROR"
fi

# Nginx
if docker-compose -f docker-compose.prod.yml exec -T nginx nginx -t > /dev/null 2>&1; then
    echo "✅ Nginx: OK"
else
    echo "❌ Nginx: ERROR"
fi

echo ""

# Uso de recursos
echo "📊 Uso de recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

# Espacio en disco
echo "💽 Espacio en disco:"
df -h | grep -E "/$|/var"
echo ""

# Logs recientes
echo "📝 Errores recientes (últimas 10 líneas):"
docker-compose -f docker-compose.prod.yml logs --tail=10 2>&1 | grep -i error || echo "No se encontraron errores recientes"
