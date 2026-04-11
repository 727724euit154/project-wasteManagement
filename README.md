# Construction Waste Intelligence Platform

The Construction Waste Intelligence Platform is an AI-powered marketplace mapping demolition salvage to optimized recycler networks bridging the Circular Economy.

## Ecosystem Architecture
- **Nginx**: Edge reverse-proxy terminating traffic loops (`/`, `/api`, `/ai`).
- **Next.js (Frontend)**: Standalone multi-stage React output bridging driver logistics mapping interfaces and circular economy dashboards.
- **FastAPI (Backend)**: SQLAlchemy monorepo intercepting geospatial PostGIS boundaries and automatically firing ESG interceptor calculations.
- **FastAPI (AI)**: Decoupled YOLOv8 matrix endpoints converting spatial bitmaps into JSON tensors.
- **PostGIS / Postgres**: Relational Database containing `ST_DistanceSphere` algorithms.
- **Redis**: Background queue orchestration network.

## Run Production Containers

To spin up the ecosystem safely mapping discrete `.env.production` blocks against the docker-compose networks:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### Automatic Processes
- The Nginx reverse proxy attaches to `http://localhost:80`.
- The database Alembic migration array strictly executes *before* Uvicorn accepts Web connections (`alembic upgrade head`).
- Health checks automatically poll endpoints ensuring containers do not hang if Postgres boot up delays.

## Development Local Test
```bash
docker-compose up
```
If using separate local commands inside child folders, be sure to bind `npm run dev` in `frontend` resolving back to `http://localhost:3000`.
