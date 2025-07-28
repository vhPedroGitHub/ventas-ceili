package main

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// SchedulerService maneja la programación automática de publicaciones
type SchedulerService struct {
	authService     *AuthService
	facebookService *FacebookService
	running         bool
	stopChan        chan bool
}

func NewSchedulerService(authService *AuthService, facebookService *FacebookService) *SchedulerService {
	return &SchedulerService{
		authService:     authService,
		facebookService: facebookService,
		running:         false,
		stopChan:        make(chan bool),
	}
}

// Start inicia el servicio de programación
func (s *SchedulerService) Start() {
	if s.running {
		return
	}

	s.running = true
	log.Println("Servicio de programación iniciado")

	go s.run()
}

// Stop detiene el servicio de programación
func (s *SchedulerService) Stop() {
	if !s.running {
		return
	}

	s.running = false
	s.stopChan <- true
	log.Println("Servicio de programación detenido")
}

// run ejecuta el loop principal del scheduler
func (s *SchedulerService) run() {
	ticker := time.NewTicker(1 * time.Minute) // Verificar cada minuto
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			s.processPendingPublications()
		case <-s.stopChan:
			return
		}
	}
}

// processPendingPublications procesa las publicaciones pendientes
func (s *SchedulerService) processPendingPublications() {
	// Obtener programaciones activas
	programaciones, err := s.getActiveProgramaciones()
	if err != nil {
		log.Printf("Error obteniendo programaciones: %v", err)
		return
	}

	for _, prog := range programaciones {
		// Verificar si es hora de publicar
		if s.shouldPublishNow(prog) {
			s.executePublication(prog)
		}
	}
}

// getActiveProgramaciones obtiene las programaciones activas
func (s *SchedulerService) getActiveProgramaciones() ([]ProgramacionPublicacion, error) {
	collection := database.Collection("programaciones")

	filter := bson.M{
		"estado":       "activa",
		"fecha_inicio": bson.M{"$lte": time.Now()},
		"$or": []bson.M{
			{"fecha_fin": bson.M{"$gte": time.Now()}},
			{"fecha_fin": nil},
		},
	}

	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var programaciones []ProgramacionPublicacion
	if err := cursor.All(context.Background(), &programaciones); err != nil {
		return nil, err
	}

	return programaciones, nil
}

// shouldPublishNow verifica si una programación debe ejecutarse ahora
func (s *SchedulerService) shouldPublishNow(prog ProgramacionPublicacion) bool {
	now := time.Now()

	// Obtener la última publicación de esta programación
	lastPublication, err := s.getLastPublication(prog.ID)
	if err != nil {
		log.Printf("Error obteniendo última publicación: %v", err)
		return false
	}

	var nextPublicationTime time.Time
	if lastPublication == nil {
		// Primera publicación
		nextPublicationTime = prog.FechaInicio
	} else {
		// Calcular siguiente publicación basada en la frecuencia
		nextPublicationTime = s.calculateNextPublicationTime(lastPublication.FechaPublicacion, prog.Frecuencia)
	}

	// Verificar si es hora de publicar (con margen de 1 minuto)
	return now.After(nextPublicationTime) || now.Sub(nextPublicationTime).Abs() < time.Minute
}

// calculateNextPublicationTime calcula el momento de la siguiente publicación
func (s *SchedulerService) calculateNextPublicationTime(lastTime time.Time, frecuencia string) time.Time {
	switch frecuencia {
	case "diaria":
		return lastTime.Add(24 * time.Hour)
	case "cada_2_dias":
		return lastTime.Add(48 * time.Hour)
	case "semanal":
		return lastTime.Add(7 * 24 * time.Hour)
	case "cada_2_semanas":
		return lastTime.Add(14 * 24 * time.Hour)
	default:
		return lastTime.Add(24 * time.Hour) // Por defecto diaria
	}
}

