package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-cors/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client
var database *mongo.Database

func main() {
	// Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("No se encontró archivo .env, usando variables de entorno del sistema")
	}

	// Conectar a MongoDB
	connectMongoDB()

	// Inicializar servicios
	authService := NewAuthService()
	facebookService := NewFacebookService()
	schedulerService := NewSchedulerService(authService, facebookService)

	// Iniciar el scheduler
	schedulerService.Start()
	defer schedulerService.Stop()

	// Configurar Gin
	r := gin.Default()

	// Configurar CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://frontend:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// Rutas públicas
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", RegisterHandler(authService))
		auth.POST("/login", LoginHandler(authService))
		auth.POST("/logout", LogoutHandler())
	}

	// Rutas protegidas
	api := r.Group("/api")
	api.Use(AuthMiddleware(authService))
	{
		// Perfil de usuario
		api.GET("/profile", ProfileHandler(authService))
		api.POST("/refresh-token", RefreshTokenHandler(authService))

		// Facebook
		facebook := api.Group("/facebook")
		{
			facebook.POST("/connect", FacebookConnectHandler(authService, facebookService))
			facebook.DELETE("/disconnect", FacebookDisconnectHandler(authService))
			facebook.GET("/status", FacebookStatusHandler(authService, facebookService))
			facebook.GET("/groups", FacebookGroupsHandler(authService, facebookService))
			facebook.POST("/post", FacebookPostHandler(authService, facebookService))
		}

		// Productos
		api.GET("/productos", getProductos)
		api.POST("/productos", createProducto)
		api.PUT("/productos/:id", updateProducto)
		api.DELETE("/productos/:id", deleteProducto)

		// Publicaciones
		api.GET("/publicaciones", getPublicaciones)
		api.POST("/publicaciones", createPublicacion)
		api.PUT("/publicaciones/:id", updatePublicacion)
		api.DELETE("/publicaciones/:id", deletePublicacion)

		// Grupos de Facebook
		api.GET("/grupos", getGrupos)
		api.POST("/grupos", createGrupo)

		// Programación de publicaciones
		api.GET("/programaciones", getProgramaciones)
		api.POST("/programaciones", createProgramacion)
		api.PUT("/programaciones/:id", updateProgramacion)
		api.DELETE("/programaciones/:id", deleteProgramacion)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor iniciado en puerto %s", port)
	r.Run(":" + port)
}

func connectMongoDB() {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://mongo:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	client, err = mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Error conectando a MongoDB:", err)
	}

	// Verificar conexión
	if err = client.Ping(ctx, nil); err != nil {
		log.Fatal("Error haciendo ping a MongoDB:", err)
	}

	database = client.Database("ventas_ceili")
	log.Println("Conectado exitosamente a MongoDB")
}
