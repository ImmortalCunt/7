# AgricarbonX

A full-stack open-source platform for estimating soil organic carbon (SOC) and moisture from satellite, soil, and weather data.

## Project Overview

AgricarbonX leverages Earth observation data (Sentinel-2, Landsat-8/9) and ancillary datasets (SoilGrids, NOAA/NASA climate data) to provide scientific reports and interactive maps for soil property estimation. It features a React frontend and a FastAPI backend, orchestrated using Docker Compose.

## Features

-   **Region Selection**: Draw polygons or upload GeoJSON/Shapefiles.
-   **Time Selection**: Define the analysis period.
-   **Data Ingestion**: Fetches Sentinel-2, Landsat-8/9, SoilGrids, and climate data.
-   **Preprocessing**: Cloud masking, atmospheric correction, spectral indices (NDVI, EVI, NDMI).
-   **ML Prediction**: Uses PyTorch CNN models for SOC and moisture estimation.
-   **Results Visualization**: Interactive maps (MapLibre GL JS), charts (Plotly), and downloadable PDF reports.
-   **Job Management**: Track analysis progress and view past results.

## Technology Stack

-   **Frontend**: React 18, Vite, TailwindCSS, MapLibre GL JS, React Leaflet, Plotly.js
-   **Backend**: FastAPI, Python 3.11, Celery, Redis
-   **Database**: PostgreSQL + PostGIS
-   **Storage**: MinIO (S3-compatible, for storing intermediate/final results)
-   **ML**: PyTorch
-   **GIS Libraries**: Rasterio, GDAL, Shapely, Fiona, PyProj
-   **Deployment**: Docker, Docker Compose

## Project Structure

```
AgricarbonX/
├── backend/
│   ├── app/
│   │   ├── api/         # FastAPI endpoints
│   │   ├── core/        # Configuration, Celery, MinIO
│   │   ├── db/          # Database session, models
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic (ingest, preprocess, predict, report, job)
│   │   ├── tasks/       # Celery tasks
│   │   ├── templates/   # Report HTML template
│   │   └── main.py      # FastAPI app entrypoint
│   ├── tests/         # Backend unit tests
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/         # API client (axios)
│   │   ├── assets/      # Static assets
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts (Job, Region, DataSource)
│   │   ├── styles/      # CSS files
│   │   ├── tests/       # Frontend unit tests
│   │   └── App.jsx      # Main application component
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   ├── frontend/
│   │   └── Dockerfile
│   └── postgres/
│       ├── Dockerfile
│       ├── init-db.sh
│       └── init-extensions.sql
├── docker-compose.yml
├── README.md
└── todo.md
```

## Setup and Deployment (Using Docker Compose)

**Prerequisites:**

-   Docker
-   Docker Compose

**Steps:**

1.  **Clone the Repository (or extract the provided zip file):**
    ```bash
    # If you have the zip file:
    unzip AgricarbonX.zip
    cd AgricarbonX
    ```

2.  **Environment Variables:**
    -   Create a `.env` file in the `AgricarbonX` root directory based on the environment variables used in `docker-compose.yml` and `backend/app/core/config.py`. Key variables include:
        -   `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
        -   `DATABASE_URL` (e.g., `postgresql+psycopg2://user:password@postgres:5432/agricarbonx`)
        -   `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
        -   `MINIO_ENDPOINT` (e.g., `minio:9000`)
        -   `CELERY_BROKER_URL` (e.g., `redis://redis:6379/0`)
        -   `CELERY_RESULT_BACKEND` (e.g., `redis://redis:6379/0`)
        -   `REACT_APP_API_URL` (for frontend, e.g., `http://localhost:8000`)

3.  **Build and Run Containers:**
    ```bash
    sudo docker-compose up --build -d
    ```
    This command builds the images for the backend, frontend, and database services and starts them in detached mode.

4.  **Access the Application:**
    -   The frontend should be accessible at `http://localhost:3000` (or the port specified in `docker-compose.yml`).
    -   The backend API will be available at `http://localhost:8000`.
    -   MinIO console: `http://localhost:9001` (use the access/secret keys from your `.env`).

5.  **Database Initialization:**
    -   The `init-db.sh` script within the `postgres` container automatically creates the database and enables the PostGIS extension.
    -   Database migrations (if using Alembic, not fully implemented here) would typically be run after the containers are up:
        ```bash
        sudo docker-compose exec backend alembic upgrade head
        ```

6.  **Running Tests:**
    -   **Backend:**
        ```bash
        sudo docker-compose exec backend python -m unittest discover tests
        ```
    -   **Frontend:**
        ```bash
        sudo docker-compose exec frontend npm test
        # or
        sudo docker-compose exec frontend pnpm test
        ```

7.  **Stopping the Application:**
    ```bash
    sudo docker-compose down
    ```

## Notes

-   The ML models (`soc_model.pth`, `moisture_model.pth`) are currently placeholders in the `predict_service`. You would need to train and place the actual model files in the `backend/app/models/ml/` directory (or configure the path in `config.py`).
-   Data ingestion from external sources (Sentinel Hub, SoilGrids API, etc.) requires API keys or credentials, which need to be configured securely (e.g., via environment variables or a secrets management system).
-   Error handling, logging, and monitoring should be enhanced for a production environment.
-   Frontend tests require setting up Jest and React Testing Library (`npm install --save-dev jest @testing-library/react @testing-library/jest-dom` or `pnpm add -D jest @testing-library/react @testing-library/jest-dom`).

