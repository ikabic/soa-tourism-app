module followers-service.xws.com

go 1.26.2

require (
	github.com/golang-jwt/jwt/v5 v5.3.1
	github.com/gorilla/mux v1.8.1
	github.com/joho/godotenv v1.5.1
	github.com/neo4j/neo4j-go-driver/v5 v5.28.4
	google.golang.org/grpc v1.81.0
	proto v0.0.0-00010101000000-000000000000
)

require (
	golang.org/x/net v0.51.0 // indirect
	golang.org/x/sys v0.42.0 // indirect
	golang.org/x/text v0.34.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20260226221140-a57be14db171 // indirect
	google.golang.org/protobuf v1.36.11 // indirect
)

replace proto => ../proto
