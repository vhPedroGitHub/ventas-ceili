package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware verifica el token JWT en las peticiones
func AuthMiddleware(authService *AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de autorización requerido"})
			c.Abort()
			return
		}

		// Remover "Bearer " del token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
			c.Abort()
			return
		}

		// Validar token
		claims, err := authService.ValidateJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
			return
		}

		// Agregar claims al contexto
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)

		c.Next()
	}
}

// AdminMiddleware verifica que el usuario sea administrador
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Acceso denegado"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// OptionalAuthMiddleware permite acceso con o sin token
func OptionalAuthMiddleware(authService *AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString != authHeader {
				claims, err := authService.ValidateJWT(tokenString)
				if err == nil {
					c.Set("user_id", claims.UserID)
					c.Set("user_email", claims.Email)
					c.Set("user_role", claims.Role)
				}
			}
		}
		c.Next()
	}
}

// GetUserIDFromContext obtiene el ID del usuario del contexto
func GetUserIDFromContext(c *gin.Context) (string, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return "", false
	}
	return userID.(string), true
}

// GetUserRoleFromContext obtiene el rol del usuario del contexto
func GetUserRoleFromContext(c *gin.Context) (string, bool) {
	role, exists := c.Get("user_role")
	if !exists {
		return "", false
	}
	return role.(string), true
}
