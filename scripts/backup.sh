#!/bin/bash

# Script de backup para Ventas Ceili
# Crea un backup completo de la base de datos MongoDB

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ventas_ceili_backup_$DATE.tar.gz"

echo "📦 Iniciando backup de Ventas Ceili..."

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# Hacer backup de MongoDB
echo "💾 Creando backup de MongoDB..."
docker-compose -f docker-compose.prod.yml exec -T mongo mongodump --uri="mongodb://admin:ventasceili2025@localhost:27017/ventas_ceili?authSource=admin" --out=/tmp/backup

# Copiar backup del contenedor
echo "📋 Copiando backup del contenedor..."
docker cp $(docker-compose -f docker-compose.prod.yml ps -q mongo):/tmp/backup ./temp_backup

# Comprimir backup
echo "🗜️  Comprimiendo backup..."
tar -czf "$BACKUP_DIR/$BACKUP_FILE" temp_backup/

# Limpiar archivos temporales
rm -rf temp_backup/
docker-compose -f docker-compose.prod.yml exec -T mongo rm -rf /tmp/backup

echo "✅ Backup completado: $BACKUP_DIR/$BACKUP_FILE"

# Mantener solo los últimos 7 backups
echo "🧹 Limpiando backups antiguos..."
cd $BACKUP_DIR
ls -t ventas_ceili_backup_*.tar.gz | tail -n +8 | xargs -r rm --

echo "🎉 Proceso de backup finalizado exitosamente"
