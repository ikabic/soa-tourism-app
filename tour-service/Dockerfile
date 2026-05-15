FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app
COPY proto ./proto
COPY tour-service ./tour-service
WORKDIR /app/tour-service
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN dotnet restore
RUN openssl req -x509 -newkey rsa:2048 -nodes -keyout tourapp.key -out tourapp.crt -days 365 -subj "/CN=tour-app"
RUN openssl pkcs12 -export -out tourapp.pfx -inkey tourapp.key -in tourapp.crt -passout pass:password
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .
COPY --from=build /app/tour-service/tourapp.pfx .
EXPOSE 8080 50051
ENTRYPOINT ["dotnet", "tour-service.dll"]
