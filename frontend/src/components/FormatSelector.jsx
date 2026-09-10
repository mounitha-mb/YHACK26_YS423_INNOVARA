import React from 'react';
import {
  FileText, BookOpen, HelpCircle, Image as ImageIcon, FileCheck,
  Presentation, CheckCircle2, Layers, Video, Share2, Megaphone, Gift, CreditCard
} from 'lucide-react';

const ALL_FORMATS = [
  { id: 'summary',     title: 'Summary',       subtitle: 'Concise structured executive briefing',    icon: FileText,     badge: 'Digest' },
  { id: 'blog',        title: 'Blog',           subtitle: 'Title, introduction, sections & conclusion', icon: BookOpen,   badge: 'Article' },
  { id: 'mcq',         title: 'MCQ',            subtitle: '4 options, answer keys & explanations',    icon: HelpCircle,   badge: 'Quiz' },
  { id: 'image',       title: 'Image',          subtitle: 'Optimized visual prompt & AI asset',       icon: ImageIcon,    badge: 'Visual AI' },
  { id: 'doc',         title: 'DOC',            subtitle: 'Downloadable .docx Word document',         icon: FileCheck,    badge: 'Word DOCX' },
  { id: 'presentation',title: 'Presentation',   subtitle: 'Slide-wise deck & downloadable .pptx',     icon: Presentation, badge: 'Slides PPTX' },
  { id: 'flashcards',  title: 'Flashcards',     subtitle: 'Study cards with front & back content',    icon: CreditCard,   badge: 'Study' },
  { id: 'video',       title: 'Video Script',   subtitle: 'Scene-by-scene video script with visuals', icon: Video,        badge: 'Script' },
  { id: 'social_media',title: 'Social Media',   subtitle: 'Twitter, LinkedIn, Instagram & Facebook',  icon: Share2,       badge: 'Social' },
  { id: 'advertisement',title: 'Advertisement', subtitle: 'Ad copy, tagline, Google & banner ads',    icon: Megaphone,    badge: 'Ad Copy' },
  { id: 'promotional', title: 'Promotional',    subtitle: 'Email campaign & press release content',   icon: Gift,         badge: 'Promo' },
];

export default function FormatSelector({ selectedFormats, onToggleFormat }) {
  return (
    <div className="formats-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Output Format Selection</h2>
          <p className="section-subtitle">Choose one or more formats to generate from your source material</p>
        </div>
        <span className="selected-count-badge">{selectedFormats.length} selected</span>
      </div>

      <div className="formats-grid">
        {ALL_FORMATS.map((fmt) => {
          const Icon = fmt.icon;
          const isSelected = selectedFormats.includes(fmt.id);
          return (
            <div
              key={fmt.id}
              className={`format-card ${isSelected ? 'format-card-selected' : ''}`}
              onClick={() => onToggleFormat(fmt.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleFormat(fmt.id); } }}
              aria-pressed={isSelected}
            >
              <div className="format-card-top">
                <div className={`format-icon-box ${isSelected ? 'icon-box-active' : ''}`}>
                  <Icon size={22} />
                </div>
                <span className={`format-tag ${isSelected ? 'format-tag-active' : ''}`}>{fmt.badge}</span>
              </div>
              <div className="format-card-content">
                <h3 className="format-title">{fmt.title}</h3>
                <p className="format-description">{fmt.subtitle}</p>
              </div>
              <div className="format-card-footer">
                <div className={`format-checkbox-indicator ${isSelected ? 'checkbox-active' : ''}`}>
                  {isSelected ? <CheckCircle2 size={18} className="checkbox-icon" /> : <span className="checkbox-circle"></span>}
                  <span className="checkbox-label">{isSelected ? 'Included' : 'Select'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
