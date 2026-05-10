FROM golang:alpine

WORKDIR /app

COPY proto ./proto
COPY followers-service/ ./followers-service/

WORKDIR /app/followers-service

EXPOSE 8082
ENTRYPOINT ["go", "run", "main.go"]