from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.services.nlp_analyzer import analyze_text
from app.services.llm_service import generate_structured_content

router = APIRouter(prefix="/api", tags=["NLP & LLM Analysis"])

class AnalyzeRequest(BaseModel):
    text: str

@router.post("/analyze")
async def analyze_document(request: AnalyzeRequest):
    """
    Phase 3 + Phase 4 Endpoint:
    1. Preprocesses and performs Phase 3 NLP statistical & keyword analysis
    2. Passes source text + NLP context to Phase 4 LLM (Gemini 1.5 Flash)
    3. Validates and returns the Structured Content Representation
    """
    raw_text = request.text

    if not raw_text or not raw_text.strip():
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": "No content available for analysis. Please upload or provide document text."
            }
        )

    try:
        # Step 1: Run Phase 3 NLP analysis (Statistics, TF-IDF, KeyBERT, key entities)
        nlp_analysis = analyze_text(raw_text)

        # Step 2: Run Phase 4 LLM semantic understanding to construct Structured Content
        llm_result = generate_structured_content(raw_text, nlp_analysis)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "analysis": nlp_analysis,
                "structured_content": llm_result["structured_content"],
                "llm_status": llm_result.get("llm_status", "success"),
                "llm_message": llm_result.get("llm_message", "")
            }
        )

    except ValueError as ve:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": str(ve)
            }
        )
    except Exception as e:
        print(f"[Analyze Endpoint Error]: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "Unable to analyze the content. Please try again."
            }
        )
