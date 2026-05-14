FROM golang:alpine

WORKDIR /app

COPY proto ./proto
COPY purchase-service/ ./purchase-service/

WORKDIR /app/purchase-service

EXPOSE 8083
ENTRYPOINT ["go", "run", "main.go"]
