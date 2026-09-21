 
# Use an official JDK runtime as base
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy the JAR file into the container
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

# Run the JAR
ENTRYPOINT ["java","-jar","/app/app.jar"]
