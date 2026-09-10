import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Edit3, 
  Check, 
  Trash2, 
  Sparkles, 
  Copy, 
  CheckCheck,
  AlertCircle,
  FileSearch,
  Loader2
} from 'lucide-react';

export default function SourceContentPreview({ 
  extractedData, 
  onUpdateText, 
  onClearContent,
  onAnalyzeClick,
  isAnalyzing = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(extractedData?.text || '');
  const [copied, setCopied] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  useEffect(() => {
    setLocalText(extractedData?.text || '');
    setIsEditing(false);
  }, [extractedData]);

  if (!extractedData) {
    return (
      <div className="source-content-card empty-state-card">
        <div className="empty-state-icon-wrap">
          <FileSearch size={32} className="empty-icon" />
        </div>
        <h4 className="empty-state-title">No document uploaded</h4>
        <p className="empty-state-desc">
          Upload a PDF, TXT, or image file above to extract and review its source text.
        </p>
      </div>
    );
  }

  const handleSave = () => {
    setIsEditing(false);
    onUpdateText(localText);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2500);
  };

  const handleCopy = async () => {
    if (!localText) return;
    try {
      await navigator.clipboard.writeText(localText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const characterCount = localText.length;
  const wordCount = localText.trim() ? localText.trim().split(/\s+/).length : 0;
  const isImagePlaceholder = extractedData.file_type === 'image';

  return (
    <div className="source-content-card">
      {/* Header Bar */}
      <div className="source-content-header">
        <div className="source-meta-left">
          <div className="source-doc-badge">
            <FileText size={18} className="source-badge-icon" />
            <span className="source-filename" title={extractedData.filename}>
              {extractedData.filename}
            </span>
          </div>
          <span className="source-type-pill">
            {extractedData.file_type.toUpperCase()}
          </span>
          {extractedData.page_count && (
            <span className="source-pages-pill">
              {extractedData.page_count} {extractedData.page_count === 1 ? 'Page' : 'Pages'}
            </span>
          )}
          {extractedData.extracted_via_ocr && (
            <span className="source-ocr-pill" title="Text extracted using AI OCR">
              AI OCR
            </span>
          )}
          <span className="source-char-counter">
            <strong>{characterCount.toLocaleString()}</strong> chars • <strong>{wordCount.toLocaleString()}</strong> words
          </span>
        </div>

        {/* Action Toolbar */}
        <div className="source-toolbar-actions">
          {savedBadge && (
            <span className="save-indicator-badge">
              <Check size={14} /> Saved
            </span>
          )}

          {isEditing ? (
            <button 
              type="button" 
              className="btn-toolbar btn-toolbar-save"
              onClick={handleSave}
              title="Save edits"
            >
              <Check size={15} />
              <span>Save</span>
            </button>
          ) : (
            <button 
              type="button" 
              className="btn-toolbar btn-toolbar-edit"
              onClick={() => setIsEditing(true)}
              title="Edit extracted text"
            >
              <Edit3 size={15} />
              <span>Edit</span>
            </button>
          )}

          <button 
            type="button" 
            className="btn-toolbar"
            onClick={handleCopy}
            title="Copy text to clipboard"
            disabled={!localText}
          >
            {copied ? <CheckCheck size={15} className="copied-green" /> : <Copy size={15} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button 
            type="button" 
            className="btn-toolbar btn-toolbar-clear"
            onClick={onClearContent}
            title="Clear extracted content"
          >
            <Trash2 size={15} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Notice for Image, OCR, or Special message */}
      {extractedData.message && (
        <div className={`source-status-banner ${extractedData.extracted_via_ocr ? 'banner-ocr' : (isImagePlaceholder ? 'banner-info' : 'banner-subtle')}`}>
          <AlertCircle size={16} />
          <span>{extractedData.message}</span>
        </div>
      )}

      {/* Editor / Text View Area */}
      <div className="source-editor-wrapper">
        {isEditing ? (
          <textarea
            className="source-textarea"
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            placeholder="Edit or paste document text here..."
            rows={10}
            autoFocus
          />
        ) : (
          <div className="source-text-display">
            {localText ? (
              <pre className="extracted-pre-content">{localText}</pre>
            ) : (
              <div className="no-text-notice-box">
                <p className="no-text-message">
                  {extractedData.is_scanned
                    ? "This PDF is a scanned or image-based document with no selectable text. Add GEMINI_API_KEY in backend/.env for AI OCR transcription, or click 'Edit' above to enter text manually."
                    : (isImagePlaceholder
                        ? "Image uploaded. Add GEMINI_API_KEY in backend/.env for AI OCR transcription, or click 'Edit' to enter text."
                        : "No readable text extracted from this document. Click 'Edit' above to enter text manually.")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with Analyze Content Action */}
      <div className="source-content-footer">
        <div className="footer-status-label">
          {isEditing ? (
            <span className="editing-status-dot">Editing mode enabled — click Save when finished</span>
          ) : (
            <span>Source text ready for analysis</span>
          )}
        </div>

        <button 
          type="button" 
          className="btn-analyze-content"
          onClick={() => onAnalyzeClick(localText)}
          id="btn-analyze-content"
          disabled={isAnalyzing || !localText.trim()}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="spinner-icon-sm" />
              <span>Analyzing content...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} className="sparkle-spin" />
              <span>Analyze Content</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
