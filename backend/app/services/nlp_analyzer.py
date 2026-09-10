import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from app.utils.text_preprocessor import (
    preprocess_for_nlp,
    split_into_sentences,
    count_paragraphs
)

# Global lazy-loaded KeyBERT instance
_keybert_model = None
_keybert_failed = False

def get_keybert_model():
    """
    Lazily loads KeyBERT with lightweight all-MiniLM-L6-v2 model.
    Falls back gracefully if torch or sentence-transformers encounters issues.
    """
    global _keybert_model, _keybert_failed
    if _keybert_model is not None:
        return _keybert_model
    if _keybert_failed:
        return None

    try:
        from keybert import KeyBERT
        # Use lightweight all-MiniLM-L6-v2
        _keybert_model = KeyBERT(model="all-MiniLM-L6-v2")
        return _keybert_model
    except Exception as e:
        print(f"[KeyBERT Warning] Unable to initialize KeyBERT model: {e}")
        _keybert_failed = True
        return None


def calculate_statistics(text: str, sentences: List[str]) -> Dict[str, int]:
    """Calculates word, character, sentence, and paragraph counts."""
    # Words based on whitespace and word characters
    words = re.findall(r'\b\w+\b', text)
    word_count = len(words)
    char_count = len(text)
    sentence_count = max(len(sentences), 1 if word_count > 0 else 0)
    para_count = count_paragraphs(text)

    return {
        "word_count": word_count,
        "character_count": char_count,
        "sentence_count": sentence_count,
        "paragraph_count": para_count
    }


def extract_tfidf_terms(text: str, sentences: List[str], top_n: int = 10) -> List[Dict[str, Any]]:
    """
    Extracts top TF-IDF terms (unigrams and meaningful bigrams) using scikit-learn.
    Ranks terms based on TF-IDF importance scores across the document.
    """
    corpus = sentences if len(sentences) >= 2 else [text]

    try:
        vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=50,
            token_pattern=r'(?u)\b[a-zA-Z]{3,}\b'  # words with at least 3 letters
        )
        tfidf_matrix = vectorizer.fit_transform(corpus)
        feature_names = vectorizer.get_feature_names_out()

        # Compute average score across sentences/document
        mean_scores = tfidf_matrix.mean(axis=0).A1
        scored_terms = sorted(
            zip(feature_names, mean_scores),
            key=lambda x: x[1],
            reverse=True
        )

        results = []
        for term, score in scored_terms[:top_n]:
            # Scale and round score to 2 decimal places
            norm_score = min(round(float(score) * 2.5, 2), 1.0)
            if norm_score > 0:
                results.append({"term": term, "score": norm_score})

        return results

    except Exception as e:
        print(f"[TF-IDF Error]: {e}")
        return []


def extract_keybert_phrases(text: str, top_n: int = 10) -> Dict[str, Any]:
    """
    Extracts keyphrases using KeyBERT.
    If KeyBERT is unavailable or encounters environment issues, provides a clean
    fallback using TF-IDF n-grams while indicating keybert_available: false.
    """
    kw_model = get_keybert_model()

    if kw_model is not None:
        try:
            raw_keywords = kw_model.extract_keywords(
                text,
                keyphrase_ngram_range=(1, 3),
                stop_words='english',
                use_maxsum=True,
                nr_candidates=20,
                top_n=top_n
            )
            phrases = [
                {"phrase": kw, "score": round(float(score), 2)}
                for kw, score in raw_keywords
            ]
            return {
                "keyphrases": phrases,
                "keybert_available": True,
                "model_name": "all-MiniLM-L6-v2"
            }
        except Exception as e:
            print(f"[KeyBERT Extraction Error]: {e}")

    # Clean fallback using TF-IDF n-grams (1-3 words)
    try:
        vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(2, 3),
            max_features=25
        )
        matrix = vectorizer.fit_transform([text])
        features = vectorizer.get_feature_names_out()
        scores = matrix.toarray()[0]
        scored_phrases = sorted(zip(features, scores), key=lambda x: x[1], reverse=True)
        fallback_phrases = [
            {"phrase": p, "score": round(float(s), 2)}
            for p, s in scored_phrases[:top_n]
        ]
        return {
            "keyphrases": fallback_phrases,
            "keybert_available": False,
            "notice": "KeyBERT neural model unavailable; extracted candidate phrases via TF-IDF n-grams."
        }
    except Exception:
        return {
            "keyphrases": [],
            "keybert_available": False,
            "notice": "KeyBERT unavailable."
        }


