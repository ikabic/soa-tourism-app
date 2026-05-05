FROM golang:alpine AS builder

WORKDIR /app

COPY ../proto ./proto
COPY . .

WORKDIR /app/stakeholders-service

EXPOSE 8080
ENTRYPOINT ["go", "run", "main.go"]