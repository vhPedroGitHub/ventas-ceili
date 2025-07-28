# Ventas Ceili - Gestor de Ventas en Redes Sociales

Una aplicación web completa para gestionar y automatizar publicaciones de productos en grupos de Facebook.

## 🚀 Características

- **Gestión de Productos**: Crea y administra tu inventario de productos
- **Publicaciones Inteligentes**: Agrupa productos en publicaciones personalizadas
- **Programación Automática**: Programa publicaciones con frecuencias flexibles
- **Gestión de Grupos**: Administra múltiples grupos de Facebook
- **Autenticación Segura**: Sistema de login con JWT
- **Integración Facebook**: Conecta tu cuenta para publicar automáticamente
- **Interfaz Moderna**: React con Tailwind CSS para una experiencia fluida

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework de JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP
- **Lucide React** - Íconos

### Backend
- **Go** - Lenguaje de programación
- **Gin** - Framework web HTTP
- **MongoDB Driver** - Base de datos NoSQL
- **JWT** - Autenticación
- **Facebook Graph API** - Integración con Facebook

### Infrastructure
- **Docker & Docker Compose** - Containerización
- **Nginx** - Proxy reverso y servidor web
- **MongoDB** - Base de datos NoSQL

## 📦 Instalación y Despliegue

### Prerrequisitos
- Docker y Docker Compose instalados
- Git
- Cuenta de Facebook Developer (para integración)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd ventas-ceili
```

2. **Configurar variables de entorno (opcional)**
```bash
# Editar backend/.env si necesitas personalizar la configuración
cp backend/.env.example backend/.env
```

**Configuración de Facebook (Importante):**
Para habilitar la integración con Facebook, necesitas:
1. Crear una aplicación en [Facebook Developers](https://developers.facebook.com/)
2. Obtener tu App ID y App Secret
3. Configurar las variables de entorno:
```bash
# En backend/.env
FACEBOOK_APP_ID=tu_app_id_aqui
FACEBOOK_APP_SECRET=tu_app_secret_aqui
JWT_SECRET=tu_jwt_secret_muy_seguro
```

3. **Construir y ejecutar con Docker Compose**

Una aplicación web completa para gestionar y automatizar publicaciones de productos en grupos de Facebook.

## 🚀 Características

- **Gestión de Productos**: Crea y administra tu inventario de productos
- **Publicaciones Inteligentes**: Agrupa productos en publicaciones personalizadas
- **Programación Automática**: Programa publicaciones con frecuencias flexibles
- **Gestión de Grupos**: Administra múltiples grupos de Facebook
- **Interfaz Moderna**: React con Tailwind CSS para una experiencia fluida

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework de JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP
- **Lucide React** - Íconos

### Backend
- **Go** - Lenguaje de programación
- **Gin** - Framework web HTTP
- **MongoDB Driver** - Base de datos NoSQL

### Infrastructure
- **Docker & Docker Compose** - Containerización
- **Nginx** - Proxy reverso y servidor web
- **MongoDB** - Base de datos NoSQL

## 📦 Instalación y Despliegue

### Prerrequisitos
- Docker y Docker Compose instalados
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd ventas-ceili
```

2. **Configurar variables de entorno (opcional)**
```bash
# Editar backend/.env si necesitas personalizar la configuración
cp backend/.env.example backend/.env
```

3. **Construir y ejecutar con Docker Compose**
```bash
docker-compose up --build -d
```

4. **Verificar que todo esté funcionando**
- Frontend: http://localhost (puerto 80)
- Backend API: http://localhost/api
- MongoDB: puerto 27017

### Scripts Útiles

```bash
# Detener todos los servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Reconstruir un servicio específico
docker-compose up --build backend

# Limpiar y reiniciar todo
docker-compose down -v
docker-compose up --build -d
```

## 📋 Estructura del Proyecto

