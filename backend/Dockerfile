# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copiar go mod y sum files
COPY go.mod go.sum ./

# Descargar dependencias
RUN go mod download

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copiar el binario desde el build stage
COPY --from=builder /app/main .

# Copiar archivo .env si existe
COPY --from=builder /app/.env* ./

EXPOSE 8080

CMD ["./main"]
