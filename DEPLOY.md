# Ventas Ceili - Sistema de Gestión de Ventas en Redes Sociales

Una aplicación web completa para gestionar y automatizar publicaciones de ventas en Facebook, desarrollada con React, Go, MongoDB y Docker.

## 🚀 Características

### Gestión de Productos
- ✅ Crear, editar y eliminar productos
- ✅ Controlar inventario (stock)
- ✅ Categorización de productos
- ✅ Soporte para imágenes

### Publicaciones
- ✅ Crear publicaciones con múltiples productos
- ✅ Estados: borrador, activa, pausada
- ✅ Previsualización de contenido

### Programación Automática
- ✅ Programar publicaciones automáticas
- ✅ Frecuencia configurable (diaria, semanal, mensual)
- ✅ Múltiples horarios por día
- ✅ Selección de grupos de Facebook

### Gestión de Grupos
- ✅ Registrar grupos de Facebook
- ✅ Organizar por audiencia

## 🏗️ Arquitectura

```
├── frontend/          # React + Tailwind CSS
├── backend/           # Go + Gin API REST
├── mongodb/           # Base de datos y scripts
├── nginx/             # Reverse proxy y configuración
└── docker-compose.yml # Orquestación de contenedores
```

## 🛠️ Stack Tecnológico

- **Frontend**: React 18, Tailwind CSS, React Router, Axios
- **Backend**: Go 1.21, Gin Web Framework, MongoDB Driver
- **Base de Datos**: MongoDB 7.0
- **Proxy**: Nginx
- **Containerización**: Docker & Docker Compose

## 📋 Prerrequisitos

### Para AWS EC2:
- Instancia EC2 con Ubuntu 20.04+ (recomendado t3.medium o superior)
- Docker y Docker Compose instalados
- Puertos abiertos: 80 (HTTP), 443 (HTTPS), 22 (SSH)

### Instalar Docker en Ubuntu EC2:
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sesión para aplicar cambios de grupo
exit
```

## 🚀 Despliegue en AWS EC2

### 1. Clonar o transferir el proyecto
```bash
# Opción 1: Si tienes git configurado
git clone <tu-repositorio> ventas-ceili
cd ventas-ceili

# Opción 2: Subir archivos vía SCP
scp -r -i tu-clave.pem ./ventas-ceili ubuntu@tu-ip-ec2:~/
ssh -i tu-clave.pem ubuntu@tu-ip-ec2
cd ventas-ceili
```

### 2. Configurar variables de entorno
```bash
# Crear archivo de configuración
cp backend/.env.example backend/.env

# Editar configuraciones si es necesario
nano backend/.env
```

### 3. Desplegar la aplicación
```bash
# Construir y ejecutar todos los servicios
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar que todos los contenedores estén ejecutándose
docker-compose -f docker-compose.prod.yml ps

# Ver logs en caso de problemas
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Verificar el despliegue
```bash
# Verificar estado de los servicios
docker-compose -f docker-compose.prod.yml ps

# Probar la API
curl http://localhost/health

# Probar acceso completo
curl http://tu-ip-ec2/
```

## 🔧 Configuración de Puertos AWS

En tu grupo de seguridad de AWS EC2, asegúrate de tener estas reglas:

| Tipo | Puerto | Origen | Descripción |
|------|--------|--------|-------------|
| HTTP | 80 | 0.0.0.0/0 | Acceso web público |
| HTTPS | 443 | 0.0.0.0/0 | Acceso web seguro |
| SSH | 22 | Tu IP | Administración |

## 📊 Monitoreo y Logs

```bash
# Ver logs de todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f mongo

# Verificar estado de contenedores
docker ps

# Verificar uso de recursos
docker stats
```

## 🔄 Actualizaciones

```bash
# Detener servicios
docker-compose -f docker-compose.prod.yml down

# Actualizar código (si usas git)
git pull

# Reconstruir y reiniciar
docker-compose -f docker-compose.prod.yml up -d --build

# Limpiar imágenes no utilizadas
docker system prune -f
```

## 📁 Estructura de la Base de Datos

### Colecciones MongoDB:
- **productos**: Inventario de productos
- **publicaciones**: Contenido para publicar
- **grupos**: Grupos de Facebook configurados
- **programaciones**: Configuración de publicaciones automáticas
- **historial_publicaciones**: Registro de publicaciones realizadas

## 🌐 URLs de Acceso

Una vez desplegado, la aplicación estará disponible en:

- **Aplicación web**: `http://tu-ip-ec2/`
- **API REST**: `http://tu-ip-ec2/api/`
- **Health check**: `http://tu-ip-ec2/health`

## 🔒 Consideraciones de Seguridad

### Para producción, considera:
1. **SSL/HTTPS**: Configurar certificados SSL
2. **Firewall**: Restringir acceso a puertos específicos
3. **Backup**: Configurar respaldos automáticos de MongoDB
4. **Autenticación**: Implementar sistema de usuarios
5. **Rate Limiting**: Limitar requests a la API

## 🆘 Solución de Problemas

### Problemas comunes:

**Error de conexión a MongoDB:**
```bash
# Verificar que MongoDB esté ejecutándose
docker-compose -f docker-compose.prod.yml logs mongo

# Reiniciar MongoDB
docker-compose -f docker-compose.prod.yml restart mongo
```

**Error 502 Bad Gateway:**
```bash
# Verificar que el backend esté respondiendo
docker-compose -f docker-compose.prod.yml logs backend

# Reiniciar nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

**Frontend no carga:**
```bash
# Verificar logs del frontend
docker-compose -f docker-compose.prod.yml logs frontend

# Reconstruir frontend
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

## 📞 Soporte

Para problemas técnicos:
1. Revisar logs: `docker-compose logs -f`
2. Verificar estado: `docker-compose ps`
3. Comprobar recursos: `docker stats`
4. Reiniciar servicios: `docker-compose restart`

## 🚀 Próximas Características

- [ ] Integración con Facebook API para publicaciones automáticas
- [ ] Sistema de autenticación de usuarios
- [ ] Dashboard de analytics y métricas
- [ ] Notificaciones por email
- [ ] Backup automático
- [ ] API para móviles

---

Desarrollado con ❤️ para automatizar ventas en redes sociales
