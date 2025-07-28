// Inicialización de la base de datos MongoDB para Ventas Ceili
db = db.getSiblingDB('ventas_ceili');

// Crear colecciones con validación de esquemas
db.createCollection('productos', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "precio", "stock"],
      properties: {
        nombre: {
          bsonType: "string",
          description: "Nombre del producto es requerido"
        },
        descripcion: {
          bsonType: "string"
        },
        precio: {
          bsonType: "double",
          minimum: 0,
          description: "Precio debe ser un número positivo"
        },
        stock: {
          bsonType: "int",
          minimum: 0,
          description: "Stock debe ser un número entero positivo"
        },
        categoria: {
          bsonType: "string"
        },
        imagen_url: {
          bsonType: "string"
        },
        created_at: {
          bsonType: "date"
        },
        updated_at: {
          bsonType: "date"
        }
      }
    }
  }
});

db.createCollection('publicaciones', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["titulo"],
      properties: {
        titulo: {
          bsonType: "string",
          description: "Título de la publicación es requerido"
        },
        descripcion: {
          bsonType: "string"
        },
        productos: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["producto_id", "cantidad"],
            properties: {
              producto_id: {
                bsonType: "objectId"
              },
              cantidad: {
                bsonType: "int",
                minimum: 1
              }
            }
          }
        },
        estado: {
          bsonType: "string",
          enum: ["borrador", "activa", "pausada"]
        },
        created_at: {
          bsonType: "date"
        },
        updated_at: {
          bsonType: "date"
        }
      }
    }
  }
});

db.createCollection('grupos', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre"],
      properties: {
        nombre: {
          bsonType: "string",
          description: "Nombre del grupo es requerido"
        },
        facebook_id: {
          bsonType: "string"
        },
        url: {
          bsonType: "string"
        },
        descripcion: {
          bsonType: "string"
        },
        activo: {
          bsonType: "bool"
        },
        created_at: {
          bsonType: "date"
        }
      }
    }
  }
});

db.createCollection('programaciones', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["publicacion_id", "grupos_id", "tipo_frecuencia", "fecha_inicio"],
      properties: {
        publicacion_id: {
          bsonType: "objectId"
        },
        grupos_id: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          }
        },
        tipo_frecuencia: {
          bsonType: "string",
          enum: ["diaria", "semanal", "mensual", "personalizada"]
        },
        frecuencia_dias: {
          bsonType: "int",
          minimum: 1
        },
        horarios: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["hora", "minuto"],
            properties: {
              hora: {
                bsonType: "int",
                minimum: 0,
                maximum: 23
              },
              minuto: {
                bsonType: "int",
                minimum: 0,
                maximum: 59
              }
            }
          }
        },
        cantidad_publicaciones: {
          bsonType: "int",
          minimum: 1
        },
        fecha_inicio: {
          bsonType: "date"
        },
        fecha_fin: {
          bsonType: "date"
        },
        estado: {
          bsonType: "string",
          enum: ["activa", "pausada", "completada"]
        },
        created_at: {
          bsonType: "date"
        },
        updated_at: {
          bsonType: "date"
        }
      }
    }
  }
});

db.createCollection('historial_publicaciones');

// Crear índices para mejorar el rendimiento
db.productos.createIndex({ "nombre": 1 });
db.productos.createIndex({ "categoria": 1 });
db.productos.createIndex({ "created_at": -1 });

db.publicaciones.createIndex({ "titulo": 1 });
db.publicaciones.createIndex({ "estado": 1 });
db.publicaciones.createIndex({ "created_at": -1 });

db.grupos.createIndex({ "nombre": 1 });
db.grupos.createIndex({ "facebook_id": 1 });
db.grupos.createIndex({ "activo": 1 });

db.programaciones.createIndex({ "publicacion_id": 1 });
db.programaciones.createIndex({ "grupos_id": 1 });
db.programaciones.createIndex({ "estado": 1 });
db.programaciones.createIndex({ "fecha_inicio": 1 });

db.historial_publicaciones.createIndex({ "programacion_id": 1 });
db.historial_publicaciones.createIndex({ "fecha_publicacion": -1 });
db.historial_publicaciones.createIndex({ "estado": 1 });

print("✅ Base de datos ventas_ceili inicializada correctamente");
print("📦 Colecciones creadas: productos, publicaciones, grupos, programaciones, historial_publicaciones");
print("🔍 Índices creados para mejorar el rendimiento");
