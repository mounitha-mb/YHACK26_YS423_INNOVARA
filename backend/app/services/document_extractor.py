import os
import io
import re
import base64
from typing import Dict, Any, Optional
import requests
import pymupdf  # PyMuPDF
from dotenv import load_dotenv
from app.utils.text_cleaner import clean_extracted_text

load_dotenv()

# Maximum allowed file size: 25MB
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

SUPPORTED_EXTENSIONS = {
    ".pdf": "pdf",
    ".txt": "txt",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
}

class DocumentExtractionError(Exception):
    """Custom exception for document extraction failures."""
    pass


def extract_content_from_bytes(filename: str, file_bytes: bytes) -> Dict[str, Any]:
    """
    Main extraction pipeline:
    1. Validates file presence and size
    2. Validates supported extension
    3. Dispatches to dedicated extractor (PDF with PyMuPDF & OCR fallback, TXT, Image)
    4. Cleans and normalizes extracted text
    """
    if not file_bytes or len(file_bytes) == 0:
        raise DocumentExtractionError("Uploaded file is empty (0 bytes). Please upload a valid document.")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        mb_size = len(file_bytes) / (1024 * 1024)
        raise DocumentExtractionError(f"File size exceeds the 25MB limit ({mb_size:.1f}MB). Please upload a smaller document.")

    # Determine file extension (case-insensitive)
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in SUPPORTED_EXTENSIONS:
        raise DocumentExtractionError(
            f"Unsupported file format '{ext}'. Allowed formats: PDF, TXT, PNG, JPG, JPEG."
        )

    file_category = SUPPORTED_EXTENSIONS[ext]

    if file_category == "pdf":
        return _extract_pdf(filename, file_bytes)
    elif file_category == "txt":
        return _extract_txt(filename, file_bytes)
    elif file_category == "image":
        return _handle_image(filename, file_bytes, ext)
    else:
        raise DocumentExtractionError(f"Handler not configured for {ext}")


def _try_pymupdf_ocr(doc: pymupdf.Document) -> Optional[str]:
    """
    Attempts PyMuPDF built-in Tesseract OCR if local tessdata/tesseract is configured.
    """
    try:
        ocr_pages = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            tp = page.get_textpage_ocr(language="eng", dpi=150)
            text = tp.extractText()
            if text and text.strip():
                ocr_pages.append(text.strip())
        combined = "\n\n".join(ocr_pages).strip()
        if len(combined) > 20:
            return combined
    except Exception:
        pass
    return None


