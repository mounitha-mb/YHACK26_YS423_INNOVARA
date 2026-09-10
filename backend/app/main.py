from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.upload import router as upload_router
from app.routes.analyze import router as analyze_router
from app.routes.generate import router as generate_router
from app.routes.auth import router as auth_router

app = FastAPI(
    title="ContentForge AI Backend",
    description="Multi-Format Content Transformation Platform API – Phase 5 AI Transformation",
    version="5.0.0"
)

# Configure CORS so local React dev server can communicate seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(upload_router)
app.include_router(analyze_router)
app.include_router(generate_router)
app.include_router(auth_router)

# Root health check endpoint preserved from Phase 1
@app.get("/")
def health_check():
    return {"message": "ContentForge AI backend is running"}
