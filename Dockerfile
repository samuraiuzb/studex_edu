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

# Copy all project files into /app
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set dummy environment variables for collectstatic
ENV SECRET_KEY=dummy
ENV DATABASE_URL=sqlite:///db.sqlite3

# Collect static files
RUN python manage.py collectstatic --no-input

# Expose port and run migrations then gunicorn
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate && gunicorn config.wsgi --bind 0.0.0.0:${PORT:-8000}"]