def _perform_gemini_ocr(file_bytes: bytes, doc: pymupdf.Document) -> Optional[str]:
    """
    Multimodal AI OCR fallback using Google Gemini 1.5 Flash.
    Transcribes scanned/image-based PDFs with extreme accuracy.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}

    # Attempt 1: Direct application/pdf inline document transmission
    try:
        b64_pdf = base64.b64encode(file_bytes).decode("utf-8")
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "inline_data": {
                                "mime_type": "application/pdf",
                                "data": b64_pdf
                            }
                        },
                        {
                            "text": (
                                "Transcribe all visible text from this scanned document accurately and completely. "
                                "Preserve headings, paragraphs, lists, dates, and numbers. "
                                "Do not summarize, alter, or add commentary. Return only the extracted text verbatim."
                            )
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.0
            }
        }
        res = requests.post(url, headers=headers, json=payload, timeout=45)
        if res.status_code == 200:
            data = res.json()
            candidates = data.get("candidates", [])
            if candidates:
                raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if raw_text and raw_text.strip():
                    return raw_text.strip()
    except Exception as e:
        print(f"[Gemini Direct PDF OCR Warning]: {e}")

    # Attempt 2: Page-by-page pixmap image rendering fallback
    try:
        page_transcriptions = []
        total_pages = len(doc)
        for page_num in range(min(total_pages, 8)):
            page = doc.load_page(page_num)
            pix = page.get_pixmap(dpi=150)
            png_bytes = pix.tobytes("png")
            b64_img = base64.b64encode(png_bytes).decode("utf-8")
            img_payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "inline_data": {
                                    "mime_type": "image/png",
                                    "data": b64_img
                                }
                            },
                            {
                                "text": "Transcribe all readable text from this scanned document page verbatim. Return only the extracted text."
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.0
                }
            }
            img_res = requests.post(url, headers=headers, json=img_payload, timeout=25)
            if img_res.status_code == 200:
                img_data = img_res.json()
                cands = img_data.get("candidates", [])
                if cands:
                    t = cands[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if t and t.strip():
                        page_transcriptions.append(t.strip())

        if page_transcriptions:
            return "\n\n".join(page_transcriptions)
    except Exception as e:
        print(f"[Gemini Page OCR Warning]: {e}")

    return None


def _extract_pdf(filename: str, file_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts text page-by-page from PDF using PyMuPDF (fitz).
    - Sorts text blocks in logical reading order
    - Validates encryption / corruption
    - Automatically detects scanned/image-based documents
    - Triggers OCR fallback (PyMuPDF local OCR or Gemini Multimodal OCR)
    """
    try:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise DocumentExtractionError(f"Unable to read or parse PDF. The file may be corrupted or unreadable: {str(e)}")

    if doc.is_encrypted:
        doc.close()
        raise DocumentExtractionError("The PDF file is password protected or encrypted. Please upload an unencrypted document.")

    total_pages = len(doc)
    if total_pages == 0:
        doc.close()
        raise DocumentExtractionError("The PDF document contains no pages.")

    # Extract text with sort=True for natural reading order across multi-column layouts
    page_texts = []
    for page_num in range(total_pages):
        try:
            page = doc.load_page(page_num)
            page_text = page.get_text("text", sort=True)
            if page_text and page_text.strip():
                page_texts.append(page_text.strip())
        except Exception:
            continue

    combined_text = "\n\n".join(page_texts)
    cleaned_text = clean_extracted_text(combined_text)

    # Check if this is a scanned / image-based PDF
    # (Document has very little or no selectable text, but has images/drawings)
    is_scanned = False
    if len(cleaned_text.strip()) < 30:
        # Check if pages contain images or graphics
        for p_idx in range(min(total_pages, 5)):
            try:
                p = doc.load_page(p_idx)
                if len(p.get_images()) > 0 or len(p.get_drawings()) > 0 or len(p.get_text().strip()) == 0:
                    is_scanned = True
                    break
            except Exception:
                pass

    extracted_via_ocr = False

    # Trigger OCR fallback if scanned or empty
    if is_scanned or len(cleaned_text.strip()) == 0:
        # 1. Attempt local PyMuPDF OCR
        ocr_text = _try_pymupdf_ocr(doc)
        if ocr_text:
            cleaned_text = clean_extracted_text(ocr_text)
            extracted_via_ocr = True

        # 2. Attempt Gemini Multimodal Vision OCR if local OCR yielded nothing
        if not cleaned_text:
            gemini_ocr_text = _perform_gemini_ocr(file_bytes, doc)
            if gemini_ocr_text:
                cleaned_text = clean_extracted_text(gemini_ocr_text)
                extracted_via_ocr = True

    doc.close()

    # Determine status message
    if not cleaned_text:
        return {
            "success": True,
            "filename": filename,
            "file_type": "pdf",
            "page_count": total_pages,
            "text": "",
            "character_count": 0,
            "is_scanned": True,
            "extracted_via_ocr": False,
            "message": "PDF appears to be a scanned document or image without selectable text. Add GEMINI_API_KEY in backend/.env for automatic AI OCR, or click 'Edit' to enter text manually."
        }

    if extracted_via_ocr:
        msg = f"Successfully transcribed text via AI OCR across {total_pages} page(s)."
    else:
        msg = f"Successfully extracted text across {total_pages} page(s)."

    return {
        "success": True,
        "filename": filename,
        "file_type": "pdf",
        "page_count": total_pages,
        "text": cleaned_text,
        "character_count": len(cleaned_text),
        "is_scanned": is_scanned,
        "extracted_via_ocr": extracted_via_ocr,
        "message": msg
    }


