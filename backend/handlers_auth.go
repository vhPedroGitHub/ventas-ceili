package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RegisterHandler maneja el registro de usuarios
func RegisterHandler(authService *AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RegisterRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
			return
		}

		// Validaciones básicas
		if req.Email == "" || req.Password == "" || req.Nombre == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email, contraseña y nombre son requeridos"})
			return
		}

		if len(req.Password) < 6 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "La contraseña debe tener al menos 6 caracteres"})
			return
		}

		// Crear usuario
		usuario, err := authService.CreateUser(req)
		if err != nil {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}

		// Generar token
		token, err := authService.GenerateJWT(usuario.ID.Hex(), usuario.Email, usuario.Role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al generar token"})
			return
		}

		// Respuesta sin la contraseña
		response := gin.H{
			"token": token,
			"user": gin.H{
				"id":     usuario.ID.Hex(),
				"email":  usuario.Email,
				"nombre": usuario.Nombre,
				"role":   usuario.Role,
			},
		}

		c.JSON(http.StatusCreated, response)
	}
}

// LoginHandler maneja el login de usuarios
func LoginHandler(authService *AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
			return
		}

		// Autenticar usuario
		usuario, token, err := authService.AuthenticateUser(req)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// Respuesta sin la contraseña
		response := gin.H{
			"token": token,
			"user": gin.H{
				"id":     usuario.ID.Hex(),
				"email":  usuario.Email,
				"nombre": usuario.Nombre,
				"role":   usuario.Role,
			},
		}

		c.JSON(http.StatusOK, response)
	}
}

// ProfileHandler obtiene el perfil del usuario actual
func ProfileHandler(authService *AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := GetUserIDFromContext(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
			return
		}

		usuario, err := authService.GetUserByID(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
			return
		}

		// Respuesta sin la contraseña
		response := gin.H{
			"id":                 usuario.ID.Hex(),
			"email":              usuario.Email,
			"nombre":             usuario.Nombre,
			"role":               usuario.Role,
			"activo":             usuario.Activo,
			"facebook_user_id":   usuario.FacebookUserID,
			"facebook_conectado": usuario.FacebookAccessToken != "",
			"created_at":         usuario.CreatedAt,
		}

		c.JSON(http.StatusOK, response)
	}
}

// RefreshTokenHandler renueva el token JWT
func RefreshTokenHandler(authService *AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := GetUserIDFromContext(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
			return
		}

		usuario, err := authService.GetUserByID(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
			return
		}

		// Generar nuevo token
		token, err := authService.GenerateJWT(usuario.ID.Hex(), usuario.Email, usuario.Role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al generar token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"token": token})
	}
}

// LogoutHandler maneja el logout (por ahora solo responde OK ya que JWT es stateless)
func LogoutHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Logout exitoso"})
	}
}
