import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import SourceContentPreview from './components/SourceContentPreview';
import AnalysisResults from './components/AnalysisResults';
import StructuredContentDisplay from './components/StructuredContentDisplay';
import ContentControls from './components/ContentControls';
import FormatSelector from './components/FormatSelector';
import GeneratedResults from './components/GeneratedResults';
import NotificationToast from './components/NotificationToast';
import ErrorBoundary from './components/ErrorBoundary';
import { analyzeContent, generateContent } from './services/api';
import DashboardView from './components/DashboardView';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Clock, 
  Settings as SettingsIcon,
  Layers,
  BrainCircuit,
  Loader2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import './App.css';


export default function App({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Upload and extraction state (Phase 2)
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // NLP Analysis state (Phase 3)
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [loadingStepText, setLoadingStepText] = useState('Extracting important information...');

  // LLM Structured Content Understanding (Phase 4)
  const [structuredContent, setStructuredContent] = useState(null);
  const [initialStructuredContent, setInitialStructuredContent] = useState(null);
  const [llmStatus, setLlmStatus] = useState('idle');
  const [llmMessage, setLlmMessage] = useState('');

  // Content controls state
  const [controls, setControls] = useState({
    audience: 'Student',
    tone: 'Professional',
    language: 'English',
    length: 'Medium',
  });

  // Selected output formats (Phase 5: summary, blog, mcq, image, doc, presentation)
  const [selectedFormats, setSelectedFormats] = useState(['summary']);

  // AI Content Transformation (Phase 5)
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const [activeGeneratedFormat, setActiveGeneratedFormat] = useState('summary');
  const [generationStepText, setGenerationStepText] = useState('Analyzing source content with Gemini AI...');

  // Notification toast state
  const [toast, setToast] = useState({
    show: false,
    title: 'Platform Notice',
    message: '',
  });

  // Cycle loading messages when isAnalyzing is true
  useEffect(() => {
    if (!isAnalyzing) return;
    const steps = [
      'Extracting important information...',
      'Finding semantic meaning...',
      'Building content understanding...'
    ];
    let stepIndex = 0;
    setLoadingStepText(steps[0]);

    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStepText(steps[stepIndex]);
    }, 1400);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Cycle loading messages when isGenerating is true
  useEffect(() => {
    if (!isGenerating) return;
    const steps = [
      'Analyzing source content with Gemini AI...',
      'Structuring format-specific insights and parameters...',
      'Forging publication-ready content & downloadable assets...'
    ];
    let stepIndex = 0;
    setGenerationStepText(steps[0]);

    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setGenerationStepText(steps[stepIndex]);
    }, 1300);

    return () => clearInterval(interval);
  }, [isGenerating]);


  const handleExtractionSuccess = (file, data) => {
    setSelectedFile(file);
    setExtractedData(data);
    setAnalysisResults(null);
    setAnalysisError(null);
    setStructuredContent(null);
    setInitialStructuredContent(null);
    setLlmStatus('idle');
    setLlmMessage('');
    setGenerationResults(null);
    setGenerationError(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setAnalysisResults(null);
    setAnalysisError(null);
    setStructuredContent(null);
    setInitialStructuredContent(null);
    setLlmStatus('idle');
    setLlmMessage('');
    setGenerationResults(null);
    setGenerationError(null);
  };

  const handleUpdateExtractedText = (newText) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        text: newText,
        character_count: newText.length,
      });
    }
  };

  const handleClearContent = () => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        text: '',
        character_count: 0,
      });
      setAnalysisResults(null);
      setStructuredContent(null);
      setInitialStructuredContent(null);
      setGenerationResults(null);
      setGenerationError(null);
    }
  };


  const handleAnalyzeContent = async (textToAnalyze) => {
    const text = textToAnalyze || extractedData?.text || '';
    if (!text.trim()) {
      setToast({
        show: true,
        title: 'Empty Content',
        message: 'No content available for analysis. Please upload or provide document text.',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const data = await analyzeContent(text);
      setAnalysisResults(data.analysis || null);
      if (data.structured_content) {
        setStructuredContent(data.structured_content);
        setInitialStructuredContent(JSON.parse(JSON.stringify(data.structured_content)));
      } else {
        setStructuredContent(null);
        setInitialStructuredContent(null);
      }
      setLlmStatus(data.llm_status || 'idle');
      setLlmMessage(data.llm_message || '');

      // Smooth scroll into view
      setTimeout(() => {
        const el = document.getElementById('ai-content-understanding') || document.querySelector('.analysis-container');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);

    } catch (err) {
      console.error('Analysis Pipeline Error:', err);
      setAnalysisError(err.message || 'Unable to analyze the content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveStructuredContent = (updated) => {
    setStructuredContent(updated);
  };

  const handleResetStructuredContent = (initial) => {
    setStructuredContent(initial);
  };

  const handleToggleFormat = (formatId) => {
    setSelectedFormats((prev) => {
      if (prev.includes(formatId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== formatId);
      } else {
        return [...prev, formatId];
      }
    });
  };

  const handleSelectFormatAndCreate = (formatId) => {
    setSelectedFormats([formatId]);
    setActiveTab('create');
  };

  const handleGenerate = async () => {
    const text = extractedData?.text || '';
    if (!text.trim()) {
      setToast({
        show: true,
        title: 'Empty Content',
        message: 'No source text available. Please upload a PDF/image or provide text to transform.',
      });
      return;
    }

    if (selectedFormats.length === 0) {
      setToast({
        show: true,
        title: 'Format Required',
        message: 'Please select at least one format (Summary, Blog, MCQ, Image, DOC, Presentation).',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const data = await generateContent({
        text,
        formats: selectedFormats,
        format: selectedFormats[0],
        controls,
      });

      setGenerationResults(data.results || { [data.format]: data.result });
      setActiveGeneratedFormat(data.formats?.[0] || selectedFormats[0]);

      // Smooth scroll into view of results
      setTimeout(() => {
        const el = document.getElementById('generated-results-anchor');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);

    } catch (err) {
      console.error('Generation Error:', err);
      setGenerationError(err.message || 'Transformation failed. Please check backend configuration.');
      setToast({
        show: true,
        title: 'Transformation Notice',
        message: err.message || 'Failed to generate transformed content.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseToast = () => {
    setToast({ show: false, title: '', message: '' });
  };


  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={onLogout}
      />

      {/* Main Workspace Area */}
      <div className="main-wrapper">
        <Header onToggleMobileMenu={() => setMobileOpen(true)} user={user} onLogout={onLogout} />

        <main className="content-area">
          {activeTab === 'create' && (
            <div className="create-flow-container">
              {/* Section 1: File Upload */}
              <div className="dashboard-section-block">
                <div className="block-label-row">
                  <span className="step-number">01</span>
                  <span className="step-label">Source Ingestion</span>
                </div>
                <FileUpload
                  file={selectedFile}
                  onExtractionSuccess={handleExtractionSuccess}
                  onFileRemove={handleFileRemove}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              </div>

              {/* Section 2: Source Content Preview & Editor */}
              <div className="dashboard-section-block">
                <div className="block-label-row">
                  <span className="step-number">02</span>
                  <span className="step-label">Source Content & Review</span>
                </div>
                <ErrorBoundary>
                  <SourceContentPreview
                    extractedData={extractedData}
                    onUpdateText={handleUpdateExtractedText}
                    onClearContent={handleClearContent}
                    onAnalyzeClick={handleAnalyzeContent}
                    isAnalyzing={isAnalyzing}
                  />
                </ErrorBoundary>
              </div>

              {/* Section 3: NLP Content Analysis (Phase 3) */}
              {(isAnalyzing || analysisResults || analysisError) && (
                <div className="dashboard-section-block">
                  <div className="block-label-row">
                    <span className="step-number">03</span>
                    <span className="step-label">NLP Insights & Term Extraction</span>
                  </div>
                  <ErrorBoundary>
                    <AnalysisResults
                      analysis={analysisResults}
                      isAnalyzing={isAnalyzing}
                      error={analysisError}
                      loadingMessage={loadingStepText}
                    />
                  </ErrorBoundary>
                </div>
              )}

              {/* Section 4: AI Content Understanding (Phase 4) */}
              {structuredContent && (
                <div className="dashboard-section-block">
                  <div className="block-label-row">
                    <span className="step-number">04</span>
                    <span className="step-label">AI Semantic Understanding</span>
                  </div>
                  <ErrorBoundary>
                    <StructuredContentDisplay
                      structuredContent={structuredContent}
                      initialContent={initialStructuredContent}
                      onSaveContent={handleSaveStructuredContent}
                      onResetContent={handleResetStructuredContent}
                      llmStatus={llmStatus}
                      llmMessage={llmMessage}
                    />
                  </ErrorBoundary>
                </div>
              )}

              {/* Section 5: Content Controls (Audience, Tone, Language, Length) */}
              <div className="dashboard-section-block">
                <div className="block-label-row">
                  <span className="step-number">
                    {structuredContent ? '05' : (analysisResults ? '04' : '03')}
                  </span>
                  <span className="step-label">Audience & Styling</span>
                </div>
                <ContentControls
                  controls={controls}
                  onChange={setControls}
                />
              </div>

              {/* Section 6: Output Format Selection */}
              <div className="dashboard-section-block">
                <div className="block-label-row">
                  <span className="step-number">
                    {structuredContent ? '06' : (analysisResults ? '05' : '04')}
                  </span>
                  <span className="step-label">Output Target</span>
                </div>
                <FormatSelector
                  selectedFormats={selectedFormats}
                  onToggleFormat={handleToggleFormat}
                />
              </div>

              {/* Section 7: Generate Action Bar */}
              <div className="generate-action-bar">
                <div className="generate-summary-info">
                  <div className="summary-pill">
                    <span className="pill-dot"></span>
                    <span>
                      {structuredContent?.title ? (
                        <>Ready to forge: <strong>{structuredContent.title}</strong></>
                      ) : selectedFile ? (
                        <>Ready to forge <strong>{selectedFile.name}</strong> ({extractedData?.character_count || 0} chars)</>
                      ) : (
                        'No file selected yet'
                      )}
                    </span>
                  </div>
                  <p className="generate-subtext">
                    Configured for <strong>{controls.audience}</strong> • <strong>{controls.tone}</strong> tone • <strong>{controls.language}</strong> • <strong>{controls.length}</strong> length
                  </p>
                </div>

                <button
                  type="button"
                  className={`btn-generate-primary ${isGenerating ? 'btn-generating' : ''}`}
                  onClick={handleGenerate}
                  disabled={isGenerating || !extractedData?.text?.trim()}
                  id="btn-generate-content"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={20} className="spinner-icon" />
                      <span>Forging Content...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="sparkle-icon" />
                      <span>Generate Content</span>
                      <ArrowRight size={18} className="arrow-icon" />
                    </>
                  )}
                </button>
              </div>

              {/* Generation Loading State Banner */}
              {isGenerating && (
                <div className="generation-loading-banner">
                  <div className="loading-banner-inner">
                    <Loader2 size={32} className="spinner-icon text-primary" />
                    <div className="loading-text-wrap">
                      <h4 className="loading-title">Forging Content Assets...</h4>
                      <p className="loading-subtitle">{generationStepText}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Generation Error State Banner */}
              {generationError && !isGenerating && (
                <div className="generation-error-banner">
                  <AlertCircle size={24} className="text-danger" />
                  <div className="error-text-wrap">
                    <h4 className="error-title">Transformation Notice</h4>
                    <p className="error-subtitle">{generationError}</p>
                  </div>
                  <button type="button" className="btn-retry-action" onClick={handleGenerate}>
                    <RotateCcw size={16} />
                    <span>Try Again</span>
                  </button>
                </div>
              )}

              {/* Section 8: Transformed Content Results (Phase 5) */}
              {generationResults && (
                <div className="dashboard-section-block">
                  <div className="block-label-row">
                    <span className="step-number">
                      {structuredContent ? '07' : (analysisResults ? '06' : '05')}
                    </span>
                    <span className="step-label">Transformed Results</span>
                  </div>
                  <ErrorBoundary>
                    <GeneratedResults
                      results={generationResults}
                      activeFormat={activeGeneratedFormat}
                      onSelectFormat={setActiveGeneratedFormat}
                      onRegenerate={handleGenerate}
                    />
                  </ErrorBoundary>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              onNavigateToCreate={() => setActiveTab('create')}
              onSelectFormatAndCreate={handleSelectFormatAndCreate}
            />
          )}

          {activeTab === 'history' && (
            <div className="tab-placeholder-card">
              <div className="placeholder-icon-wrap">
                <Clock size={36} />
              </div>
              <h3>Transformation History</h3>
              <p>Past document transformations, exports, and generated assets will appear here.</p>
              <button 
                className="btn-return-create" 
                onClick={() => setActiveTab('create')}
              >
                Create New Content
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-placeholder-card">
              <div className="placeholder-icon-wrap">
                <SettingsIcon size={36} />
              </div>
              <h3>Workspace Settings</h3>
              <p>Model configurations, API keys, and language preference defaults.</p>
              <button 
                className="btn-return-create" 
                onClick={() => setActiveTab('create')}
              >
                Back to Transformation
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      <NotificationToast
        show={toast.show}
        title={toast.title}
        message={toast.message}
        onClose={handleCloseToast}
      />
    </div>
  );
}