// getLastPublication obtiene la última publicación de una programación
func (s *SchedulerService) getLastPublication(programacionID primitive.ObjectID) (*HistorialPublicacion, error) {
	collection := database.Collection("historial_publicaciones")

	filter := bson.M{"programacion_id": programacionID}

	var historial HistorialPublicacion
	err := collection.FindOne(context.Background(), filter).Decode(&historial)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return nil, nil // No hay publicaciones previas
		}
		return nil, err
	}

	return &historial, nil
}

// executePublication ejecuta una publicación programada
func (s *SchedulerService) executePublication(prog ProgramacionPublicacion) {
	log.Printf("Ejecutando publicación programada: %s", prog.ID.Hex())

	// Obtener la publicación
	publicacion, err := s.getPublicacion(prog.PublicacionID)
	if err != nil {
		log.Printf("Error obteniendo publicación: %v", err)
		return
	}

	// Obtener los grupos objetivo
	grupos, err := s.getGruposObjetivo(prog.GruposObjetivo)
	if err != nil {
		log.Printf("Error obteniendo grupos: %v", err)
		return
	}

	// Obtener el usuario propietario de la programación
	usuario, err := s.authService.GetUserByID(prog.UserID.Hex())
	if err != nil {
		log.Printf("Error obteniendo usuario: %v", err)
		return
	}

	// Verificar que el usuario tenga token de Facebook válido
	if usuario.FacebookAccessToken == "" || time.Now().After(usuario.TokenExpiracion) {
		log.Printf("Token de Facebook inválido para usuario %s", usuario.ID.Hex())
		return
	}

	// Publicar en cada grupo
	for _, grupo := range grupos {
		s.publishToGroup(prog, *publicacion, grupo, usuario.FacebookAccessToken)
	}
}

// publishToGroup publica en un grupo específico
func (s *SchedulerService) publishToGroup(prog ProgramacionPublicacion, publicacion Publicacion, grupo GrupoFacebook, accessToken string) {
	// Crear el mensaje de publicación
	postReq := FacebookPostRequest{
		Message: s.buildMessage(publicacion),
		Link:    publicacion.ImagenURL,
	}

	// Publicar en Facebook
	response, err := s.facebookService.PostToGroup(accessToken, grupo.FacebookID, postReq)

	// Registrar en el historial
	historial := HistorialPublicacion{
		ID:               primitive.NewObjectID(),
		ProgramacionID:   prog.ID,
		PublicacionID:    publicacion.ID,
		GrupoID:          grupo.ID,
		FechaPublicacion: time.Now(),
		CreatedAt:        time.Now(),
	}

	if err != nil {
		historial.Estado = "fallida"
		historial.MensajeError = err.Error()
		log.Printf("Error publicando en grupo %s: %v", grupo.Nombre, err)
	} else {
		historial.Estado = "exitosa"
		historial.FacebookPostID = response.ID
		log.Printf("Publicación exitosa en grupo %s: %s", grupo.Nombre, response.ID)
	}

	// Guardar historial
	collection := database.Collection("historial_publicaciones")
	_, err = collection.InsertOne(context.Background(), historial)
	if err != nil {
		log.Printf("Error guardando historial: %v", err)
	}
}

// buildMessage construye el mensaje de publicación
func (s *SchedulerService) buildMessage(publicacion Publicacion) string {
	message := publicacion.Titulo + "\n\n" + publicacion.Descripcion

	// Aquí podrías agregar lógica para incluir información de productos
	// por ejemplo, precios, stock, etc.

	return message
}

// getPublicacion obtiene una publicación por ID
func (s *SchedulerService) getPublicacion(id primitive.ObjectID) (*Publicacion, error) {
	collection := database.Collection("publicaciones")

	var publicacion Publicacion
	err := collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&publicacion)
	if err != nil {
		return nil, err
	}

	return &publicacion, nil
}

// getGruposObjetivo obtiene los grupos objetivo por sus IDs
func (s *SchedulerService) getGruposObjetivo(ids []primitive.ObjectID) ([]GrupoFacebook, error) {
	collection := database.Collection("grupos")

	filter := bson.M{"_id": bson.M{"$in": ids}}
	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var grupos []GrupoFacebook
	if err := cursor.All(context.Background(), &grupos); err != nil {
		return nil, err
	}

	return grupos, nil
}
