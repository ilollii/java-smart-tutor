# Use official Eclipse Temurin JDK 21 (includes javac for code compilation sandbox)
FROM eclipse-temurin:21-jdk-jammy

# Set working directory
WORKDIR /app

# Copy server sources, static assets, and data files
COPY server/ ./server/
COPY public/ ./public/
COPY data/ ./data/

# Compile all Java backend sources into out/ with explicit UTF-8 encoding
RUN mkdir -p out && javac -encoding UTF-8 -d out server/*.java

# Render provides the PORT environment variable dynamically
ENV PORT=8080
EXPOSE 8080

# Health check to ensure server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Start the SmartTutorServer
CMD ["java", "-cp", "out", "server.SmartTutorServer"]
