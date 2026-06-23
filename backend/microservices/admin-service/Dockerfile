# Build context: backend/microservices/
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

COPY common/pom.xml common/pom.xml
COPY common/src common/src
RUN cd common && mvn install -DskipTests -q

WORKDIR /build/admin-service
COPY admin-service/pom.xml .
COPY admin-service/src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/admin-service/target/*.jar app.jar
EXPOSE 8087
ENTRYPOINT ["java", \
  "-Xmx128m", "-Xms64m", \
  "-XX:+UseG1GC", \
  "-jar", "app.jar"]
