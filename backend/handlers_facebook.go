package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// FacebookConnectHandler conecta la cuenta de Facebook del usuario
func FacebookConnectHandler(authService *AuthService, facebookService *FacebookService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := GetUserIDFromContext(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
			return
		}

		var req struct {
			AccessToken string `json:"access_token" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token de acceso requerido"})
			return
		}

		// Validar token de Facebook
		valid, err := facebookService.ValidateAccessToken(req.AccessToken)
		if err != nil || !valid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token de Facebook inválido"})
			return
		}

		// Obtener información del usuario de Facebook
		userInfo, err := facebookService.GetUserInfo(req.AccessToken)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Error al obtener información de Facebook"})
			return
		}

		// Obtener información del token
		tokenInfo, err := facebookService.GetTokenInfo(req.AccessToken)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Error al validar token"})
			return
		}

		// Calcular fecha de expiración
		expiration := time.Now().Add(time.Duration(tokenInfo.ExpiresIn) * time.Second)

		// Actualizar usuario con información de Facebook
		err = authService.UpdateFacebookTokens(userID, userInfo.ID, req.AccessToken, expiration)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar información de Facebook"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":          "Facebook conectado exitosamente",
			"facebook_user_id": userInfo.ID,
			"facebook_name":    userInfo.Name,
			"token_expires_at": expiration,
		})
	}
}

// FacebookGroupsHandler obtiene los grupos de Facebook del usuario
func FacebookGroupsHandler(authService *AuthService, facebookService *FacebookService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := GetUserIDFromContext(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
			return
		}

		// Obtener usuario con token de Facebook
		usuario, err := authService.GetUserByID(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
			return
		}

		if usuario.FacebookAccessToken == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Facebook no está conectado"})
			return
		}

		// Verificar si el token no ha expirado
		if time.Now().After(usuario.TokenExpiracion) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de Facebook expirado"})
			return
		}

		// Obtener grupos de Facebook
		groups, err := facebookService.GetUserGroups(usuario.FacebookAccessToken)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener grupos de Facebook"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"groups": groups,
		})
	}
}

// FacebookPostHandler publica en Facebook
func FacebookPostHandler(authService *AuthService, facebookService *FacebookService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := GetUserIDFromContext(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
			return
		}

		var req struct {
			GroupID string `json:"group_id" binding:"required"`
			Message string `json:"message" binding:"required"`
			Link    string `json:"link"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
			return
		}

		// Obtener usuario con token de Facebook
		usuario, err := authService.GetUserByID(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
			return
		}

		if usuario.FacebookAccessToken == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Facebook no está conectado"})
			return
		}

		// Verificar si el token no ha expirado
		if time.Now().After(usuario.TokenExpiracion) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de Facebook expirado"})
			return
		}

		// Crear petición de publicación
		postReq := FacebookPostRequest{
			Message: req.Message,
			Link:    req.Link,
		}

		// Publicar en Facebook
		response, err := facebookService.PostToGroup(usuario.FacebookAccessToken, req.GroupID, postReq)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al publicar en Facebook: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Publicación exitosa",
			"post_id": response.ID,
		})
	}
}

// FacebookDisconnectHandler desconecta la cuenta de Facebook
func FacebookDisconnectHandler(authService *AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := GetUserIDFromContext(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
			return
		}

		// Limpiar tokens de Facebook
		err := authService.UpdateFacebookTokens(userID, "", "", time.Time{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al desconectar Facebook"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Facebook desconectado exitosamente",
		})
	}
}

// FacebookStatusHandler verifica el estado de conexión con Facebook
func FacebookStatusHandler(authService *AuthService, facebookService *FacebookService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := GetUserIDFromContext(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
			return
		}

		// Obtener usuario
		usuario, err := authService.GetUserByID(userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
			return
		}

		connected := usuario.FacebookAccessToken != ""
		valid := false

		if connected {
			// Verificar si el token es válido y no ha expirado
			if time.Now().Before(usuario.TokenExpiracion) {
				valid, _ = facebookService.ValidateAccessToken(usuario.FacebookAccessToken)
			}
		}

		response := gin.H{
			"connected":   connected,
			"valid":       valid,
			"facebook_id": usuario.FacebookUserID,
		}

		if connected {
			response["expires_at"] = usuario.TokenExpiracion
		}

		c.JSON(http.StatusOK, response)
	}
}
