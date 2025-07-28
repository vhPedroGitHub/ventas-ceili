// Inicialización de la base de datos MongoDB para Ventas Ceili
print('Iniciando configuración de la base de datos ventas_ceili...');

// Cambiar a la base de datos
db = db.getSiblingDB('ventas_ceili');

// Crear un usuario específico para la aplicación
db.createUser({
  user: 'ventas_user',
  pwd: 'ventas_password_2025',
  roles: [
    {
      role: 'readWrite',
      db: 'ventas_ceili'
    }
  ]
});

// Crear las colecciones con validación
db.createCollection('productos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['nombre', 'precio', 'stock'],
      properties: {
        nombre: {
          bsonType: 'string',
          description: 'El nombre del producto es requerido'
        },
        descripcion: {
          bsonType: 'string'
        },
        precio: {
          bsonType: 'double',
          minimum: 0,
          description: 'El precio debe ser un número positivo'
        },
        stock: {
          bsonType: 'int',
          minimum: 0,
          description: 'El stock debe ser un número entero positivo'
        },
        categoria: {
          bsonType: 'string'
        },
        imagen_url: {
          bsonType: 'string'
        }
      }
    }
  }
});

db.createCollection('publicaciones', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['titulo'],
      properties: {
        titulo: {
          bsonType: 'string',
          description: 'El título de la publicación es requerido'
        },
        descripcion: {
          bsonType: 'string'
        },
        productos: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['producto_id', 'cantidad'],
            properties: {
              producto_id: {
                bsonType: 'objectId'
              },
              cantidad: {
                bsonType: 'int',
                minimum: 1
              }
            }
          }
        },
        estado: {
          bsonType: 'string',
          enum: ['borrador', 'activa', 'pausada']
        }
      }
    }
  }
});

db.createCollection('grupos');
db.createCollection('programaciones');
db.createCollection('historial_publicaciones');

// Crear índices para mejorar el rendimiento
db.productos.createIndex({ "nombre": "text", "descripcion": "text" });
db.productos.createIndex({ "categoria": 1 });
db.productos.createIndex({ "precio": 1 });

db.publicaciones.createIndex({ "titulo": "text", "descripcion": "text" });
db.publicaciones.createIndex({ "estado": 1 });
db.publicaciones.createIndex({ "created_at": -1 });

db.grupos.createIndex({ "nombre": 1 });
db.grupos.createIndex({ "activo": 1 });

db.programaciones.createIndex({ "estado": 1 });
db.programaciones.createIndex({ "fecha_inicio": 1 });
db.programaciones.createIndex({ "publicacion_id": 1 });

db.historial_publicaciones.createIndex({ "fecha_publicacion": -1 });
db.historial_publicaciones.createIndex({ "programacion_id": 1 });

print('Base de datos configurada exitosamente!');
print('Colecciones creadas: productos, publicaciones, grupos, programaciones, historial_publicaciones');
print('Índices creados para optimizar consultas');
print('Usuario ventas_user creado con permisos de lectura/escritura');
