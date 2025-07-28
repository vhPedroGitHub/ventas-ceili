package main

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Handlers para Grupos de Facebook
func getGrupos(c *gin.Context) {
	collection := database.Collection("grupos")
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.Background())

	var grupos []GrupoFacebook
	if err = cursor.All(context.Background(), &grupos); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, grupos)
}

func createGrupo(c *gin.Context) {
	var grupo GrupoFacebook
	if err := c.ShouldBindJSON(&grupo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	grupo.ID = primitive.NewObjectID()
	grupo.CreatedAt = time.Now()
	grupo.Activo = true

	collection := database.Collection("grupos")
	_, err := collection.InsertOne(context.Background(), grupo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, grupo)
}

// Handlers para Programaciones
func getProgramaciones(c *gin.Context) {
	collection := database.Collection("programaciones")
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.Background())

	var programaciones []ProgramacionPublicacion
	if err = cursor.All(context.Background(), &programaciones); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, programaciones)
}

func createProgramacion(c *gin.Context) {
	var programacion ProgramacionPublicacion
	if err := c.ShouldBindJSON(&programacion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	programacion.ID = primitive.NewObjectID()
	programacion.CreatedAt = time.Now()
	programacion.UpdatedAt = time.Now()

	if programacion.Estado == "" {
		programacion.Estado = "activa"
	}

	collection := database.Collection("programaciones")
	_, err := collection.InsertOne(context.Background(), programacion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, programacion)
}

func updateProgramacion(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var programacion ProgramacionPublicacion
	if err := c.ShouldBindJSON(&programacion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	programacion.UpdatedAt = time.Now()

	collection := database.Collection("programaciones")
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": programacion}

	result, err := collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Programación no encontrada"})
		return
	}

	c.JSON(http.StatusOK, programacion)
}

func deleteProgramacion(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	collection := database.Collection("programaciones")
	result, err := collection.DeleteOne(context.Background(), bson.M{"_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Programación no encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Programación eliminada exitosamente"})
}
