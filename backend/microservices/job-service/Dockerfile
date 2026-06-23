# Build context: backend/microservices/
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

COPY common/pom.xml common/pom.xml
COPY common/src common/src
RUN cd common && mvn install -DskipTests -q

WORKDIR /build/job-service
COPY job-service/pom.xml .
COPY job-service/src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/job-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", \
  "-Xmx256m", "-Xms128m", \
  "-XX:+UseG1GC", \
  "-jar", "app.jar"]
