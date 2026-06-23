# Build context: backend/microservices/
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Install common module
COPY common/pom.xml common/pom.xml
COPY common/src common/src
RUN cd common && mvn install -DskipTests -q

# Build user-service
WORKDIR /build/user-service
COPY user-service/pom.xml .
COPY user-service/src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Create uploads directory
RUN mkdir -p /app/uploads
COPY --from=builder /build/user-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", \
  "-Xmx256m", "-Xms128m", \
  "-XX:+UseG1GC", \
  "-jar", "app.jar"]
