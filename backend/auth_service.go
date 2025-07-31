package main

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func init() {
	if len(jwtSecret) == 0 {
		jwtSecret = []byte("valor_por_defecto_seguro")
	}
}

// AuthService maneja la autenticación
type AuthService struct {
	userCollection *mongo.Collection
}

func NewAuthService() *AuthService {
	return &AuthService{
		userCollection: database.Collection("usuarios"),
	}
}

// HashPassword encripta una contraseña
func (a *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPassword verifica una contraseña
func (a *AuthService) CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateJWT genera un token JWT
func (a *AuthService) GenerateJWT(userID, email, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 días
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateJWT valida un token JWT
func (a *AuthService) ValidateJWT(tokenString string) (*JWTClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("método de firma inválido")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return &JWTClaims{
			UserID: claims["user_id"].(string),
			Email:  claims["email"].(string),
			Role:   claims["role"].(string),
		}, nil
	}

	return nil, errors.New("token inválido")
}

// CreateUser crea un nuevo usuario
func (a *AuthService) CreateUser(req RegisterRequest) (*Usuario, error) {
	// Verificar si el usuario ya existe
	var existingUser Usuario
	err := a.userCollection.FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		return nil, errors.New("el usuario ya existe")
	}

	// Encriptar contraseña
	hashedPassword, err := a.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Crear usuario
	usuario := Usuario{
		ID:        primitive.NewObjectID(),
		Email:     req.Email,
		Password:  hashedPassword,
		Nombre:    req.Nombre,
		Activo:    true,
		Role:      "user",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = a.userCollection.InsertOne(context.Background(), usuario)
	if err != nil {
		return nil, err
	}

	return &usuario, nil
}

// AuthenticateUser autentica un usuario
func (a *AuthService) AuthenticateUser(req LoginRequest) (*Usuario, string, error) {
	var usuario Usuario
	err := a.userCollection.FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&usuario)
	if err != nil {
		return nil, "", errors.New("credenciales inválidas")
	}

	if !a.CheckPassword(req.Password, usuario.Password) {
		return nil, "", errors.New("credenciales inválidas")
	}

	if !usuario.Activo {
		return nil, "", errors.New("usuario inactivo")
	}

	// Generar JWT
	token, err := a.GenerateJWT(usuario.ID.Hex(), usuario.Email, usuario.Role)
	if err != nil {
		return nil, "", err
	}

	return &usuario, token, nil
}

// GetUserByID obtiene un usuario por ID
func (a *AuthService) GetUserByID(userID string) (*Usuario, error) {
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	var usuario Usuario
	err = a.userCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&usuario)
	if err != nil {
		return nil, err
	}

	return &usuario, nil
}

// UpdateFacebookTokens actualiza los tokens de Facebook del usuario
func (a *AuthService) UpdateFacebookTokens(userID, facebookUserID, accessToken string, expiration time.Time) error {
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	update := bson.M{
		"$set": bson.M{
			"facebook_user_id":      facebookUserID,
			"facebook_access_token": accessToken,
			"token_expiracion":      expiration,
			"updated_at":            time.Now(),
		},
	}

	_, err = a.userCollection.UpdateOne(context.Background(), bson.M{"_id": objectID}, update)
	return err
}
