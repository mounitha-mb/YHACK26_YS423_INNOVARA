import re

def clean_extracted_text(text: str) -> str:
    """
    Cleans and normalizes extracted text:
    - Normalizes line breaks
    - Collapses multiple whitespace characters within lines
    - Removes excessive blank lines (max 2 consecutive newlines)
    - Strips leading and trailing whitespace
    """
    if not text:
        return ""

    # Replace carriage returns
    normalized = text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Replace non-breaking spaces and irregular tabs
    normalized = normalized.replace('\u00a0', ' ').replace('\t', '    ')

    # Collapse multiple horizontal spaces on each line
    lines = [re.sub(r'[ ]{2,}', ' ', line).strip() for line in normalized.split('\n')]
    
    # Reassemble with max 2 consecutive newlines
    result_lines = []
    blank_count = 0
    for line in lines:
        if not line:
            blank_count += 1
            if blank_count <= 1:
                result_lines.append("")
        else:
            blank_count = 0
            result_lines.append(line)

    return '\n'.join(result_lines).strip()
