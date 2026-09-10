from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel
from app.services.content_generator import (
    transform_content,
    get_stored_file,
    SUPPORTED_FORMATS
)

router = APIRouter(prefix="/api", tags=["AI Content Transformation"])


class GenerateRequest(BaseModel):
    text: str
    format: Optional[str] = "summary"
    formats: Optional[List[str]] = None
    audience: Optional[str] = "General"
    tone: Optional[str] = "Professional"
    language: Optional[str] = "English"
    length: Optional[str] = "Medium"


@router.post("/generate")
async def generate_transformed_content(request: GenerateRequest):
    """
    Phase 5 Endpoint:
    Transforms extracted source text into selected output format(s):
    - summary: Concise structured summary
    - blog: Title, introduction, sections, conclusion
    - mcq: Questions, 4 options, correct answer, explanation
    - image: Optimized visual prompt + generated image asset
    - doc: Downloadable .docx document (python-docx)
    - presentation: Slide-wise presentation deck + downloadable .pptx (python-pptx)
    """
    raw_text = request.text
    if not raw_text or not raw_text.strip():
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": "No content provided. Please upload a document or provide text to transform."
            }
        )

    # Determine formats to generate
    formats_to_process = []
    if request.formats and len(request.formats) > 0:
        formats_to_process = [f.lower().strip() for f in request.formats if f.lower().strip() in SUPPORTED_FORMATS]
    
    if not formats_to_process:
        primary_fmt = (request.format or "summary").lower().strip()
        if primary_fmt not in SUPPORTED_FORMATS:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": f"Invalid format '{primary_fmt}'. Supported: {', '.join(SUPPORTED_FORMATS)}"
                }
            )
        formats_to_process = [primary_fmt]

    try:
        results: Dict[str, Any] = {}
        for fmt in formats_to_process:
            gen_result = transform_content(
                source_text=raw_text,
                selected_format=fmt,
                audience=request.audience or "General",
                tone=request.tone or "Professional",
                language=request.language or "English",
                length=request.length or "Medium"
            )
            results[fmt] = gen_result

        first_fmt = formats_to_process[0]
        primary_result = results.get(first_fmt, {})

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "format": first_fmt,
                "formats": formats_to_process,
                "result": primary_result,
                "results": results,
                "llm_status": primary_result.get("status", "success"),
                "llm_message": primary_result.get("message", "Transformed successfully.")
            }
        )

    except ValueError as ve:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": str(ve)}
        )
    except Exception as e:
        print(f"[Generate Endpoint Error]: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": f"Transformation processing failed: {str(e)}"
            }
        )


@router.get("/download/{file_id}")
async def download_generated_file(file_id: str):
    """
    Streams generated downloadable asset (.docx or .pptx)
    with proper MIME type and Content-Disposition headers.
    """
    stored = get_stored_file(file_id)
    if not stored:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested file not found or download link has expired."
        )

    filename = stored["filename"]
    mime_type = stored["mime_type"]
    file_bytes = stored["bytes"]

    return Response(
        content=file_bytes,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