def extract_key_information(text: str) -> Dict[str, List[str]]:
    """
    Extracts deterministic structured information:
    - Numbers and currency
    - Dates
    - Percentages
    - Emails
    - URLs
    """
    # Emails
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
    emails = list(dict.fromkeys(re.findall(email_pattern, text)))

    # URLs (http/https/www)
    url_pattern = r'\b(?:https?://|www\.)[^\s/$.?#].[^\s]*\b'
    urls = list(dict.fromkeys(re.findall(url_pattern, text)))

    # Percentages (e.g., 25%, 99.9%, 100 percent)
    pct_pattern = r'(?:\d+(?:\.\d+)?\s*%(?!\w)|\b\d+(?:\.\d+)?\s*percent\b)'
    percentages = list(dict.fromkeys(re.findall(pct_pattern, text, flags=re.IGNORECASE)))

    # Dates (e.g. 2026-09-10, 10/09/2026, September 10, 2026, Oct 2025, 2020-2025)
    date_patterns = [
        r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[.,]?\s+\d{1,2}(?:st|nd|rd|th)?[.,]?\s+\d{4}\b',
        r'\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[.,]?\s+\d{4}\b',
        r'\b\d{4}-\d{2}-\d{2}\b',
        r'\b\d{1,2}/\d{1,2}/\d{2,4}\b'
    ]
    dates = []
    for dp in date_patterns:
        dates.extend(re.findall(dp, text, flags=re.IGNORECASE))
    dates = list(dict.fromkeys(dates))

    # Numbers and Currency (e.g., $50,000,000, $100M, 1,250, 42.5)
    num_pattern = r'(?:[\$€£¥₹]\s*\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:million|billion|trillion|\b[MBK]\b))?|\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b|\b\d+(?:\.\d+)?\s*(?:million|billion|trillion)\b)'
    raw_numbers = re.findall(num_pattern, text, flags=re.IGNORECASE)
    numbers = []
    for n in raw_numbers:
        n_clean = n.strip()
        if n_clean and n_clean not in numbers and n_clean not in dates and n_clean not in percentages:
            numbers.append(n_clean)

    return {
        "numbers": numbers[:15],
        "dates": dates[:10],
        "percentages": percentages[:10],
        "emails": emails[:10],
        "urls": urls[:10]
    }


def analyze_text(raw_text: str) -> Dict[str, Any]:
    """
    Orchestrates the Phase 3 NLP content analysis pipeline:
    1. Preprocessing and sentence segmentation
    2. Statistical profiling
    3. TF-IDF keyword extraction
    4. KeyBERT keyphrase extraction
    5. Deterministic key information extraction
    """
    if not raw_text or not raw_text.strip():
        raise ValueError("No text provided for analysis. Please provide non-empty document content.")

    clean_text = preprocess_for_nlp(raw_text)
    sentences = split_into_sentences(clean_text)

    # Calculate basic statistics
    stats = calculate_statistics(clean_text, sentences)

    if stats["word_count"] < 3:
        raise ValueError("Text is too short for meaningful NLP analysis (minimum 3 words required).")

    # Extract TF-IDF keywords
    tfidf_terms = extract_tfidf_terms(clean_text, sentences, top_n=10)

    # Extract KeyBERT keyphrases
    keybert_result = extract_keybert_phrases(clean_text, top_n=10)
    keyphrases = keybert_result.get("keyphrases", [])

    # Extract key information
    key_info = extract_key_information(clean_text)

    return {
        "word_count": stats["word_count"],
        "character_count": stats["character_count"],
        "sentence_count": stats["sentence_count"],
        "paragraph_count": stats["paragraph_count"],
        "statistics": stats,
        "keywords": tfidf_terms,
        "keyphrases": keyphrases,
        "tfidf_terms": tfidf_terms,
        "key_information": key_info,
        "keybert_available": keybert_result.get("keybert_available", True),
        "model_name": keybert_result.get("model_name", "TF-IDF N-grams Fallback")
    }
