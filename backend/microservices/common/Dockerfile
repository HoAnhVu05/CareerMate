# Multi-stage build for common module
# This Dockerfile installs the common module into the Maven local repository
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy common module
COPY pom.xml .
COPY src ./src

# Install common to local Maven repo
RUN mvn install -DskipTests -q

# Export the installed artifacts (will be used in other service builds)
FROM scratch AS export
COPY --from=builder /root/.m2/repository/vn /root/.m2/repository/vn
