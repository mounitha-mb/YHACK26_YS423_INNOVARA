import React from 'react';
import { 
  BarChart3, 
  Hash, 
  AlignLeft, 
  FileText, 
  Key, 
  Sparkles, 
  Calendar, 
  Percent, 
  Mail, 
  Globe, 
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function AnalysisResults({ 
  analysis, 
  isAnalyzing, 
  error,
  loadingMessage = 'Analyzing your content...'
}) {
  if (isAnalyzing) {
    return (
      <div className="analysis-section-card analysis-loading-state">
        <div className="analysis-loading-content">
          <Loader2 size={40} className="analysis-spinner" />
          <h3 className="loading-title">{loadingMessage}</h3>
          <p className="loading-subtitle">
            Extracting important information, finding semantic meaning, and building structured content representation...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-section-card analysis-error-state">
        <div className="analysis-error-content">
          <AlertCircle size={28} className="error-icon" />
          <div className="error-text-block">
            <h4 className="error-title">Analysis Failed</h4>
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const word_count = analysis.word_count || analysis.statistics?.word_count || 0;
  const character_count = analysis.character_count || analysis.statistics?.character_count || 0;
  const sentence_count = analysis.sentence_count || analysis.statistics?.sentence_count || 0;
  const paragraph_count = analysis.paragraph_count || analysis.statistics?.paragraph_count || 0;

  const keywords = Array.isArray(analysis.keywords) ? analysis.keywords : [];
  const keyphrases = Array.isArray(analysis.keyphrases) ? analysis.keyphrases : [];
  const key_info = (typeof analysis.key_information === 'object' && analysis.key_information !== null) 
    ? analysis.key_information 
    : {};

  const dates = Array.isArray(key_info.dates) ? key_info.dates : [];
  const numbers = Array.isArray(key_info.numbers) ? key_info.numbers : [];
  const percentages = Array.isArray(key_info.percentages) ? key_info.percentages : [];
  const emails = Array.isArray(key_info.emails) ? key_info.emails : [];
  const urls = Array.isArray(key_info.urls) ? key_info.urls : [];

  return (
    <div className="analysis-container">
      <div className="analysis-header-row">
        <div className="analysis-title-wrap">
          <div className="analysis-icon-badge">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="section-title">NLP Content Analysis</h2>
            <p className="section-subtitle">
              Automated linguistic extraction, statistical profiling & semantic keyphrases
            </p>
          </div>
        </div>
        <div className="analysis-status-pill">
          <CheckCircle2 size={14} className="check-icon" />
          <span>Analysis Complete</span>
        </div>
      </div>

      {/* Grid 1: Document Statistics */}
      <div className="stats-metric-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Words</span>
            <FileText size={18} className="stat-icon" />
          </div>
          <span className="stat-value">{word_count?.toLocaleString() || 0}</span>
          <span className="stat-hint">Total word tokens</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Characters</span>
            <Hash size={18} className="stat-icon" />
          </div>
          <span className="stat-value">{character_count?.toLocaleString() || 0}</span>
          <span className="stat-hint">Includes spacing</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Sentences</span>
            <AlignLeft size={18} className="stat-icon" />
          </div>
          <span className="stat-value">{sentence_count?.toLocaleString() || 0}</span>
          <span className="stat-hint">Syntactic units</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Paragraphs</span>
            <Layers size={18} className="stat-icon" />
          </div>
          <span className="stat-value">{paragraph_count?.toLocaleString() || 0}</span>
          <span className="stat-hint">Structural blocks</span>
        </div>
      </div>

      {/* Grid 2: TF-IDF Keywords & KeyBERT Keyphrases */}
      <div className="nlp-dual-grid">
        {/* Top Keywords (TF-IDF) */}
        <div className="nlp-card">
          <div className="card-header-inner">
            <div className="card-header-left">
              <Key size={18} className="card-header-icon" />
              <h3 className="card-inner-title">Top Keywords (TF-IDF)</h3>
            </div>
            <span className="method-pill">Term Frequency</span>
          </div>

          <div className="keywords-list">
            {keywords.length > 0 ? (
              keywords.map((kw, idx) => {
                const term = typeof kw === 'string' ? kw : (kw?.term || '');
                const score = typeof kw === 'object' && typeof kw?.score === 'number' ? kw.score : 0.5;
                const scorePercent = Math.min(Math.round(score * 100), 100);
                return (
                  <div key={idx} className="keyword-row">
                    <div className="keyword-meta">
                      <span className="keyword-rank">#{idx + 1}</span>
                      <span className="keyword-term">{term}</span>
                    </div>
                    <div className="keyword-score-wrap">
                      <div className="score-meter-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${scorePercent}%` }}
                        ></div>
                      </div>
                      <span className="keyword-score-text">{score}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="empty-subtext">No prominent TF-IDF terms detected.</p>
            )}
          </div>
        </div>

        {/* Key Phrases (KeyBERT) */}
        <div className="nlp-card">
          <div className="card-header-inner">
            <div className="card-header-left">
              <Sparkles size={18} className="card-header-icon" />
              <h3 className="card-inner-title">Key Phrases (KeyBERT)</h3>
            </div>
            <span className="method-pill model-tag">Semantic Embeddings</span>
          </div>

          <div className="phrases-cloud">
            {keyphrases.length > 0 ? (
              keyphrases.map((kp, idx) => {
                const phrase = typeof kp === 'string' ? kp : (kp?.phrase || '');
                const relevance = typeof kp === 'object' && typeof kp?.score === 'number' ? Math.round(kp.score * 100) : 75;
                return (
                  <div key={idx} className="phrase-badge">
                    <span className="phrase-text">{phrase}</span>
                    <span className="phrase-relevance">{relevance}%</span>
                  </div>
                );
              })
            ) : (
              <p className="empty-subtext">No key phrases identified.</p>
            )}
          </div>
        </div>
      </div>

      {/* Grid 3: Important Information Extracted */}
      <div className="nlp-card key-info-card">
        <div className="card-header-inner">
          <div className="card-header-left">
            <BarChart3 size={18} className="card-header-icon" />
            <h3 className="card-inner-title">Important Information</h3>
          </div>
          <span className="method-pill info-tag">Deterministic Extraction</span>
        </div>

        <div className="key-info-subsections-grid">
          {/* Dates */}
          <div className="info-subsection">
            <div className="info-sub-header">
              <Calendar size={15} className="info-sub-icon" />
              <span>Dates ({dates.length})</span>
            </div>
            <div className="info-sub-chips">
              {dates.length > 0 ? (
                dates.map((d, i) => <span key={i} className="info-chip chip-date">{d}</span>)
              ) : (
                <span className="info-none">— None detected</span>
              )}
            </div>
          </div>

          {/* Numbers & Currency */}
          <div className="info-subsection">
            <div className="info-sub-header">
              <Hash size={15} className="info-sub-icon" />
              <span>Numbers & Currency ({numbers.length})</span>
            </div>
            <div className="info-sub-chips">
              {numbers.length > 0 ? (
                numbers.map((n, i) => <span key={i} className="info-chip chip-number">{n}</span>)
              ) : (
                <span className="info-none">— None detected</span>
              )}
            </div>
          </div>

          {/* Percentages */}
          <div className="info-subsection">
            <div className="info-sub-header">
              <Percent size={15} className="info-sub-icon" />
              <span>Percentages ({percentages.length})</span>
            </div>
            <div className="info-sub-chips">
              {percentages.length > 0 ? (
                percentages.map((p, i) => <span key={i} className="info-chip chip-percent">{p}</span>)
              ) : (
                <span className="info-none">— None detected</span>
              )}
            </div>
          </div>

          {/* Emails */}
          <div className="info-subsection">
            <div className="info-sub-header">
              <Mail size={15} className="info-sub-icon" />
              <span>Emails ({emails.length})</span>
            </div>
            <div className="info-sub-chips">
              {emails.length > 0 ? (
                emails.map((e, i) => <span key={i} className="info-chip chip-email">{e}</span>)
              ) : (
                <span className="info-none">— None detected</span>
              )}
            </div>
          </div>

          {/* URLs */}
          <div className="info-subsection">
            <div className="info-sub-header">
              <Globe size={15} className="info-sub-icon" />
              <span>Links & URLs ({urls.length})</span>
            </div>
            <div className="info-sub-chips">
              {urls.length > 0 ? (
                urls.map((u, i) => (
                  <a key={i} href={u.startsWith('http') ? u : `https://${u}`} target="_blank" rel="noopener noreferrer" className="info-chip chip-url">
                    {u}
                  </a>
                ))
              ) : (
                <span className="info-none">— None detected</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
