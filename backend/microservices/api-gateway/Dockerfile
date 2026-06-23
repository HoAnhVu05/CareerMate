# Build context: backend/microservices/
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Install common module
COPY common/pom.xml common/pom.xml
COPY common/src common/src
RUN cd common && mvn install -DskipTests -q

# Build api-gateway
WORKDIR /build/api-gateway
COPY api-gateway/pom.xml .
COPY api-gateway/src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", \
  "-Xmx192m", "-Xms64m", \
  "-XX:+UseG1GC", \
  "-jar", "app.jar"]
