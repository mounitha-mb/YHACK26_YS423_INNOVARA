import os
import json
import re
from typing import List, Dict, Any, Optional
import requests
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Load environment variables from backend/.env
load_dotenv()

# Maximum text length sent to LLM for MVP safety
MAX_SOURCE_LENGTH = 12000

class StructuredContent(BaseModel):
    title: str = Field(default="", description="Descriptive title of the source content")
    main_topic: str = Field(default="", description="Core subject or thematic domain")
    summary: str = Field(default="", description="Concise explanatory digest based solely on source")
    key_points: List[str] = Field(default_factory=list, description="Essential takeaway points")
    key_facts: List[str] = Field(default_factory=list, description="Factual claims verified by source")
    keywords: List[str] = Field(default_factory=list, description="Crucial domain keywords")
    dates: List[str] = Field(default_factory=list, description="Explicit dates mentioned")
    numbers: List[str] = Field(default_factory=list, description="Numerical values, metrics, and currencies")
    people: List[str] = Field(default_factory=list, description="Specific people or roles mentioned")
    locations: List[str] = Field(default_factory=list, description="Locations, organizations, or platforms")
    actions_required: List[str] = Field(default_factory=list, description="Actionable recommendations or next steps")
    warnings: List[str] = Field(default_factory=list, description="Explicit warnings, alerts, or caveats")
    communication_objective: str = Field(default="", description="Primary purpose of this communication")


def build_llm_prompt(source_text: str, nlp_analysis: Dict[str, Any]) -> str:
    """
    Constructs a fact-preserving prompt incorporating Phase 3 NLP context.
    """
    # Truncate source if exceedingly long for MVP safety
    safe_source = source_text[:MAX_SOURCE_LENGTH]
    if len(source_text) > MAX_SOURCE_LENGTH:
        safe_source += "\n\n[Note: Content truncated for size limit]"

    # Format Phase 3 NLP terms
    tfidf_terms = ", ".join([k.get("term", "") for k in nlp_analysis.get("keywords", [])[:10]])
    keyphrases = ", ".join([p.get("phrase", "") for p in nlp_analysis.get("keyphrases", [])[:10]])
    
    key_info = nlp_analysis.get("key_information", {})
    extracted_dates = ", ".join(key_info.get("dates", [])[:8]) or "None"
    extracted_numbers = ", ".join(key_info.get("numbers", [])[:8]) or "None"
    extracted_percentages = ", ".join(key_info.get("percentages", [])[:8]) or "None"
    extracted_emails = ", ".join(key_info.get("emails", [])[:5]) or "None"
    extracted_urls = ", ".join(key_info.get("urls", [])[:5]) or "None"

    return f"""You are the content analysis engine of ContentForge AI.
Your task is to understand the provided source content and convert it into a structured representation.

SOURCE CONTENT:
\"\"\"
{safe_source}
\"\"\"

TF-IDF IMPORTANT TERMS:
{tfidf_terms}

KEYBERT KEY PHRASES:
{keyphrases}

EXTRACTED INFORMATION:
Dates: {extracted_dates}
Numbers/Metrics: {extracted_numbers}
Percentages: {extracted_percentages}
Emails: {extracted_emails}
URLs: {extracted_urls}

RULES FOR ANALYSIS:
1. Analyze the provided source content carefully.
2. Use ONLY information supported directly by the source.
3. Do NOT hallucinate or invent facts, dates, numbers, names, locations, events, or recommendations.
4. If a field is not available or not mentioned in the source, return an empty string "" or empty list [].
5. Preserve important facts, numerical values, metrics, and dates EXACTLY as they appear in the source.
6. Identify the primary communication objective (e.g., inform, alert, train, advise).
7. Identify any explicit warnings, security alerts, or restrictions present in the source.
8. Return valid JSON only adhering strictly to the schema below.

RETURN JSON WITH THIS EXACT STRUCTURE:
{{
  "title": "Clear document title",
  "main_topic": "Primary subject",
  "summary": "2-3 sentence factual digest of source",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "key_facts": ["Fact 1", "Fact 2"],
  "keywords": ["keyword1", "keyword2"],
  "dates": ["date1", "date2"],
  "numbers": ["number1", "number2"],
  "people": ["person/role1"],
  "locations": ["location/organization1"],
  "actions_required": ["action1"],
  "warnings": ["warning1"],
  "communication_objective": "Primary purpose of content"
}}
"""


