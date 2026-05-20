# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Install systems dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY backend/ ./

# Copy built frontend files from Stage 1 to a folder where Django can find them
# settings.py looks for BASE_DIR.parent / 'frontend' / 'dist'
# If BASE_DIR is /app (backend root), then BASE_DIR.parent is /
RUN mkdir -p /frontend
COPY --from=frontend-builder /app/frontend/dist /frontend/dist

# Set dummy environment variables for collectstatic
ENV SECRET_KEY=dummy
ENV DATABASE_URL=sqlite:///db.sqlite3

# Collect static files (WhiteNoise will handle them)
RUN python manage.py collectstatic --no-input

# Expose port and run gunicorn using the PORT environment variable provided by Render
EXPOSE 8000
CMD ["sh", "-c", "gunicorn config.wsgi --bind 0.0.0.0:${PORT:-8000}"]