```
ventas-ceili/
├── backend/                 # API en Go
│   ├── main.go             # Punto de entrada
│   ├── models.go           # Modelos de datos
│   ├── handlers_*.go       # Manejadores de rutas
│   ├── go.mod              # Dependencias de Go
│   ├── Dockerfile          # Imagen Docker del backend
│   └── .env                # Variables de entorno
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # Servicios de API
│   │   └── App.js          # Componente principal
│   ├── public/             # Archivos estáticos
│   ├── package.json        # Dependencias de Node.js
│   ├── Dockerfile          # Imagen Docker del frontend
│   └── nginx.conf          # Configuración de Nginx
├── nginx/                  # Proxy reverso
│   └── nginx.conf          # Configuración principal
├── mongo-init/             # Scripts de inicialización de MongoDB
│   └── init.js             # Esquemas y datos iniciales
├── docker-compose.yml      # Orquestación de servicios
└── README.md              # Este archivo
```

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/profile` - Obtener perfil del usuario
- `POST /api/refresh-token` - Renovar token JWT

### Facebook Integration
- `POST /api/facebook/connect` - Conectar cuenta de Facebook
- `DELETE /api/facebook/disconnect` - Desconectar Facebook
- `GET /api/facebook/status` - Estado de conexión con Facebook
- `GET /api/facebook/groups` - Obtener grupos de Facebook
- `POST /api/facebook/post` - Publicar en Facebook

### Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Publicaciones
- `GET /api/publicaciones` - Listar publicaciones
- `POST /api/publicaciones` - Crear publicación
- `PUT /api/publicaciones/:id` - Actualizar publicación
- `DELETE /api/publicaciones/:id` - Eliminar publicación

### Grupos
- `GET /api/grupos` - Listar grupos
- `POST /api/grupos` - Crear grupo

### Programaciones
- `GET /api/programaciones` - Listar programaciones
- `POST /api/programaciones` - Crear programación
- `PUT /api/programaciones/:id` - Actualizar programación
- `DELETE /api/programaciones/:id` - Eliminar programación

## 🎯 Uso de la Aplicación

### 1. Configurar Productos
1. Ve a la sección "Productos"
2. Agrega tus productos con nombre, descripción, precio, stock, etc.
3. Organiza por categorías si es necesario

### 2. Crear Publicaciones
1. Ve a la sección "Publicaciones"
2. Crea nuevas publicaciones agrupando productos
3. Especifica título, descripción e imagen

### 3. Configurar Grupos de Facebook
1. Ve a la sección "Grupos"
2. Agrega los grupos donde quieres publicar
3. Incluye nombre, URL y descripción

### 4. Programar Publicaciones
1. Ve a la sección "Programaciones"
2. Selecciona una publicación y los grupos destino
3. Configura frecuencia, horarios y duración
4. Activa la programación

## 🔐 Consideraciones de Seguridad

- Las APIs están protegidas con rate limiting
- Headers de seguridad configurados en Nginx
- Validación de datos en MongoDB
- CORS configurado apropiadamente

## 🚧 Desarrollo Futuro

### Funcionalidades Completadas ✅

- [x] Integración real con Facebook Graph API
- [x] Sistema de autenticación de usuarios (JWT)
- [x] Publicación automática programada
- [x] Gestión de tokens de Facebook
- [x] Dashboard con estadísticas básicas

### Funcionalidades Planificadas

- [ ] Dashboard con estadísticas avanzadas
- [ ] Notificaciones en tiempo real
- [ ] Exportación de reportes
- [ ] Soporte para más redes sociales (Instagram, WhatsApp)
- [ ] Sistema de plantillas de publicaciones
- [ ] Analytics y métricas de engagement
- [ ] Subida de imágenes
- [ ] Programación con imágenes

### Mejoras Técnicas

- [ ] Tests unitarios y de integración
- [ ] CI/CD pipeline
- [ ] Monitoring y logging
- [ ] Backup automático de base de datos
- [ ] SSL/HTTPS en producción

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica que todos los servicios estén corriendo: `docker-compose ps`
3. Reinicia los servicios si es necesario: `docker-compose restart`

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para detalles.

---

**¡Disfruta gestionando tus ventas de manera eficiente! 🎉**
