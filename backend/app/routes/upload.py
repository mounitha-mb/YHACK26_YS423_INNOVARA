from fastapi import APIRouter, UploadFile, File, status
from fastapi.responses import JSONResponse
from app.services.document_extractor import (
    extract_content_from_bytes,
    DocumentExtractionError,
    SUPPORTED_EXTENSIONS
)

router = APIRouter(prefix="/api", tags=["Document Upload & Extraction"])

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Receives an uploaded file (PDF, TXT, PNG, JPG, JPEG),
    validates format and size, extracts readable text,
    and returns metadata without permanent server storage.
    """
    if not file or not file.filename:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": "No file was uploaded."}
        )

    filename = file.filename
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""

    if ext not in SUPPORTED_EXTENSIONS:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": f"Unsupported file type '{ext}'. Supported formats: PDF, TXT, PNG, JPG, JPEG."
            }
        )

    try:
        # Read file bytes in-memory
        file_bytes = await file.read()

        if len(file_bytes) == 0:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"success": False, "error": "Uploaded file is empty (0 bytes)."}
            )

        # Process through document extraction pipeline
        result = extract_content_from_bytes(filename, file_bytes)
        return JSONResponse(status_code=status.HTTP_200_OK, content=result)

    except DocumentExtractionError as de:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": str(de)}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": f"Server error processing file: {str(e)}"}
        )
    finally:
        await file.close()
