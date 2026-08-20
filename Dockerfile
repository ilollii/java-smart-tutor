# Use official Eclipse Temurin JDK 21 (includes javac compiler for java sandbox)
FROM eclipse-temurin:21-jdk-jammy

# Set working directory
WORKDIR /app

# Copy server sources, static assets, and data files
COPY server/ ./server/
COPY public/ ./public/
COPY data/ ./data/

# Compile all Java backend sources into out/ with explicit UTF-8 encoding
RUN mkdir -p out && javac -encoding UTF-8 -d out server/*.java

# Default port (Render injects dynamic PORT environment variable)
ENV PORT=8080
EXPOSE 8080 10000

# Start the SmartTutorServer
CMD ["java", "-cp", "out", "server.SmartTutorServer"]
