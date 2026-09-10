import React, { useState } from 'react';
import { 
  FileText, 
  BookOpen, 
  HelpCircle, 
  Image as ImageIcon, 
  FileCheck, 
  Presentation, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  RotateCcw,
  Layers,
  MessageSquare,
  CreditCard,
  Video,
  Share2,
  Megaphone,
  Gift,
  RotateCw,
  Play,
  Film,
  Clock,
  Send,
  Hash,
  Mail,
  Globe,
  Grid,
  Square,
  Volume2
} from 'lucide-react';
import { getDownloadUrl } from '../services/api';

export default function GeneratedResults({ results, activeFormat, onSelectFormat, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  
  // MCQ Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionIdx]: selectedOptionLetter }
  const [showAllExplanations, setShowAllExplanations] = useState(false);

  // Presentation State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);

  // Flashcards State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [flashcardViewMode, setFlashcardViewMode] = useState('card'); // 'card' | 'grid'

  // Social Media State
  const [activeSocialPlatform, setActiveSocialPlatform] = useState('twitter'); // 'twitter' | 'linkedin' | 'instagram' | 'facebook'

  // Promotional State
  const [activePromoTab, setActivePromoTab] = useState('email'); // 'email' | 'press'

  if (!results || Object.keys(results).length === 0) {
    return null;
  }

  const formatList = Object.keys(results);
  const currentFormat = activeFormat && results[activeFormat] ? activeFormat : formatList[0];
  const formatData = results[currentFormat]?.content || {};
  const isFallback = results[currentFormat]?.status === 'fallback';

  // Copy helper
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct download helper from base64 or URL
  const triggerFileDownload = (base64Data, filename, mimeType, fileId) => {
    if (base64Data) {
      const link = document.createElement('a');
      link.href = `data:${mimeType};base64,${base64Data}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (fileId) {
      window.open(getDownloadUrl(fileId), '_blank');
    }
  };

  // MCQ answer selection
  const handleAnswerSelect = (qIdx, letter) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: letter,
    }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowAllExplanations(false);
  };

  // Get format display metadata
  const getFormatMeta = (fmt) => {
    switch (fmt) {
      case 'summary':
        return { label: 'Summary', icon: FileText, color: '#4f46e5' };
      case 'blog':
        return { label: 'Blog Post', icon: BookOpen, color: '#0891b2' };
      case 'mcq':
        return { label: 'MCQ Quiz', icon: HelpCircle, color: '#7c3aed' };
      case 'image':
        return { label: 'AI Image', icon: ImageIcon, color: '#ea580c' };
      case 'doc':
        return { label: 'DOC (.docx)', icon: FileCheck, color: '#2563eb' };
      case 'presentation':
        return { label: 'Presentation (.pptx)', icon: Presentation, color: '#d97706' };
      case 'flashcards':
        return { label: 'Flashcards', icon: CreditCard, color: '#059669' };
      case 'video':
        return { label: 'Video Script', icon: Video, color: '#dc2626' };
      case 'social_media':
        return { label: 'Social Media', icon: Share2, color: '#0284c7' };
      case 'advertisement':
        return { label: 'Advertisement', icon: Megaphone, color: '#9333ea' };
      case 'promotional':
        return { label: 'Promotional', icon: Gift, color: '#be185d' };
      default:
        return { label: fmt.toUpperCase(), icon: Layers, color: '#4f46e5' };
    }
  };

  return (
    <div className="generated-results-container" id="generated-results-anchor">
      {/* Header & Format Tabs */}
      <div className="results-header-wrapper">
        <div className="results-header-left">
          <div className="results-badge-row">
            <span className="results-main-badge">
              <Sparkles size={14} className="sparkle-icon" />
              Phase 5 Transformed Content
            </span>
            {isFallback ? (
              <span className="results-status-pill status-fallback">
                Source Factual Analysis
              </span>
            ) : (
              <span className="results-status-pill status-gemini">
                Gemini AI Engine
              </span>
            )}
          </div>
          <h2 className="results-title">Generated Multi-Format Assets</h2>
        </div>

        {/* Multi-Format Switcher Tabs */}
        {formatList.length > 1 && (
          <div className="results-format-tabs" role="tablist">
            {formatList.map((fmt) => {
              const meta = getFormatMeta(fmt);
              const Icon = meta.icon;
              const isActive = fmt === currentFormat;

              return (
                <button
                  key={fmt}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`results-tab-btn ${isActive ? 'tab-btn-active' : ''}`}
                  onClick={() => onSelectFormat(fmt)}
                >
                  <Icon size={16} />
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Format Display Area */}
      <div className="results-content-card">
        {/* ===================================================================
            1. SUMMARY VIEW
            =================================================================== */}
        {currentFormat === 'summary' && (
          <div className="summary-view-wrapper">
            <div className="result-view-toolbar">
              <div className="toolbar-info">
                <FileText size={18} className="toolbar-icon" />
                <span className="toolbar-title">{formatData.title || 'Executive Summary'}</span>
              </div>
              <button
                type="button"
                className="btn-action-ghost"
                onClick={() => handleCopyText(`${formatData.title}\n\n${formatData.summary}\n\nHighlights:\n${(formatData.highlights || []).join('\n')}`)}
              >
                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>
            </div>

            {/* Highlights Grid */}
            {formatData.highlights && formatData.highlights.length > 0 && (
              <div className="highlights-section">
                <h4 className="sub-block-title">Key Highlights</h4>
                <div className="highlights-grid">
                  {formatData.highlights.map((item, idx) => (
                    <div key={idx} className="highlight-item-card">
                      <CheckCircle2 size={16} className="highlight-check-icon" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Executive Summary Body */}
            <div className="summary-text-block">
              <h4 className="sub-block-title">Executive Briefing Digest</h4>
              <p className="summary-paragraph">{formatData.summary}</p>
            </div>

            {/* Key Takeaways */}
            {formatData.key_takeaways && formatData.key_takeaways.length > 0 && (
              <div className="takeaways-box">
                <h4 className="takeaways-title">Strategic Takeaways</h4>
                <ul className="takeaways-list">
                  {formatData.key_takeaways.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            2. BLOG VIEW
            =================================================================== */}
        {currentFormat === 'blog' && (
          <div className="blog-view-wrapper">
            <div className="result-view-toolbar">
              <div className="toolbar-info">
                <BookOpen size={18} className="toolbar-icon" />
                <span className="toolbar-title">Blog Post Publication</span>
              </div>
              <button
                type="button"
                className="btn-action-ghost"
                onClick={() => {
                  const fullText = `${formatData.title}\n\n${formatData.introduction}\n\n` +
                    (formatData.sections || []).map((s) => `## ${s.heading}\n${s.content}`).join('\n\n') +
                    `\n\n## Conclusion\n${formatData.conclusion}`;
                  handleCopyText(fullText);
                }}
              >
                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                <span>{copied ? 'Copied Full Blog!' : 'Copy Article'}</span>
              </button>
            </div>

            <article className="blog-article-container">
              <header className="blog-article-header">
                <div className="blog-meta-tags">
                  <span className="blog-read-time-pill">{formatData.read_time || '4 min read'}</span>
                  {(formatData.tags || []).map((tag, idx) => (
                    <span key={idx} className="blog-tag-pill">#{tag}</span>
                  ))}
                </div>
                <h1 className="blog-article-title">{formatData.title}</h1>
              </header>

              <div className="blog-intro-block">
                <p>{formatData.introduction}</p>
              </div>

              <div className="blog-sections-flow">
                {(formatData.sections || []).map((sec, idx) => (
                  <div key={idx} className="blog-section-card">
                    <h3 className="blog-section-heading">{sec.heading}</h3>
                    <p className="blog-section-content">{sec.content}</p>
                  </div>
                ))}
              </div>

              {formatData.conclusion && (
                <div className="blog-conclusion-block">
                  <h4 className="conclusion-heading">Final Thoughts</h4>
                  <p>{formatData.conclusion}</p>
                </div>
              )}
            </article>
          </div>
        )}

        {/* ===================================================================
            3. MCQ VIEW
            =================================================================== */}
        {currentFormat === 'mcq' && (
          <div className="mcq-view-wrapper">
            <div className="result-view-toolbar">
              <div className="toolbar-info">
                <HelpCircle size={18} className="toolbar-icon" />
                <span className="toolbar-title">{formatData.quiz_title || 'Knowledge Assessment'}</span>
              </div>
              <div className="toolbar-actions">
                <button
                  type="button"
                  className="btn-action-ghost"
                  onClick={() => setShowAllExplanations(!showAllExplanations)}
                >
                  <Eye size={16} />
                  <span>{showAllExplanations ? 'Hide Explanations' : 'Show All Explanations'}</span>
                </button>
                <button
                  type="button"
                  className="btn-action-ghost"
                  onClick={handleResetQuiz}
                >
                  <RotateCcw size={16} />
                  <span>Reset Quiz</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="mcq-questions-list">
              {(formatData.questions || []).map((q, qIdx) => {
                const userChoice = selectedAnswers[qIdx];
                const hasAnswered = userChoice !== undefined;
                const correctLetter = (q.correct_answer || 'A').toUpperCase().trim();
                const isCorrect = userChoice === correctLetter;

                return (
                  <div key={qIdx} className="mcq-question-card">
                    <div className="question-header">
                      <span className="question-number-badge">Q{qIdx + 1}</span>
                      <h3 className="question-prompt">{q.question}</h3>
                    </div>

                    {/* 4 Options Grid */}
                    <div className="mcq-options-grid">
                      {(q.options || []).map((opt, optIdx) => {
                        const optLetter = opt.substring(0, 1).toUpperCase();
                        const isSelected = userChoice === optLetter;
                        const isThisOptionCorrect = optLetter === correctLetter;

                        let optClass = 'mcq-option-btn';
                        if (hasAnswered) {
                          if (isSelected) {
                            optClass += isCorrect ? ' option-correct' : ' option-wrong';
                          } else if (isThisOptionCorrect) {
                            optClass += ' option-revealed-correct';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            className={optClass}
                            onClick={() => handleAnswerSelect(qIdx, optLetter)}
                            disabled={hasAnswered}
                          >
                            <span className="option-letter-badge">{optLetter}</span>
                            <span className="option-text">{opt.replace(/^[A-Da-d]\)\s*/, '')}</span>
                            {hasAnswered && isSelected && (
                              isCorrect ? (
                                <CheckCircle2 size={18} className="option-status-icon text-success" />
                              ) : (
                                <XCircle size={18} className="option-status-icon text-danger" />
                              )
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {(hasAnswered || showAllExplanations) && (
                      <div className={`mcq-explanation-box ${hasAnswered && isCorrect ? 'exp-success' : 'exp-default'}`}>
                        <div className="explanation-header">
                          <span className="answer-key-pill">Correct Answer: Option {correctLetter}</span>
                          {hasAnswered && (
                            <span className={`result-tag ${isCorrect ? 'tag-correct' : 'tag-incorrect'}`}>
                              {isCorrect ? 'Correct! Well done.' : 'Incorrect Choice'}
                            </span>
                          )}
                        </div>
                        <p className="explanation-text">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================
            4. IMAGE VIEW
            =================================================================== */}
        {currentFormat === 'image' && (
          <div className="image-view-wrapper">
            <div className="result-view-toolbar">
              <div className="toolbar-info">
                <ImageIcon size={18} className="toolbar-icon" />
                <span className="toolbar-title">AI Generated Visual Concept</span>
              </div>
              <div className="toolbar-actions">
                <button
                  type="button"
                  className="btn-action-ghost"
                  onClick={() => handleCopyText(formatData.image_prompt || '')}
                >
                  {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied Prompt!' : 'Copy Prompt'}</span>
                </button>
                {formatData.image_url && (
                  <a
                    href={formatData.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action-primary"
                    download="ContentForge_Generated_Image.png"
                  >
                    <Download size={16} />
                    <span>Download Image</span>
                  </a>
                )}
              </div>
            </div>

            <div className="image-preview-layout">
              {/* Generated Image Canvas */}
              <div className="image-canvas-container">
                <img
                  src={formatData.image_url}
                  alt={formatData.description || 'AI Visual Concept'}
                  className="generated-preview-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.image-error-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="image-error-fallback" style={{ display: 'none' }}>
                  <ImageIcon size={48} className="text-muted" />
                  <p>Generating high resolution visual render...</p>
                  <a href={formatData.image_url} target="_blank" rel="noreferrer" className="btn-action-ghost">
                    Open Full Resolution
                  </a>
                </div>
              </div>

              {/* Prompt Inspector Panel */}
              <div className="image-details-panel">
                <div className="panel-badge-row">
                  <span className="style-badge">{formatData.style || 'Cinematic Digital Art'}</span>
                  <span className="ratio-badge">{formatData.aspect_ratio || '16:9'}</span>
                </div>

                <div className="prompt-display-card">
                  <h4 className="prompt-card-label">Optimized Diffusion Prompt</h4>
                  <p className="prompt-card-text">{formatData.image_prompt}</p>
                </div>

                {formatData.description && (
                  <div className="concept-rationale-card">
                    <h4 className="prompt-card-label">Visual Concept Rationale</h4>
                    <p className="concept-rationale-text">{formatData.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            5. DOC VIEW (.docx)
            =================================================================== */}
        {currentFormat === 'doc' && (
          <div className="doc-view-wrapper">
            <div className="result-view-toolbar">
              <div className="toolbar-info">
                <FileCheck size={18} className="toolbar-icon" />
                <span className="toolbar-title">{formatData.document_title || 'Executive Word Document'}</span>
              </div>
              <button
                type="button"
                className="btn-download-primary"
                onClick={() => triggerFileDownload(
                  formatData.file_base64,
                  formatData.filename || 'ContentForge_Document.docx',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  formatData.file_id
                )}
              >
                <Download size={18} />
                <span>Download .docx Document</span>
              </button>
            </div>

            {/* Document Preview Card */}
            <div className="doc-preview-card">
              <div className="doc-sheet">
                <div className="doc-sheet-header">
                  <span className="doc-format-stamp">MICROSOFT WORD (.DOCX)</span>
                  <h1 className="doc-sheet-title">{formatData.document_title}</h1>
                  <p className="doc-sheet-subtitle">{formatData.subtitle || 'Comprehensive Briefing & Strategic Overview'}</p>
                  <hr className="doc-sheet-divider" />
                </div>

                {formatData.executive_summary && (
                  <div className="doc-sheet-section">
                    <h2 className="doc-sheet-h1">Executive Overview</h2>
                    <p className="doc-sheet-p">{formatData.executive_summary}</p>
                  </div>
                )}

                {(formatData.sections || []).map((sec, idx) => (
                  <div key={idx} className="doc-sheet-section">
                    <h3 className="doc-sheet-h2">{sec.heading}</h3>
                    {(sec.paragraphs || []).map((para, pIdx) => (
                      <p key={pIdx} className="doc-sheet-p">{para}</p>
                    ))}
                    {(sec.bullet_points || []).length > 0 && (
                      <ul className="doc-sheet-ul">
                        {sec.bullet_points.map((bp, bIdx) => (
                          <li key={bIdx}>{bp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {(formatData.recommendations || []).length > 0 && (
                  <div className="doc-sheet-section">
                    <h2 className="doc-sheet-h1">Strategic Recommendations</h2>
                    <ul className="doc-sheet-ul">
                      {formatData.recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Quick Actions Footer */}
              <div className="doc-preview-footer">
                <div className="doc-meta-info">
                  <span>File: <strong>{formatData.filename}</strong></span>
                  {formatData.file_size_bytes && (
                    <span> • Size: <strong>{(formatData.file_size_bytes / 1024).toFixed(1)} KB</strong></span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-download-primary"
                  onClick={() => triggerFileDownload(
                    formatData.file_base64,
                    formatData.filename || 'ContentForge_Document.docx',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    formatData.file_id
                  )}
                >
                  <Download size={16} />
                  <span>Download .docx File</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            6. PRESENTATION VIEW (.pptx)
            =================================================================== */}
        {currentFormat === 'presentation' && (
          <div className="presentation-view-wrapper">
            <div className="result-view-toolbar">
              <div className="toolbar-info">
                <Presentation size={18} className="toolbar-icon" />
                <span className="toolbar-title">{formatData.presentation_title || 'Slide Deck'}</span>
                <span className="slide-count-pill">{formatData.slide_count || (formatData.slides || []).length} Slides</span>
              </div>
              <div className="toolbar-actions">
                <button
                  type="button"
                  className="btn-action-ghost"
                  onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                >
                  <MessageSquare size={16} />
                  <span>{showSpeakerNotes ? 'Hide Notes' : 'Speaker Notes'}</span>
                </button>
                <button
                  type="button"
                  className="btn-download-primary"
                  onClick={() => triggerFileDownload(
                    formatData.file_base64,
                    formatData.filename || 'ContentForge_Presentation.pptx',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    formatData.file_id
                  )}
                >
                  <Download size={18} />
                  <span>Download .pptx Presentation</span>
                </button>
              </div>
            </div>

            {/* Interactive Slide Viewer */}
            {formatData.slides && formatData.slides.length > 0 && (
              <div className="presentation-interactive-viewer">
                {/* 16:9 Slide Canvas Viewport */}
                {(() => {
                  const activeSlide = formatData.slides[currentSlideIndex] || formatData.slides[0];
                  const isTitle = currentSlideIndex === 0;

                  return (
                    <div className="slide-canvas-viewport">
                      <div className={`slide-canvas-card ${isTitle ? 'slide-canvas-title-layout' : ''}`}>
                        <div className="slide-accent-bar"></div>
                        <div className="slide-content-area">
                          <div className="slide-top-meta">
                            <span className="slide-index-tag">
                              SLIDE {currentSlideIndex + 1} OF {formatData.slides.length}
                            </span>
                          </div>

                          <h2 className={isTitle ? 'slide-hero-title' : 'slide-section-title'}>
                            {activeSlide.title}
                          </h2>

                          {activeSlide.subtitle && (
                            <p className="slide-hero-subtitle">{activeSlide.subtitle}</p>
                          )}

                          {activeSlide.bullets && activeSlide.bullets.length > 0 && (
                            <ul className="slide-bullets-list">
                              {activeSlide.bullets.map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="slide-canvas-footer">
                          <span>ContentForge AI Executive Deck</span>
                          <span>16:9 Widescreen</span>
                        </div>
                      </div>

                      {/* Speaker Notes Expandable Drawer */}
                      {showSpeakerNotes && activeSlide.notes && (
                        <div className="slide-notes-drawer">
                          <div className="notes-header">
                            <MessageSquare size={14} />
                            <span>Speaker Notes for Slide {currentSlideIndex + 1}</span>
                          </div>
                          <p className="notes-text">{activeSlide.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Slide Navigation Controls */}
                <div className="slide-carousel-controls">
                  <button
                    type="button"
                    className="slide-nav-arrow"
                    disabled={currentSlideIndex === 0}
                    onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="slide-thumbnails-strip">
                    {formatData.slides.map((s, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        className={`slide-thumb-pill ${sIdx === currentSlideIndex ? 'thumb-pill-active' : ''}`}
                        onClick={() => setCurrentSlideIndex(sIdx)}
                      >
                        Slide {sIdx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="slide-nav-arrow"
                    disabled={currentSlideIndex === formatData.slides.length - 1}
                    onClick={() => setCurrentSlideIndex((prev) => Math.min(formatData.slides.length - 1, prev + 1))}
                    aria-label="Next slide"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            Format 7: FLASHCARDS
            =================================================================== */}
        {currentFormat === 'flashcards' && (
          <div className="format-result-view flashcards-result-view">
            {/* Toolbar */}
            <div className="format-view-toolbar">
              <div className="toolbar-left">
                <span className="format-type-pill" style={{ backgroundColor: '#05966915', color: '#059669' }}>
                  <CreditCard size={14} />
                  Study Deck
                </span>
                <span className="format-meta-detail">
                  {formatData.cards?.length || 0} Flashcards • {formatData.deck_title || 'Study Session'}
                </span>
              </div>

              <div className="toolbar-actions">
                <div className="view-mode-toggle">
                  <button
                    type="button"
                    className={`btn-mode-pill ${flashcardViewMode === 'card' ? 'mode-active' : ''}`}
                    onClick={() => setFlashcardViewMode('card')}
                    title="Interactive Single Card"
                  >
                    <Square size={14} />
                    <span>Card View</span>
                  </button>
                  <button
                    type="button"
                    className={`btn-mode-pill ${flashcardViewMode === 'grid' ? 'mode-active' : ''}`}
                    onClick={() => setFlashcardViewMode('grid')}
                    title="Deck Grid Overview"
                  >
                    <Grid size={14} />
                    <span>Grid View</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-toolbar-action"
                  onClick={() => {
                    const text = (formatData.cards || [])
                      .map((c, i) => `Card ${i + 1} [${c.category || 'Concept'}]:\nQ: ${c.front}\nA: ${c.back}`)
                      .join('\n\n');
                    handleCopyText(text);
                  }}
                  title="Copy all cards to clipboard"
                >
                  {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied' : 'Copy All'}</span>
                </button>

                {onRegenerate && (
                  <button type="button" className="btn-toolbar-action" onClick={onRegenerate} title="Regenerate flashcards">
                    <RotateCcw size={15} />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content Body */}
            {(!formatData.cards || formatData.cards.length === 0) ? (
              <p className="no-content-notice">No flashcards were generated.</p>
            ) : flashcardViewMode === 'card' ? (
              /* Single Card Interactive View */
              <div className="flashcard-interactive-container">
                {(() => {
                  const card = formatData.cards[currentCardIndex] || formatData.cards[0];
                  return (
                    <div className="flashcard-scene">
                      <div 
                        className={`flashcard-3d ${isCardFlipped ? 'is-flipped' : ''}`}
                        onClick={() => setIsCardFlipped((v) => !v)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsCardFlipped((v) => !v); } }}
                        aria-label="Click to flip card"
                      >
                        {/* Front Side */}
                        <div className="flashcard-face flashcard-front">
                          <div className="card-face-header">
                            <span className="card-cat-badge">{card.category || 'Term / Question'}</span>
                            <span className="card-index-indicator">Card {currentCardIndex + 1} of {formatData.cards.length}</span>
                          </div>
                          <div className="card-face-body">
                            <h3 className="card-prompt-text">{card.front}</h3>
                          </div>
                          <div className="card-face-footer">
                            <RotateCw size={14} className="flip-hint-icon" />
                            <span>Click card or press Space to reveal answer</span>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="flashcard-face flashcard-back">
                          <div className="card-face-header">
                            <span className="card-cat-badge back-cat-badge">Answer / Explanation</span>
                            <span className="card-index-indicator">Card {currentCardIndex + 1} of {formatData.cards.length}</span>
                          </div>
                          <div className="card-face-body">
                            <p className="card-answer-text">{card.back}</p>
                          </div>
                          <div className="card-face-footer">
                            <RotateCw size={14} className="flip-hint-icon" />
                            <span>Click card to flip back to question</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Card Controls */}
                <div className="flashcard-controls-bar">
                  <button
                    type="button"
                    className="btn-card-nav"
                    disabled={currentCardIndex === 0}
                    onClick={() => {
                      setIsCardFlipped(false);
                      setCurrentCardIndex((i) => Math.max(0, i - 1));
                    }}
                  >
                    <ChevronLeft size={18} />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    className="btn-flip-trigger"
                    onClick={() => setIsCardFlipped((v) => !v)}
                  >
                    <RotateCw size={16} />
                    <span>{isCardFlipped ? 'Show Question' : 'Flip for Answer'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-card-nav"
                    disabled={currentCardIndex === formatData.cards.length - 1}
                    onClick={() => {
                      setIsCardFlipped(false);
                      setCurrentCardIndex((i) => Math.min(formatData.cards.length - 1, i + 1));
                    }}
                  >
                    <span>Next</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ) : (
              /* Grid Overview View */
              <div className="flashcards-grid-overview">
                {formatData.cards.map((c, cIdx) => (
                  <div key={cIdx} className="flashcard-grid-item">
                    <div className="grid-item-header">
                      <span className="grid-item-badge">#{cIdx + 1} • {c.category || 'Concept'}</span>
                    </div>
                    <div className="grid-item-front">
                      <strong>Q:</strong> {c.front}
                    </div>
                    <div className="grid-item-divider"></div>
                    <div className="grid-item-back">
                      <strong>A:</strong> {c.back}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            Format 8: VIDEO SCRIPT & SCENE STORYBOARD
            =================================================================== */}
        {currentFormat === 'video' && (
          <div className="format-result-view video-result-view">
            {/* Toolbar */}
            <div className="format-view-toolbar">
              <div className="toolbar-left">
                <span className="format-type-pill" style={{ backgroundColor: '#dc262615', color: '#dc2626' }}>
                  <Video size={14} />
                  Video Production Script
                </span>
                <span className="format-meta-detail">
                  {formatData.style || 'Explainer'} • {formatData.duration_estimate || '3-5 mins'} • {formatData.scenes?.length || 0} Scenes
                </span>
              </div>

              <div className="toolbar-actions">
                <button
                  type="button"
                  className="btn-toolbar-action"
                  onClick={() => {
                    const scenesText = (formatData.scenes || [])
                      .map((s) => `[SCENE ${s.scene_number}: ${s.title} (${s.duration || '30s'})]\nVISUAL: ${s.visual_direction}\nNARRATION: "${s.narration}"`)
                      .join('\n\n');
                    const fullText = `VIDEO TITLE: ${formatData.video_title}\nSTYLE: ${formatData.style} (${formatData.duration_estimate})\nHOOK: ${formatData.hook}\n\n${scenesText}\n\nCALL TO ACTION: ${formatData.call_to_action}`;
                    handleCopyText(fullText);
                  }}
                  title="Copy full video script to clipboard"
                >
                  {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied Script' : 'Copy Full Script'}</span>
                </button>

                {onRegenerate && (
                  <button type="button" className="btn-toolbar-action" onClick={onRegenerate} title="Regenerate video script">
                    <RotateCcw size={15} />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>
            </div>

            {/* Video Meta Header */}
            <div className="video-script-meta-box">
              <div className="video-title-row">
                <div className="video-icon-badge">
                  <Film size={22} />
                </div>
                <div>
                  <h2 className="video-title-text">{formatData.video_title || 'Video Script Overview'}</h2>
                  <div className="video-badges-row">
                    <span className="video-badge-pill style-pill">{formatData.style || 'Documentary / Explainer'}</span>
                    <span className="video-badge-pill duration-pill">
                      <Clock size={13} />
                      {formatData.duration_estimate || '3-4 mins'}
                    </span>
                    <span className="video-badge-pill scenes-pill">{formatData.scenes?.length || 0} Storyboard Scenes</span>
                  </div>
                </div>
              </div>

              {formatData.hook && (
                <div className="video-hook-callout">
                  <span className="hook-label">10-Second Attention Hook</span>
                  <p className="hook-quote">"{formatData.hook}"</p>
                </div>
              )}
            </div>

            {/* Storyboard Scene Cards */}
            <div className="video-scenes-list">
              <div className="scenes-section-title">
                <Clapperboard size={18} />
                <h3>Scene-by-Scene Storyboard</h3>
              </div>

              {(formatData.scenes || []).map((scene, sIdx) => (
                <div key={sIdx} className="scene-card">
                  <div className="scene-card-header">
                    <div className="scene-number-badge">Scene {scene.scene_number || sIdx + 1}</div>
                    <h4 className="scene-title">{scene.title || `Sequence ${sIdx + 1}`}</h4>
                    {scene.duration && <span className="scene-duration-pill">{scene.duration}</span>}
                  </div>

                  <div className="scene-columns-grid">
                    {/* Left: Visual Direction */}
                    <div className="scene-column visual-column">
                      <div className="column-label">
                        <ImageIcon size={14} />
                        <span>Visual Direction & Camera Cues</span>
                      </div>
                      <p className="scene-text visual-text">{scene.visual_direction}</p>
                    </div>

                    {/* Right: Audio Narration */}
                    <div className="scene-column audio-column">
                      <div className="column-label">
                        <Volume2 size={14} />
                        <span>Audio & Narration Voiceover</span>
                      </div>
                      <p className="scene-text narration-text">"{scene.narration}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Closing CTA */}
            {formatData.call_to_action && (
              <div className="video-cta-card">
                <div className="cta-icon-box">
                  <Send size={18} />
                </div>
                <div>
                  <span className="cta-card-label">Closing Call-to-Action</span>
                  <p className="cta-card-text">"{formatData.call_to_action}"</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            Format 9: SOCIAL MEDIA SUITE
            =================================================================== */}
        {currentFormat === 'social_media' && (
          <div className="format-result-view social-result-view">
            {/* Toolbar */}
            <div className="format-view-toolbar">
              <div className="toolbar-left">
                <span className="format-type-pill" style={{ backgroundColor: '#0284c715', color: '#0284c7' }}>
                  <Share2 size={14} />
                  Social Media Suite
                </span>
                <span className="format-meta-detail">
                  Topic: {formatData.topic || 'Document Summary'} • 4 Platforms
                </span>
              </div>

              <div className="toolbar-actions">
                <button
                  type="button"
                  className="btn-toolbar-action"
                  onClick={() => {
                    const p = formatData.platforms || {};
                    const text = [
                      `=== TWITTER / X ===\n${p.twitter?.post || ''}\n${(p.twitter?.hashtags || []).join(' ')}`,
                      `=== LINKEDIN ===\n${p.linkedin?.post || ''}\n${(p.linkedin?.hashtags || []).join(' ')}`,
                      `=== INSTAGRAM ===\n${p.instagram?.caption || ''}\n${(p.instagram?.hashtags || []).join(' ')}`,
                      `=== FACEBOOK ===\n${p.facebook?.post || ''}\n${(p.facebook?.hashtags || []).join(' ')}`,
                    ].join('\n\n');
                    handleCopyText(text);
                  }}
                  title="Copy all platform posts"
                >
                  {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied All' : 'Copy All'}</span>
                </button>

                {onRegenerate && (
                  <button type="button" className="btn-toolbar-action" onClick={onRegenerate} title="Regenerate social posts">
                    <RotateCcw size={15} />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>
            </div>

            {/* Platform Selector Tabs */}
            <div className="social-platform-tabs" role="tablist">
              {[
                { id: 'twitter', label: 'Twitter / X', icon: Hash, color: '#1da1f2' },
                { id: 'linkedin', label: 'LinkedIn', icon: Share2, color: '#0a66c2' },
                { id: 'instagram', label: 'Instagram', icon: ImageIcon, color: '#e1306c' },
                { id: 'facebook', label: 'Facebook', icon: Globe, color: '#1877f2' },
              ].map((p) => {
                const Icon = p.icon;
                const isActive = activeSocialPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`social-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveSocialPlatform(p.id)}
                  >
                    <Icon size={16} style={{ color: isActive ? '#ffffff' : p.color }} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Platform Card */}
            {(() => {
              const platforms = formatData.platforms || {};
              const currentPost = platforms[activeSocialPlatform] || {};
              const postContent = currentPost.post || currentPost.caption || '';
              const hashtags = currentPost.hashtags || [];

              return (
                <div className={`social-post-card platform-${activeSocialPlatform}`}>
                  <div className="post-card-top">
                    <div className="post-author-row">
                      <div className="author-avatar-circle">
                        <Sparkles size={16} />
                      </div>
                      <div className="author-details">
                        <span className="author-name">ContentForge AI</span>
                        <span className="author-handle">@{activeSocialPlatform}_post • Just now</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-copy-single-post"
                      onClick={() => {
                        const copyStr = `${postContent}\n\n${hashtags.join(' ')}`;
                        handleCopyText(copyStr);
                      }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? 'Copied' : `Copy for ${activeSocialPlatform.toUpperCase()}`}</span>
                    </button>
                  </div>

                  <div className="post-card-body">
                    <p className="social-text-content">{postContent}</p>

                    {hashtags.length > 0 && (
                      <div className="social-hashtags-row">
                        {hashtags.map((tag, tIdx) => (
                          <span key={tIdx} className="hashtag-pill">{tag.startsWith('#') ? tag : `#${tag}`}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="post-card-footer">
                    <span className="char-count-pill">
                      {postContent.length} characters
                      {activeSocialPlatform === 'twitter' && ` / 280`}
                    </span>
                    <span className="platform-hint">Platform optimized for {activeSocialPlatform} engagement</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ===================================================================
            Format 10: ADVERTISEMENT
            =================================================================== */}
        {currentFormat === 'advertisement' && (
          <div className="format-result-view ad-result-view">
            {/* Toolbar */}
            <div className="format-view-toolbar">
              <div className="toolbar-left">
                <span className="format-type-pill" style={{ backgroundColor: '#9333ea15', color: '#9333ea' }}>
                  <Megaphone size={14} />
                  Advertising Suite
                </span>
                <span className="format-meta-detail">
                  Product/Subject: {formatData.product_service || 'Solution'} • Multichannel Copy
                </span>
              </div>

              <div className="toolbar-actions">
                <button
                  type="button"
                  className="btn-toolbar-action"
                  onClick={() => {
                    const text = [
                      `TAGLINE: ${formatData.tagline}`,
                      `HEADLINE: ${formatData.headline}`,
                      `SUBHEADLINE: ${formatData.subheadline}`,
                      `BODY: ${formatData.body_copy}`,
                      `CTA: ${formatData.call_to_action}`,
                      `GOOGLE AD: ${formatData.google_ad?.headline_1} | ${formatData.google_ad?.headline_2}\n${formatData.google_ad?.description}`,
                      `BENEFITS:\n${(formatData.key_benefits || []).map((b) => `- ${b}`).join('\n')}`
                    ].join('\n\n');
                    handleCopyText(text);
                  }}
                  title="Copy full advertisement suite"
                >
                  {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied' : 'Copy All Ad Copy'}</span>
                </button>

                {onRegenerate && (
                  <button type="button" className="btn-toolbar-action" onClick={onRegenerate} title="Regenerate ad copy">
                    <RotateCcw size={15} />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tagline Banner */}
            {formatData.tagline && (
              <div className="ad-tagline-strip">
                <span className="tagline-pill">TAGLINE</span>
                <h3 className="tagline-text">"{formatData.tagline}"</h3>
              </div>
            )}

            {/* Hero Ad Copy Card */}
            <div className="ad-card-main">
              <div className="ad-main-header">
                <span className="ad-type-label">Core Campaign Pitch</span>
                <h2 className="ad-headline">{formatData.headline || 'Transform Your Workflow'}</h2>
                {formatData.subheadline && <h4 className="ad-subheadline">{formatData.subheadline}</h4>}
              </div>

              <p className="ad-body-copy">{formatData.body_copy}</p>

              {formatData.call_to_action && (
                <div className="ad-cta-row">
                  <button type="button" className="ad-simulated-button">
                    <span>{formatData.call_to_action}</span>
                    <ArrowRight size={16} />
                  </button>
                  <span className="cta-helper-text">Optimized conversion trigger</span>
                </div>
              )}
            </div>

            {/* Google Search Ad Preview Card */}
            {formatData.google_ad && (
              <div className="google-ad-preview-box">
                <div className="box-title-row">
                  <Globe size={15} />
                  <span>Google Ads Sponsored Search Preview</span>
                </div>
                <div className="google-ad-mockup">
                  <div className="ad-url-row">
                    <span className="google-ad-badge">Sponsored</span>
                    <span className="google-ad-url">https://www.contentforge.ai › solutions</span>
                  </div>
                  <h3 className="google-ad-title">
                    {formatData.google_ad.headline_1} | {formatData.google_ad.headline_2}
                  </h3>
                  <p className="google-ad-desc">{formatData.google_ad.description}</p>
                </div>
              </div>
            )}

            {/* Key Benefits */}
            {formatData.key_benefits && formatData.key_benefits.length > 0 && (
              <div className="ad-benefits-card">
                <h4 className="benefits-title">Key Selling Propositions</h4>
                <div className="benefits-grid">
                  {formatData.key_benefits.map((b, bIdx) => (
                    <div key={bIdx} className="benefit-item">
                      <CheckCircle2 size={16} className="text-success" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            Format 11: PROMOTIONAL CONTENT
            =================================================================== */}
        {currentFormat === 'promotional' && (
          <div className="format-result-view promo-result-view">
            {/* Toolbar */}
            <div className="format-view-toolbar">
              <div className="toolbar-left">
                <span className="format-type-pill" style={{ backgroundColor: '#be185d15', color: '#be185d' }}>
                  <Gift size={14} />
                  Promotional & PR
                </span>
                <span className="format-meta-detail">
                  {formatData.campaign_name || 'Awareness Campaign'} • Email & Press Release
                </span>
              </div>

              <div className="toolbar-actions">
                <div className="view-mode-toggle">
                  <button
                    type="button"
                    className={`btn-mode-pill ${activePromoTab === 'email' ? 'mode-active' : ''}`}
                    onClick={() => setActivePromoTab('email')}
                  >
                    <Mail size={14} />
                    <span>Email Campaign</span>
                  </button>
                  <button
                    type="button"
                    className={`btn-mode-pill ${activePromoTab === 'press' ? 'mode-active' : ''}`}
                    onClick={() => setActivePromoTab('press')}
                  >
                    <FileText size={14} />
                    <span>Press Release</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-toolbar-action"
                  onClick={() => {
                    if (activePromoTab === 'email') {
                      const e = formatData.email_campaign || {};
                      handleCopyText(`SUBJECT: ${e.subject_line}\nPREVIEW: ${e.preview_text}\n\n${e.greeting}\n\n${e.body}\n\n[${e.cta_text}]\n\n${e.sign_off}`);
                    } else {
                      const pr = formatData.press_release || {};
                      handleCopyText(`FOR IMMEDIATE RELEASE\n\n${pr.headline}\n${pr.dateline}\n\n${pr.lead_paragraph}\n\n${pr.body_paragraph}\n\n${pr.quote}\n\n${pr.boilerplate}`);
                    }
                  }}
                  title="Copy selected promotional content"
                >
                  {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied' : `Copy ${activePromoTab === 'email' ? 'Email' : 'Press Release'}`}</span>
                </button>

                {onRegenerate && (
                  <button type="button" className="btn-toolbar-action" onClick={onRegenerate} title="Regenerate promotional content">
                    <RotateCcw size={15} />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>
            </div>

            {/* Email Campaign View */}
            {activePromoTab === 'email' && formatData.email_campaign && (
              <div className="promo-email-container">
                <div className="email-meta-strip">
                  <div className="email-meta-field">
                    <span className="meta-label">Subject Line:</span>
                    <span className="meta-value">{formatData.email_campaign.subject_line}</span>
                  </div>
                  {formatData.email_campaign.preview_text && (
                    <div className="email-meta-field">
                      <span className="meta-label">Preview Text:</span>
                      <span className="meta-value">{formatData.email_campaign.preview_text}</span>
                    </div>
                  )}
                </div>

                <div className="email-client-mockup">
                  <div className="mockup-header-bar">
                    <span className="mockup-dot dot-red"></span>
                    <span className="mockup-dot dot-yellow"></span>
                    <span className="mockup-dot dot-green"></span>
                    <span className="mockup-title">Promotional Email Broadcast</span>
                  </div>

                  <div className="email-body-content">
                    <p className="email-greeting">{formatData.email_campaign.greeting}</p>
                    <div className="email-paragraphs">
                      {(formatData.email_campaign.body || '').split('\n').map((para, pIdx) => (
                        para.trim() ? <p key={pIdx}>{para.trim()}</p> : null
                      ))}
                    </div>

                    {formatData.email_campaign.cta_text && (
                      <div className="email-cta-wrapper">
                        <button type="button" className="email-action-btn">
                          {formatData.email_campaign.cta_text}
                        </button>
                      </div>
                    )}

                    <p className="email-signoff">{formatData.email_campaign.sign_off}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Press Release View */}
            {activePromoTab === 'press' && formatData.press_release && (
              <div className="press-release-container">
                <div className="press-release-paper">
                  <div className="press-top-badge">FOR IMMEDIATE RELEASE</div>
                  <h1 className="press-headline">{formatData.press_release.headline}</h1>
                  <div className="press-dateline-pill">{formatData.press_release.dateline}</div>

                  <p className="press-lead-paragraph">{formatData.press_release.lead_paragraph}</p>
                  <p className="press-body-paragraph">{formatData.press_release.body_paragraph}</p>

                  {formatData.press_release.quote && (
                    <blockquote className="press-pull-quote">
                      "{formatData.press_release.quote.replace(/^"|"$/g, '')}"
                    </blockquote>
                  )}

                  <div className="press-boilerplate">
                    <h4>About ContentForge AI</h4>
                    <p>{formatData.press_release.boilerplate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Messages */}
            {formatData.key_messages && formatData.key_messages.length > 0 && (
              <div className="promo-key-messages">
                <h4 className="key-messages-title">Key Campaign Messages</h4>
                <div className="key-messages-pills">
                  {formatData.key_messages.map((msg, mIdx) => (
                    <span key={mIdx} className="message-pill">{msg}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