def clean_json_response(raw_response_text: str) -> str:
    """Removes markdown code fences and extraneous text from JSON response."""
    text = raw_response_text.strip()
    if text.startswith("```"):
        # Match ```json ... ``` or ``` ... ```
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if match:
            text = match.group(1).strip()
    return text


def build_deterministic_fallback(source_text: str, nlp_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Creates a baseline structured representation from Phase 3 NLP analysis
    when Gemini API key is not configured or offline.
    Ensures the application never crashes and the user can proceed to edit.
    """
    sentences = [s.strip() for s in source_text.split('.') if len(s.strip()) > 10]
    first_sentence = sentences[0] if sentences else source_text[:120]
    
    keywords = [k.get("term", "") for k in nlp_analysis.get("keywords", [])[:8] if k.get("term")]
    keyphrases = [p.get("phrase", "") for p in nlp_analysis.get("keyphrases", [])[:5] if p.get("phrase")]
    key_info = nlp_analysis.get("key_information", {})

    main_topic = keyphrases[0].title() if keyphrases else (keywords[0].title() if keywords else "Content Overview")
    title = f"{main_topic} Overview"

    return {
        "title": title,
        "main_topic": main_topic,
        "summary": first_sentence + "." if not first_sentence.endswith('.') else first_sentence,
        "key_points": keyphrases[:5] if keyphrases else ["Primary document concepts outlined above"],
        "key_facts": [s + "." for s in sentences[:3]] if sentences else ["Content facts preserved from source"],
        "keywords": keywords,
        "dates": key_info.get("dates", [])[:5],
        "numbers": key_info.get("numbers", [])[:8],
        "people": [],
        "locations": [],
        "actions_required": ["Review and tune structured content before multi-format transformation"],
        "warnings": [],
        "communication_objective": "Inform stakeholders of core source content"
    }


def generate_structured_content(source_text: str, nlp_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Orchestrates the Phase 4 LLM semantic understanding flow:
    1. Checks for GEMINI_API_KEY
    2. Builds prompt with source text + Phase 3 NLP context
    3. Queries Google Gemini 1.5 Flash API
    4. Validates JSON with Pydantic
    5. Returns structured content or safe fallback with clear status
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key:
        fallback_content = build_deterministic_fallback(source_text, nlp_analysis)
        return {
            "structured_content": fallback_content,
            "llm_status": "missing_key",
            "llm_message": "AI analysis is using deterministic baseline. Add GEMINI_API_KEY in backend/.env to activate full Gemini semantic understanding."
        }

    prompt = build_llm_prompt(source_text, nlp_analysis)

    # Call official Gemini 1.5 Flash endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.1
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            err_data = response.json() if response.text else {}
            err_msg = err_data.get("error", {}).get("message", response.text)
            print(f"[Gemini API Error] HTTP {response.status_code}: {err_msg}")
            fallback_content = build_deterministic_fallback(source_text, nlp_analysis)
            return {
                "structured_content": fallback_content,
                "llm_status": "error",
                "llm_message": "AI analysis is temporarily unavailable. Please check your API configuration and try again."
            }

        res_json = response.json()
        candidates = res_json.get("candidates", [])
        if not candidates:
            fallback_content = build_deterministic_fallback(source_text, nlp_analysis)
            return {
                "structured_content": fallback_content,
                "llm_status": "error",
                "llm_message": "Gemini returned empty response. Baseline structure generated."
            }

        raw_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        cleaned_json_str = clean_json_response(raw_content)

        # Parse JSON
        parsed_dict = json.loads(cleaned_json_str)

        # Validate with Pydantic
        validated_model = StructuredContent(**parsed_dict)
        return {
            "structured_content": validated_model.dict(),
            "llm_status": "success",
            "llm_message": "Structured semantic understanding generated successfully by Gemini."
        }

    except json.JSONDecodeError as jde:
        print(f"[JSON Decode Error]: {jde}")
        fallback_content = build_deterministic_fallback(source_text, nlp_analysis)
        return {
            "structured_content": fallback_content,
            "llm_status": "error",
            "llm_message": "AI response formatting issue. Baseline structure generated."
        }
    except Exception as e:
        print(f"[LLM Service Exception]: {e}")
        fallback_content = build_deterministic_fallback(source_text, nlp_analysis)
        return {
            "structured_content": fallback_content,
            "llm_status": "error",
            "llm_message": "AI analysis is temporarily unavailable. Please check your API configuration and try again."
        }
