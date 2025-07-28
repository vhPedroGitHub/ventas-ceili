# Script de despliegue para Ventas Ceili (PowerShell)
# Este script facilita el manejo del proyecto dockerizado en Windows

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$BackupFile = ""
)

# Función para mostrar mensajes con colores
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host "🚀 Ventas Ceili - Script de Despliegue (Windows)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\deploy.ps1 [COMANDO]"
    Write-Host ""
    Write-Host "Comandos disponibles:"
    Write-Host "  start      Iniciar todos los servicios"
    Write-Host "  stop       Detener todos los servicios"
    Write-Host "  restart    Reiniciar todos los servicios"
    Write-Host "  build      Construir todas las imágenes"
    Write-Host "  rebuild    Reconstruir y reiniciar"
    Write-Host "  logs       Mostrar logs de todos los servicios"
    Write-Host "  status     Mostrar estado de los servicios"
    Write-Host "  clean      Limpiar contenedores y volúmenes"
    Write-Host "  backup     Hacer backup de la base de datos"
    Write-Host "  restore    Restaurar backup de la base de datos"
    Write-Host "  dev        Iniciar en modo desarrollo"
    Write-Host "  help       Mostrar esta ayuda"
    Write-Host ""
}

# Función para verificar prerequisites
function Test-Prerequisites {
    Write-Status "Verificando prerequisites..."
    
    try {
        $null = Get-Command docker -ErrorAction Stop
    }
    catch {
        Write-Error "Docker no está instalado o no está en el PATH"
        exit 1
    }
    
    try {
        $null = Get-Command docker-compose -ErrorAction Stop
    }
    catch {
        Write-Error "Docker Compose no está instalado o no está en el PATH"
        exit 1
    }
    
    Write-Success "Prerequisites verificados"
}

# Función para iniciar servicios
function Start-Services {
    Write-Status "Iniciando servicios..."
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Servicios iniciados"
        
        Write-Status "Esperando que los servicios estén listos..."
        Start-Sleep -Seconds 10
        
        Show-Status
    } else {
        Write-Error "Error al iniciar los servicios"
        exit 1
    }
}

# Función para detener servicios
function Stop-Services {
    Write-Status "Deteniendo servicios..."
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Servicios detenidos"
    } else {
        Write-Error "Error al detener los servicios"
    }
}

# Función para reiniciar servicios
function Restart-Services {
    Write-Status "Reiniciando servicios..."
    docker-compose restart
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Servicios reiniciados"
    } else {
        Write-Error "Error al reiniciar los servicios"
    }
}

# Función para construir imágenes
function Build-Images {
    Write-Status "Construyendo imágenes..."
    docker-compose build --no-cache
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Imágenes construidas"
    } else {
        Write-Error "Error al construir las imágenes"
        exit 1
    }
}

# Función para reconstruir y reiniciar
function Rebuild-All {
    Write-Status "Reconstruyendo todo..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Reconstrucción completada"
        Start-Sleep -Seconds 10
        Show-Status
    } else {
        Write-Error "Error durante la reconstrucción"
        exit 1
    }
}

# Función para mostrar logs
function Show-Logs {
    Write-Status "Mostrando logs..."
    docker-compose logs -f
}

# Función para mostrar estado
function Show-Status {
    Write-Status "Estado de los servicios:"
    docker-compose ps
    
    Write-Host ""
    Write-Status "URLs disponibles:"
    Write-Host "🌐 Frontend: http://localhost" -ForegroundColor Cyan
    Write-Host "🔧 API: http://localhost/api" -ForegroundColor Cyan
    Write-Host "🏥 Health Check: http://localhost/health" -ForegroundColor Cyan
    Write-Host "🗄️  MongoDB: localhost:27017" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Status "Verificando conectividad..."
    
    # Verificar frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend funcionando"
        }
    }
    catch {
        Write-Warning "Frontend no responde"
    }
    
    # Verificar API
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/health" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Success "API funcionando"
        }
    }
    catch {
        Write-Warning "API no responde"
    }
}

# Función para limpiar
function Clean-All {
    $response = Read-Host "¿Estás seguro de que quieres limpiar todos los contenedores y volúmenes? (y/N)"
    if ($response -match "^[yYsS]") {
        Write-Status "Limpiando contenedores y volúmenes..."
        docker-compose down -v
        docker system prune -f
        Write-Success "Limpieza completada"
    } else {
        Write-Status "Operación cancelada"
    }
}

# Función para backup
function Backup-Database {
    Write-Status "Creando backup de la base de datos..."
    
    $BackupDir = ".\backups"
    if (!(Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $BackupFile = "$BackupDir\ventas-ceili-backup-$timestamp.tar.gz"
    
    try {
        docker-compose exec -T mongo mongodump --db ventas_ceili --archive | gzip > $BackupFile
        Write-Success "Backup creado en: $BackupFile"
    }
    catch {
        Write-Error "Error al crear el backup: $($_.Exception.Message)"
    }
}

# Función para restaurar backup
function Restore-Database {
    param([string]$BackupFilePath)
    
    if ([string]::IsNullOrEmpty($BackupFilePath)) {
        Write-Error "Especifica el archivo de backup"
        Write-Host "Uso: .\deploy.ps1 restore <archivo-backup>"
        exit 1
    }
    
    if (!(Test-Path $BackupFilePath)) {
        Write-Error "Archivo de backup no encontrado: $BackupFilePath"
        exit 1
    }
    
    $response = Read-Host "¿Estás seguro de que quieres restaurar la base de datos? Esto sobrescribirá los datos actuales. (y/N)"
    if ($response -match "^[yYsS]") {
        Write-Status "Restaurando backup..."
        try {
            Get-Content $BackupFilePath | gunzip | docker-compose exec -T mongo mongorestore --db ventas_ceili --archive --drop
            Write-Success "Backup restaurado"
        }
        catch {
            Write-Error "Error al restaurar el backup: $($_.Exception.Message)"
        }
    } else {
        Write-Status "Operación cancelada"
    }
}

# Función para modo desarrollo
function Start-DevMode {
    Write-Status "Iniciando en modo desarrollo..."
    
    # Crear un docker-compose override para desarrollo
    $overrideContent = @"
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
"@
    
    $overrideContent | Out-File -FilePath "docker-compose.override.yml" -Encoding UTF8
    
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Modo desarrollo iniciado"
        Write-Status "En modo desarrollo:"
        Write-Host "- Backend en modo debug"
        Write-Host "- Hot reload habilitado"
        Write-Host "- Volúmenes montados para desarrollo"
    } else {
        Write-Error "Error al iniciar el modo desarrollo"
    }
}

# Script principal
switch ($Command.ToLower()) {
    "start" {
        Test-Prerequisites
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "build" {
        Test-Prerequisites
        Build-Images
    }
    "rebuild" {
        Test-Prerequisites
        Rebuild-All
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Show-Status
    }
    "clean" {
        Clean-All
    }
    "backup" {
        Backup-Database
    }
    "restore" {
        Restore-Database -BackupFilePath $BackupFile
    }
    "dev" {
        Test-Prerequisites
        Start-DevMode
    }
    default {
        Show-Help
    }
}
