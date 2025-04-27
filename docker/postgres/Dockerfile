FROM postgis/postgis:15-3.3

# Add initialization scripts
COPY init-db.sh /docker-entrypoint-initdb.d/10-init-db.sh
COPY init-extensions.sql /docker-entrypoint-initdb.d/20-init-extensions.sql

# Make the script executable
RUN chmod +x /docker-entrypoint-initdb.d/10-init-db.sh

# Set environment variables
ENV POSTGRES_USER=agricarbonx
ENV POSTGRES_PASSWORD=agricarbonxpass
ENV POSTGRES_DB=agricarbonx

# Expose port
EXPOSE 5432
