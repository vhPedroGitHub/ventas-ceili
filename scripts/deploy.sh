#!/bin/bash

# Script de despliegue para Ventas Ceili en AWS EC2
# Autor: Sistema Ventas Ceili
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando despliegue de Ventas Ceili..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "Por favor ejecuta:"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado"
    echo "Por favor ejecuta:"
    echo "sudo curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose"
    echo "sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p nginx/ssl
mkdir -p mongodb/data

# Verificar que el archivo de configuración existe
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Creando archivo de configuración por defecto..."
    cp backend/.env backend/.env.backup 2>/dev/null || true
    echo "PORT=8080" > backend/.env
    echo "MONGO_URI=mongodb://admin:ventasceili2025@mongo:27017/ventas_ceili?authSource=admin" >> backend/.env
    echo "GIN_MODE=release" >> backend/.env
fi

# Detener contenedores existentes si los hay
echo "🛑 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Construir y ejecutar los servicios
echo "🔨 Construyendo y ejecutando servicios..."
docker-compose -f docker-compose.prod.yml up -d --build

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar el estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose -f docker-compose.prod.yml ps

# Verificar conectividad
echo "🌐 Verificando conectividad..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Backend está respondiendo correctamente"
else
    echo "⚠️  El backend no está respondiendo, verificando logs..."
    docker-compose -f docker-compose.prod.yml logs backend | tail -20
fi

if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend está respondiendo correctamente"
else
    echo "⚠️  El frontend no está respondiendo, verificando logs..."
    docker-compose -f docker-compose.prod.yml logs frontend | tail -20
fi

# Mostrar información del despliegue
echo ""
echo "🎉 ¡Despliegue completado!"
echo ""
echo "📊 Estado de los servicios:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "🌐 URLs de acceso:"
echo "  - Aplicación web: http://$(curl -s ifconfig.me)/"
echo "  - API REST: http://$(curl -s ifconfig.me)/api/"
echo "  - Health check: http://$(curl -s ifconfig.me)/health"
echo ""
echo "📝 Comandos útiles:"
echo "  - Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Reiniciar: docker-compose -f docker-compose.prod.yml restart"
echo "  - Detener: docker-compose -f docker-compose.prod.yml down"
echo ""
echo "📚 Para más información, consulta DEPLOY.md"
