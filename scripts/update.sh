#!/bin/bash

# Script de actualización para Ventas Ceili
# Actualiza la aplicación con cero downtime

set -e

echo "🔄 Iniciando actualización de Ventas Ceili..."

# Backup antes de actualizar
echo "📦 Creando backup de seguridad..."
./scripts/backup.sh

# Actualizar código (si usas git)
if [ -d ".git" ]; then
    echo "📥 Actualizando código desde repositorio..."
    git pull
fi

# Reconstruir servicios uno por uno para minimizar downtime
echo "🔨 Actualizando servicios..."

# Actualizar backend
echo "🔧 Actualizando backend..."
docker-compose -f docker-compose.prod.yml up -d --build --no-deps backend

# Esperar que el backend esté listo
echo "⏳ Esperando que el backend esté listo..."
sleep 20

# Verificar backend
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Backend actualizado correctamente"
else
    echo "❌ Error en la actualización del backend"
    exit 1
fi

# Actualizar frontend
echo "🎨 Actualizando frontend..."
docker-compose -f docker-compose.prod.yml up -d --build --no-deps frontend

# Esperar que el frontend esté listo
echo "⏳ Esperando que el frontend esté listo..."
sleep 15

# Verificar frontend
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend actualizado correctamente"
else
    echo "❌ Error en la actualización del frontend"
    exit 1
fi

# Actualizar nginx si es necesario
echo "🌐 Actualizando nginx..."
docker-compose -f docker-compose.prod.yml up -d --no-deps nginx

# Limpiar imágenes no utilizadas
echo "🧹 Limpiando imágenes no utilizadas..."
docker image prune -f

# Verificación final
echo "🔍 Verificación final..."
./scripts/monitor.sh

echo ""
echo "🎉 ¡Actualización completada exitosamente!"
echo "La aplicación está funcionando correctamente."
