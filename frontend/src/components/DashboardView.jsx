import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Cpu, 
  ArrowRight, 
  FileText, 
  BookOpen, 
  HelpCircle, 
  Image as ImageIcon, 
  FileCheck, 
  Presentation, 
  CreditCard, 
  Video, 
  Share2, 
  Megaphone, 
  Gift, 
  CheckCircle2, 
  UploadCloud,
  Zap,
  ShieldCheck,
  Compass
} from 'lucide-react';

const DASHBOARD_FORMATS = [
  { id: 'summary',      title: 'Executive Summary',   badge: 'Digest',    desc: 'Concise executive briefing with strategic takeaways',        icon: FileText,     color: '#4f46e5' },
  { id: 'blog',         title: 'Full Blog Post',      badge: 'Article',   desc: 'SEO-ready article with intro, sections & conclusion',       icon: BookOpen,     color: '#0891b2' },
  { id: 'mcq',          title: 'Interactive MCQ Quiz',badge: 'Quiz',      desc: '4 options, answer keys, explanations & score tracker',     icon: HelpCircle,   color: '#7c3aed' },
  { id: 'image',        title: 'Visual AI Generation',badge: 'Visual AI', desc: 'Optimized artistic prompts & direct diffusion assets',      icon: ImageIcon,    color: '#ea580c' },
  { id: 'doc',          title: 'Word Document (.docx)',badge: 'DOCX',     desc: 'Executive briefing document generated with python-docx',     icon: FileCheck,    color: '#2563eb' },
  { id: 'presentation', title: 'Slide Deck (.pptx)',  badge: 'PPTX',      desc: '16:9 widescreen presentation deck via python-pptx',          icon: Presentation, color: '#d97706' },
  { id: 'flashcards',   title: 'Study Flashcards',    badge: 'Study',     desc: 'Interactive flip-cards with front terms & back answers',     icon: CreditCard,   color: '#059669' },
  { id: 'video',        title: 'Video Script & Scenes',badge: 'Script',   desc: 'Scene-by-scene storyboard, camera cues & narration',        icon: Video,        color: '#dc2626' },
  { id: 'social_media', title: 'Social Media Suite',  badge: 'Social',    desc: 'Optimized posts for Twitter/X, LinkedIn, IG & Facebook',     icon: Share2,       color: '#0284c7' },
  { id: 'advertisement',title: 'Ad Campaign Copy',    badge: 'Marketing', desc: 'Google search ad, banner ads, taglines & value benefits',  icon: Megaphone,    color: '#9333ea' },
  { id: 'promotional',  title: 'Promotional & PR',    badge: 'Promo',     desc: 'Email campaigns, formal press releases & media copy',        icon: Gift,         color: '#be185d' },
];

export default function DashboardView({ user, onNavigateToCreate, onSelectFormatAndCreate }) {
  const userDisplayName = user ? user.split('@')[0] : 'Creator';

  return (
    <div className="dashboard-view-container">
      {/* Hero Welcome Banner */}
      <div className="dashboard-hero-banner">
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={14} className="hero-sparkle" />
            <span>ContentForge AI 5.0 • Multi-Format Engine</span>
          </div>
          <h1 className="hero-title">
            Welcome back, <span className="hero-username">{userDisplayName}</span>
          </h1>
          <p className="hero-subtitle">
            Upload any PDF, document image, or text once. Transform it into 11 publication-ready 
            formats—summaries, slide decks, flashcards, video scripts, social media, and more.
          </p>
          <div className="hero-actions">
            <button 
              type="button" 
              className="btn-hero-primary"
              onClick={() => onNavigateToCreate()}
            >
              <Zap size={18} />
              <span>Start New Transformation</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="hero-stats-grid">
          <div className="hero-stat-card">
            <span className="stat-number">11</span>
            <span className="stat-label">Output Formats</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-number">2</span>
            <span className="stat-label">Direct Downloads (.docx, .pptx)</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-number">AI</span>
            <span className="stat-label">Gemini Multimodal Active</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-number">100%</span>
            <span className="stat-label">Factual Grounding</span>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Formats Grid */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2 className="section-heading">Transformation Launchpad</h2>
            <p className="section-subheading">
              Select an output format below to launch the content creator with that target preset
            </p>
          </div>
          <span className="badge-count">11 Formats Ready</span>
        </div>

        <div className="launchpad-grid">
          {DASHBOARD_FORMATS.map((fmt) => {
            const Icon = fmt.icon;
            return (
              <div 
                key={fmt.id} 
                className="launchpad-card"
                onClick={() => onSelectFormatAndCreate(fmt.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectFormatAndCreate(fmt.id); } }}
              >
                <div className="launchpad-card-top">
                  <div className="launchpad-icon-wrap" style={{ color: fmt.color, backgroundColor: `${fmt.color}15` }}>
                    <Icon size={22} />
                  </div>
                  <span className="launchpad-badge">{fmt.badge}</span>
                </div>
                <h3 className="launchpad-title">{fmt.title}</h3>
                <p className="launchpad-desc">{fmt.desc}</p>
                <div className="launchpad-card-footer">
                  <span className="launchpad-action-text">Generate {fmt.title.split(' ')[0]}</span>
                  <ArrowRight size={14} className="launchpad-arrow" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Step Pipeline Architecture */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2 className="section-heading">How ContentForge AI Works</h2>
            <p className="section-subheading">End-to-end factual synthesis and multimodal transformation pipeline</p>
          </div>
        </div>

        <div className="pipeline-steps-grid">
          <div className="pipeline-step-card">
            <div className="step-badge-circle">1</div>
            <h4>Ingest Document</h4>
            <p>Upload PDF, plain text, or document images. PyMuPDF and AI Vision extract and clean raw text.</p>
          </div>
          <div className="pipeline-step-card">
            <div className="step-badge-circle">2</div>
            <h4>Semantic NLP Analysis</h4>
            <p>KeyBERT keyphrases, TF-IDF terms, dates, and metrics are extracted without hallucinations.</p>
          </div>
          <div className="pipeline-step-card">
            <div className="step-badge-circle">3</div>
            <h4>Tone & Audience Tuning</h4>
            <p>Target specific audiences (Student, Executive) and tones (Professional, Engaging, Persuasive).</p>
          </div>
          <div className="pipeline-step-card">
            <div className="step-badge-circle">4</div>
            <h4>Multi-Format Forge</h4>
            <p>Generate study flashcards, slide decks, video scripts, ad copy, and downloadable Word docs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
