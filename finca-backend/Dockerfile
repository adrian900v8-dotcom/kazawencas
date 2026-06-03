FROM maven:3.9-eclipse-temurin-17
WORKDIR /app
COPY . .
RUN mvn clean compile
EXPOSE 7070
CMD ["mvn", "exec:java", "-Dexec.mainClass=com.finca.App"]