package main

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Usuario representa un usuario del sistema
type Usuario struct {
	ID                  primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Email               string             `json:"email" bson:"email"`
	Password            string             `json:"-" bson:"password"` // No se serializa en JSON
	Nombre              string             `json:"nombre" bson:"nombre"`
	FacebookUserID      string             `json:"facebook_user_id" bson:"facebook_user_id"`
	FacebookAccessToken string             `json:"-" bson:"facebook_access_token"` // No se serializa
	TokenExpiracion     time.Time          `json:"token_expiracion" bson:"token_expiracion"`
	Activo              bool               `json:"activo" bson:"activo"`
	Role                string             `json:"role" bson:"role"` // "admin", "user"
	CreatedAt           time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt           time.Time          `json:"updated_at" bson:"updated_at"`
}

// LoginRequest para el login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// RegisterRequest para el registro
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Nombre   string `json:"nombre" binding:"required,min=2"`
}

// FacebookAuthRequest para autenticación con Facebook
type FacebookAuthRequest struct {
	AccessToken string `json:"access_token" binding:"required"`
}

// JWTClaims para el token JWT
type JWTClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}

// FacebookPageInfo información de página de Facebook
type FacebookPageInfo struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	AccessToken string `json:"access_token"`
	Category    string `json:"category"`
}

// FacebookGroupInfo información de grupo de Facebook
type FacebookGroupInfo struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Privacy     string `json:"privacy"`
	MemberCount int    `json:"member_count"`
}

// FacebookPostRequest para crear publicaciones
type FacebookPostRequest struct {
	Message       string     `json:"message"`
	ImageURL      string     `json:"image_url,omitempty"`
	GroupID       string     `json:"group_id"`
	ScheduledTime *time.Time `json:"scheduled_time,omitempty"`
	Link          string     `json:"link,omitempty"`
}

// FacebookPostResponse respuesta de Facebook al crear una publicación
type FacebookPostResponse struct {
	ID string `json:"id"`
}

// FacebookUserInfo información del usuario de Facebook
type FacebookUserInfo struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email,omitempty"`
}

// FacebookTokenInfo información del token de acceso
type FacebookTokenInfo struct {
	AppID     string   `json:"app_id"`
	IsValid   bool     `json:"is_valid"`
	ExpiresIn int      `json:"expires_at"`
	Scopes    []string `json:"scopes"`
}

// Requests de autenticación
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Nombre   string `json:"nombre" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Producto representa un producto individual
type Producto struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Nombre      string             `json:"nombre" bson:"nombre"`
	Descripcion string             `json:"descripcion" bson:"descripcion"`
	Precio      float64            `json:"precio" bson:"precio"`
	ImagenURL   string             `json:"imagen_url" bson:"imagen_url"`
	Stock       int                `json:"stock" bson:"stock"`
	Categoria   string             `json:"categoria" bson:"categoria"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updated_at"`
}

// PublicacionProducto representa un producto dentro de una publicación
type PublicacionProducto struct {
	ProductoID primitive.ObjectID `json:"producto_id" bson:"producto_id"`
	Cantidad   int                `json:"cantidad" bson:"cantidad"`
}

// Publicacion representa una publicación que contiene múltiples productos
type Publicacion struct {
	ID          primitive.ObjectID    `json:"id" bson:"_id,omitempty"`
	Titulo      string                `json:"titulo" bson:"titulo"`
	Descripcion string                `json:"descripcion" bson:"descripcion"`
	Productos   []PublicacionProducto `json:"productos" bson:"productos"`
	ImagenURL   string                `json:"imagen_url" bson:"imagen_url"`
	Estado      string                `json:"estado" bson:"estado"` // "borrador", "activa", "pausada"
	CreatedAt   time.Time             `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time             `json:"updated_at" bson:"updated_at"`
}

// GrupoFacebook representa un grupo de Facebook donde se pueden hacer publicaciones
type GrupoFacebook struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Nombre      string             `json:"nombre" bson:"nombre"`
	FacebookID  string             `json:"facebook_id" bson:"facebook_id"`
	URL         string             `json:"url" bson:"url"`
	Descripcion string             `json:"descripcion" bson:"descripcion"`
	Activo      bool               `json:"activo" bson:"activo"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
}

// TipoFrecuencia define los tipos de frecuencia disponibles
type TipoFrecuencia string

const (
	FrecuenciaDiaria        TipoFrecuencia = "diaria"
	FrecuenciaSemanal       TipoFrecuencia = "semanal"
	FrecuenciaMensual       TipoFrecuencia = "mensual"
	FrecuenciaPersonalizada TipoFrecuencia = "personalizada"
)

// ConfiguracionHorario define los horarios de publicación
type ConfiguracionHorario struct {
	Hora   int `json:"hora" bson:"hora"`     // 0-23
	Minuto int `json:"minuto" bson:"minuto"` // 0-59
}

// ProgramacionPublicacion representa la programación de publicaciones
type ProgramacionPublicacion struct {
	ID                    primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
	UserID                primitive.ObjectID     `json:"user_id" bson:"user_id"`
	PublicacionID         primitive.ObjectID     `json:"publicacion_id" bson:"publicacion_id"`
	GruposObjetivo        []primitive.ObjectID   `json:"grupos_objetivo" bson:"grupos_objetivo"`
	Frecuencia            string                 `json:"frecuencia" bson:"frecuencia"` // "diaria", "cada_2_dias", "semanal", "cada_2_semanas"
	Horarios              []ConfiguracionHorario `json:"horarios" bson:"horarios"`
	CantidadPublicaciones int                    `json:"cantidad_publicaciones" bson:"cantidad_publicaciones"`
	FechaInicio           time.Time              `json:"fecha_inicio" bson:"fecha_inicio"`
	FechaFin              *time.Time             `json:"fecha_fin" bson:"fecha_fin"`
	Estado                string                 `json:"estado" bson:"estado"` // "activa", "pausada", "completada"
	CreatedAt             time.Time              `json:"created_at" bson:"created_at"`
	UpdatedAt             time.Time              `json:"updated_at" bson:"updated_at"`
}

// HistorialPublicacion registra cada publicación realizada
type HistorialPublicacion struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	ProgramacionID   primitive.ObjectID `json:"programacion_id" bson:"programacion_id"`
	PublicacionID    primitive.ObjectID `json:"publicacion_id" bson:"publicacion_id"`
	GrupoID          primitive.ObjectID `json:"grupo_id" bson:"grupo_id"`
	FechaPublicacion time.Time          `json:"fecha_publicacion" bson:"fecha_publicacion"`
	Estado           string             `json:"estado" bson:"estado"` // "exitosa", "fallida", "pendiente"
	FacebookPostID   string             `json:"facebook_post_id" bson:"facebook_post_id"`
	MensajeError     string             `json:"mensaje_error" bson:"mensaje_error"`
	CreatedAt        time.Time          `json:"created_at" bson:"created_at"`
}
