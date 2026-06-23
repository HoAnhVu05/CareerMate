# Multi-stage build – build context: backend/microservices/
# Usage: docker build -f eureka-server/Dockerfile .
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# 1. Copy & install common module (required by other services)
COPY common/pom.xml common/pom.xml
COPY common/src common/src
RUN cd common && mvn install -DskipTests -q

# 2. Copy & build eureka-server
WORKDIR /build/eureka-server
COPY eureka-server/pom.xml .
COPY eureka-server/src ./src
RUN mvn package -DskipTests -q

# ---- Slim runtime image ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/eureka-server/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", \
  "-Xmx192m", "-Xms64m", \
  "-XX:+UseG1GC", \
  "-jar", "app.jar"]