def _extract_txt(filename: str, file_bytes: bytes) -> Dict[str, Any]:
    """
    Reads plain text files with UTF-8 decoding, falling back to latin-1 if needed.
    """
    try:
        raw_text = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            raw_text = file_bytes.decode("latin-1")
        except Exception as e:
            raise DocumentExtractionError(f"Failed to decode text file. Ensure it is UTF-8 encoded: {str(e)}")

    cleaned_text = clean_extracted_text(raw_text)

    if not cleaned_text:
        return {
            "success": True,
            "filename": filename,
            "file_type": "txt",
            "text": "",
            "character_count": 0,
            "message": "Text file is blank."
        }

    return {
        "success": True,
        "filename": filename,
        "file_type": "txt",
        "text": cleaned_text,
        "character_count": len(cleaned_text),
        "message": "Successfully extracted text from document."
    }


def _handle_image(filename: str, file_bytes: bytes, ext: str) -> Dict[str, Any]:
    """
    Validates image header bytes for PNG/JPG/JPEG.
    If GEMINI_API_KEY is available, transcribes text via Gemini Multimodal OCR.
    """
    is_valid_png = file_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    is_valid_jpeg = file_bytes.startswith(b"\xff\xd8\xff")

    if ext == ".png" and not is_valid_png:
        raise DocumentExtractionError("File has .png extension but invalid PNG header.")
    elif ext in [".jpg", ".jpeg"] and not is_valid_jpeg:
        raise DocumentExtractionError("File has JPEG extension but invalid JPEG header.")

    # Attempt AI OCR if Gemini API key is configured
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if api_key:
        # 1. Try google-genai SDK
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            mime = "image/png" if ext == ".png" else "image/jpeg"
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    genai.types.Part.from_bytes(data=file_bytes, mime_type=mime),
                    "Transcribe all visible text from this image verbatim. Preserve paragraphs, lists, and numbers. Return only the extracted text."
                ]
            )
            if response and response.text and response.text.strip():
                cleaned = clean_extracted_text(response.text)
                return {
                    "success": True,
                    "filename": filename,
                    "file_type": "image",
                    "text": cleaned,
                    "character_count": len(cleaned),
                    "extracted_via_ocr": True,
                    "message": "Successfully extracted text from image via Gemini AI OCR."
                }
        except Exception as sdk_ocr_err:
            err_str = str(sdk_ocr_err)
            print(f"[Gemini SDK Image OCR Error]: {sdk_ocr_err}")
            if not ("401" in err_str or "UNAUTHENTICATED" in err_str):
                # Try REST fallback only if not unauthorized
                try:
                    mime = "image/png" if ext == ".png" else "image/jpeg"
                    b64_img = base64.b64encode(file_bytes).decode("utf-8")
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                    headers = {"Content-Type": "application/json"}
                    payload = {
                        "contents": [
                            {
                                "parts": [
                                    {"inline_data": {"mime_type": mime, "data": b64_img}},
                                    {"text": "Transcribe all visible text from this image verbatim. Return only the extracted text."}
                                ]
                            }
                        ],
                        "generationConfig": {"temperature": 0.0}
                    }
                    res = requests.post(url, headers=headers, json=payload, timeout=20)
                    if res.status_code == 200:
                        data = res.json()
                        cands = data.get("candidates", [])
                        if cands:
                            extracted = cands[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            if extracted and extracted.strip():
                                cleaned = clean_extracted_text(extracted)
                                return {
                                    "success": True,
                                    "filename": filename,
                                    "file_type": "image",
                                    "text": cleaned,
                                    "character_count": len(cleaned),
                                    "extracted_via_ocr": True,
                                    "message": "Successfully extracted text from image via AI OCR."
                                }
                except Exception as rest_ocr_err:
                    print(f"[Gemini REST Image OCR Error]: {rest_ocr_err}")

    # Fallback when offline or Gemini API key is missing
    clean_name = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title()
    fallback_text = (
        f"Document Image: {clean_name}\n"
        f"File: {filename} ({len(file_bytes)//1024} KB {ext.upper()})\n\n"
        f"This visual asset has been ingested for multi-format AI transformation. "
        f"You can review or edit this text directly in the Source Preview editor below "
        f"before generating your summaries, flashcards, slides, and scripts."
    )
    return {
        "success": True,
        "filename": filename,
        "file_type": "image",
        "text": fallback_text,
        "character_count": len(fallback_text),
        "extracted_via_ocr": False,
        "message": "Image ingested. You can edit text directly in the editor before transformation."
    }
