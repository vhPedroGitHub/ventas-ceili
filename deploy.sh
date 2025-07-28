#!/bin/bash

# Script de despliegue para Ventas Ceili
# Este script facilita el manejo del proyecto dockerizado

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para mostrar ayuda
show_help() {
    echo "🚀 Ventas Ceili - Script de Despliegue"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start      Iniciar todos los servicios"
    echo "  stop       Detener todos los servicios"
    echo "  restart    Reiniciar todos los servicios"
    echo "  build      Construir todas las imágenes"
    echo "  rebuild    Reconstruir y reiniciar"
    echo "  logs       Mostrar logs de todos los servicios"
    echo "  status     Mostrar estado de los servicios"
    echo "  clean      Limpiar contenedores y volúmenes"
    echo "  backup     Hacer backup de la base de datos"
    echo "  restore    Restaurar backup de la base de datos"
    echo "  dev        Iniciar en modo desarrollo"
    echo "  help       Mostrar esta ayuda"
    echo ""
}

# Función para verificar prerequisites
check_prerequisites() {
    print_status "Verificando prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado"
        exit 1
    fi
    
    print_success "Prerequisites verificados"
}

# Función para iniciar servicios
start_services() {
    print_status "Iniciando servicios..."
    docker-compose up -d
    print_success "Servicios iniciados"
    
    print_status "Esperando que los servicios estén listos..."
    sleep 10
    
    show_status
}

# Función para detener servicios
stop_services() {
    print_status "Deteniendo servicios..."
    docker-compose down
    print_success "Servicios detenidos"
}

# Función para reiniciar servicios
restart_services() {
    print_status "Reiniciando servicios..."
    docker-compose restart
    print_success "Servicios reiniciados"
}

# Función para construir imágenes
build_images() {
    print_status "Construyendo imágenes..."
    docker-compose build --no-cache
    print_success "Imágenes construidas"
}

# Función para reconstruir y reiniciar
rebuild_all() {
    print_status "Reconstruyendo todo..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Reconstrucción completada"
    
    sleep 10
    show_status
}

# Función para mostrar logs
show_logs() {
    print_status "Mostrando logs..."
    docker-compose logs -f
}

# Función para mostrar estado
show_status() {
    print_status "Estado de los servicios:"
    docker-compose ps
    
    echo ""
    print_status "URLs disponibles:"
    echo "🌐 Frontend: http://localhost"
    echo "🔧 API: http://localhost/api"
    echo "🏥 Health Check: http://localhost/health"
    echo "🗄️  MongoDB: localhost:27017"
    
    echo ""
    print_status "Verificando conectividad..."
    
    # Verificar frontend
    if curl -s http://localhost > /dev/null; then
        print_success "Frontend funcionando"
    else
        print_warning "Frontend no responde"
    fi
    
    # Verificar API
    if curl -s http://localhost/health > /dev/null; then
        print_success "API funcionando"
    else
        print_warning "API no responde"
    fi
}

# Función para limpiar
clean_all() {
    print_warning "¿Estás seguro de que quieres limpiar todos los contenedores y volúmenes? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY]|[sS])$ ]]; then
        print_status "Limpiando contenedores y volúmenes..."
        docker-compose down -v
        docker system prune -f
        print_success "Limpieza completada"
    else
        print_status "Operación cancelada"
    fi
}

# Función para backup
backup_database() {
    print_status "Creando backup de la base de datos..."
    
    BACKUP_DIR="./backups"
    mkdir -p $BACKUP_DIR
    
    BACKUP_FILE="$BACKUP_DIR/ventas-ceili-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    docker-compose exec -T mongo mongodump --db ventas_ceili --archive | gzip > $BACKUP_FILE
    
    print_success "Backup creado en: $BACKUP_FILE"
}

# Función para restaurar backup
restore_database() {
    if [ -z "$1" ]; then
        print_error "Especifica el archivo de backup"
        echo "Uso: $0 restore <archivo-backup>"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Archivo de backup no encontrado: $1"
        exit 1
    fi
    
    print_warning "¿Estás seguro de que quieres restaurar la base de datos? Esto sobrescribirá los datos actuales. (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY]|[sS])$ ]]; then
        print_status "Restaurando backup..."
        gunzip -c "$1" | docker-compose exec -T mongo mongorestore --db ventas_ceili --archive --drop
        print_success "Backup restaurado"
    else
        print_status "Operación cancelada"
    fi
}

# Función para modo desarrollo
dev_mode() {
    print_status "Iniciando en modo desarrollo..."
    
    # Crear un docker-compose override para desarrollo
    cat > docker-compose.override.yml << EOF
version: '3.8'
services:
  backend:
    environment:
      - GIN_MODE=debug
    volumes:
      - ./backend:/app
    command: go run .
  
  frontend:
    environment:
      - REACT_APP_API_URL=http://localhost:8080/api
    volumes:
      - ./frontend/src:/app/src
EOF
    
    docker-compose up -d
    print_success "Modo desarrollo iniciado"
    
    print_status "En modo desarrollo:"
    echo "- Backend en modo debug"
    echo "- Hot reload habilitado"
    echo "- Volúmenes montados para desarrollo"
}

# Script principal
main() {
    case "${1:-help}" in
        "start")
            check_prerequisites
            start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "build")
            check_prerequisites
            build_images
            ;;
        "rebuild")
            check_prerequisites
            rebuild_all
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            ;;
        "clean")
            clean_all
            ;;
        "backup")
            backup_database
            ;;
        "restore")
            restore_database "$2"
            ;;
        "dev")
            check_prerequisites
            dev_mode
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Ejecutar función principal
main "$@"
