import re
from typing import List, Dict, Any

def preprocess_for_nlp(text: str) -> str:
    """
    Normalizes text for NLP processing:
    - Normalizes line breaks and whitespace
    - Preserves case for Named Entity and Sentence recognition
    - Keeps meaningful punctuation (periods, commas, hyphens, colons, percentages, dollar signs)
    - Strips non-printable and control characters
    """
    if not text:
        return ""

    # Normalize line endings
    normalized = text.replace('\r\n', '\n').replace('\r', '\n')

    # Remove non-printable control characters except \n and \t
    normalized = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', normalized)

    # Collapse excessive spaces while preserving newlines
    normalized = re.sub(r'[ \t]+', ' ', normalized)
    normalized = re.sub(r'\n{3,}', '\n\n', normalized)

    return normalized.strip()


def split_into_sentences(text: str) -> List[str]:
    """
    Splits text into sentences using regex boundary detection.
    Protects common abbreviations (e.g., Dr., Mr., e.g., i.e., vs.) and decimal numbers.
    """
    if not text:
        return []

    # Clean text first
    clean = preprocess_for_nlp(text)
    if not clean:
        return []

    # Protect decimals like 3.14 and common abbreviations
    protected = re.sub(r'(\d+)\.(\d+)', r'\1<DOT>\2', clean)
    protected = re.sub(r'\b(e\.g|i\.e|Mr|Mrs|Ms|Dr|Prof|vs|etc)\.', r'\1<DOT>', protected, flags=re.IGNORECASE)

    # Split on sentence terminals (. ! ?) followed by whitespace or end
    raw_sentences = re.split(r'[.!?]+(?:\s+|\n+|$)', protected)

    sentences = []
    for s in raw_sentences:
        s = s.replace('<DOT>', '.').strip()
        if len(s) > 2:  # ignore trivial residual punctuation
            sentences.append(s)

    return sentences


def count_paragraphs(text: str) -> int:
    """
    Counts distinct, non-empty paragraphs separated by one or more blank lines.
    """
    if not text:
        return 0
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]
    return len(paragraphs) if paragraphs else (1 if text.strip() else 0)
