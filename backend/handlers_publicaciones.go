package main

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func getPublicaciones(c *gin.Context) {
	collection := database.Collection("publicaciones")
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.Background())

	var publicaciones []Publicacion
	if err = cursor.All(context.Background(), &publicaciones); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, publicaciones)
}

func createPublicacion(c *gin.Context) {
	var publicacion Publicacion
	if err := c.ShouldBindJSON(&publicacion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	publicacion.ID = primitive.NewObjectID()
	publicacion.CreatedAt = time.Now()
	publicacion.UpdatedAt = time.Now()

	if publicacion.Estado == "" {
		publicacion.Estado = "borrador"
	}

	collection := database.Collection("publicaciones")
	_, err := collection.InsertOne(context.Background(), publicacion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, publicacion)
}

func updatePublicacion(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var publicacion Publicacion
	if err := c.ShouldBindJSON(&publicacion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	publicacion.UpdatedAt = time.Now()

	collection := database.Collection("publicaciones")
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": publicacion}

	result, err := collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Publicación no encontrada"})
		return
	}

	c.JSON(http.StatusOK, publicacion)
}

func deletePublicacion(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	collection := database.Collection("publicaciones")
	result, err := collection.DeleteOne(context.Background(), bson.M{"_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Publicación no encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Publicación eliminada exitosamente"})
}
