import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Edit3, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ListChecks, 
  FileCheck, 
  Users, 
  MapPin, 
  Calendar, 
  Hash, 
  Target, 
  Plus, 
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';

function safeText(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    return val.text || val.point || val.fact || val.action || val.warning || val.name || val.value || JSON.stringify(val);
  }
  return String(val);
}

export default function StructuredContentDisplay({
  structuredContent,
  initialContent,
  onSaveContent,
  onResetContent,
  llmStatus,
  llmMessage
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(structuredContent || {});
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    setFormData(structuredContent || {});
  }, [structuredContent]);

  if (!structuredContent) return null;

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayItemChange = (field, index, value) => {
    setFormData((prev) => {
      const updated = [...(prev[field] || [])];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const handleAddArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ''],
    }));
  };

  const handleRemoveArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    onSaveContent(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleReset = () => {
    if (initialContent) {
      setFormData(initialContent);
      onResetContent(initialContent);
      setIsEditing(false);
    }
  };

  return (
    <div className="structured-content-section" id="ai-content-understanding">
      {/* Section Header */}
      <div className="understanding-header-row">
        <div className="understanding-title-block">
          <div className="understanding-icon-badge">
            <BrainCircuit size={22} />
          </div>
          <div>
            <div className="badge-row">
              <h2 className="section-title">AI Content Understanding</h2>
              <span className={`engine-badge ${llmStatus === 'success' ? 'engine-gemini' : 'engine-baseline'}`}>
                <Sparkles size={13} />
                {llmStatus === 'success' ? 'Gemini 1.5 Flash' : 'Baseline Understanding'}
              </span>
            </div>
            <p className="section-subtitle">
              Single structured representation preserving factual truth for multi-format generation
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="understanding-toolbar">
          {saveToast && (
            <span className="save-indicator-badge">
              <CheckCircle2 size={14} /> Changes Saved
            </span>
          )}

          {isEditing ? (
            <button
              type="button"
              className="btn-toolbar btn-toolbar-save"
              onClick={handleSave}
              title="Save changes to structured representation"
            >
              <Save size={15} />
              <span>Save Representation</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-toolbar btn-toolbar-edit"
              onClick={() => setIsEditing(true)}
              title="Edit structured content"
            >
              <Edit3 size={15} />
              <span>Edit Representation</span>
            </button>
          )}

          <button
            type="button"
            className="btn-toolbar"
            onClick={handleReset}
            title="Reset to initial AI extraction"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Notice Banner if Missing Key or Fallback */}
      {llmMessage && llmStatus !== 'success' && (
        <div className="llm-status-banner">
          <Info size={16} className="status-banner-icon" />
          <span>{llmMessage}</span>
        </div>
      )}

      {/* Card 1: Core Thematic Profile */}
      <div className="understanding-card topic-card">
        <div className="topic-grid">
          <div className="topic-field">
            <label className="field-label">Document Title</label>
            {isEditing ? (
              <input
                type="text"
                className="input-text-edit"
                value={safeText(formData.title)}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Enter title..."
              />
            ) : (
              <h3 className="topic-title">{safeText(formData.title) || 'Untitled Document'}</h3>
            )}
          </div>

          <div className="topic-field">
            <label className="field-label">Main Topic</label>
            {isEditing ? (
              <input
                type="text"
                className="input-text-edit"
                value={safeText(formData.main_topic)}
                onChange={(e) => handleFieldChange('main_topic', e.target.value)}
                placeholder="Enter main topic..."
              />
            ) : (
              <span className="topic-badge">{safeText(formData.main_topic) || 'General Overview'}</span>
            )}
          </div>

          <div className="topic-field field-span-2">
            <label className="field-label">Communication Objective</label>
            {isEditing ? (
              <input
                type="text"
                className="input-text-edit"
                value={safeText(formData.communication_objective)}
                onChange={(e) => handleFieldChange('communication_objective', e.target.value)}
                placeholder="Primary objective..."
              />
            ) : (
              <div className="objective-box">
                <Target size={16} className="objective-icon" />
                <span>{safeText(formData.communication_objective) || 'Inform and align stakeholders'}</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Summary Box */}
        <div className="ai-summary-box">
          <label className="field-label">AI Summary (Source Digest)</label>
          {isEditing ? (
            <textarea
              className="textarea-edit"
              rows={3}
              value={safeText(formData.summary)}
              onChange={(e) => handleFieldChange('summary', e.target.value)}
              placeholder="Factual summary..."
            />
          ) : (
            <p className="summary-paragraph">{safeText(formData.summary) || 'No summary available.'}</p>
          )}
        </div>
      </div>

      {/* Card 2: Key Points & Key Facts Dual Grid */}
      <div className="nlp-dual-grid">
        {/* Key Points */}
        <div className="understanding-card">
          <div className="card-header-inner">
            <div className="card-header-left">
              <ListChecks size={18} className="card-header-icon" />
              <h3 className="card-inner-title">Key Points ({formData.key_points?.length || 0})</h3>
            </div>
            {isEditing && (
              <button
                type="button"
                className="btn-add-item"
                onClick={() => handleAddArrayItem('key_points')}
              >
                <Plus size={13} /> Add Point
              </button>
            )}
          </div>

          <div className="bullet-cards-stack">
            {(formData.key_points || []).map((point, idx) => (
              <div key={idx} className="bullet-card">
                <span className="bullet-number">{idx + 1}</span>
                {isEditing ? (
                  <div className="edit-row-inline">
                    <input
                      type="text"
                      className="input-text-edit"
                      value={safeText(point)}
                      onChange={(e) => handleArrayItemChange('key_points', idx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => handleRemoveArrayItem('key_points', idx)}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="bullet-content">{safeText(point)}</span>
                )}
              </div>
            ))}
            {(!formData.key_points || formData.key_points.length === 0) && (
              <p className="empty-subtext">No key points extracted.</p>
            )}
          </div>
        </div>

        {/* Key Facts */}
        <div className="understanding-card">
          <div className="card-header-inner">
            <div className="card-header-left">
              <FileCheck size={18} className="card-header-icon" />
              <h3 className="card-inner-title">Key Facts ({formData.key_facts?.length || 0})</h3>
            </div>
            {isEditing && (
              <button
                type="button"
                className="btn-add-item"
                onClick={() => handleAddArrayItem('key_facts')}
              >
                <Plus size={13} /> Add Fact
              </button>
            )}
          </div>

          <div className="bullet-cards-stack">
            {(formData.key_facts || []).map((fact, idx) => (
              <div key={idx} className="bullet-card fact-card-border">
                <span className="bullet-dot"></span>
                {isEditing ? (
                  <div className="edit-row-inline">
                    <input
                      type="text"
                      className="input-text-edit"
                      value={safeText(fact)}
                      onChange={(e) => handleArrayItemChange('key_facts', idx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => handleRemoveArrayItem('key_facts', idx)}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="bullet-content">{safeText(fact)}</span>
                )}
              </div>
            ))}
            {(!formData.key_facts || formData.key_facts.length === 0) && (
              <p className="empty-subtext">No key facts specified.</p>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Structured Entities Grid (Dates, Numbers, People, Locations) */}
      <div className="understanding-card">
        <div className="card-header-inner">
          <div className="card-header-left">
            <Users size={18} className="card-header-icon" />
            <h3 className="card-inner-title">Extracted Entities & Ground Truth</h3>
          </div>
          <span className="method-pill">Factual Entities</span>
        </div>

        <div className="entities-four-col-grid">
          {/* People */}
          <div className="entity-col">
            <span className="entity-col-title">
              <Users size={14} /> People & Roles ({formData.people?.length || 0})
            </span>
            <div className="entity-chips-wrap">
              {(formData.people || []).map((p, i) => (
                <span key={i} className="info-chip chip-email">{safeText(p)}</span>
              ))}
              {(!formData.people || formData.people.length === 0) && (
                <span className="info-none">— None explicitly named</span>
              )}
            </div>
          </div>

          {/* Locations */}
          <div className="entity-col">
            <span className="entity-col-title">
              <MapPin size={14} /> Locations / Orgs ({formData.locations?.length || 0})
            </span>
            <div className="entity-chips-wrap">
              {(formData.locations || []).map((loc, i) => (
                <span key={i} className="info-chip chip-url">{safeText(loc)}</span>
              ))}
              {(!formData.locations || formData.locations.length === 0) && (
                <span className="info-none">— None specified</span>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="entity-col">
            <span className="entity-col-title">
              <Calendar size={14} /> Dates ({formData.dates?.length || 0})
            </span>
            <div className="entity-chips-wrap">
              {(formData.dates || []).map((d, i) => (
                <span key={i} className="info-chip chip-date">{safeText(d)}</span>
              ))}
              {(!formData.dates || formData.dates.length === 0) && (
                <span className="info-none">— None recorded</span>
              )}
            </div>
          </div>

          {/* Numbers */}
          <div className="entity-col">
            <span className="entity-col-title">
              <Hash size={14} /> Numbers & Metrics ({formData.numbers?.length || 0})
            </span>
            <div className="entity-chips-wrap">
              {(formData.numbers || []).map((num, i) => (
                <span key={i} className="info-chip chip-number">{safeText(num)}</span>
              ))}
              {(!formData.numbers || formData.numbers.length === 0) && (
                <span className="info-none">— None recorded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Required Actions & Warnings */}
      <div className="nlp-dual-grid">
        {/* Required Actions */}
        <div className="understanding-card">
          <div className="card-header-inner">
            <div className="card-header-left">
              <ListChecks size={18} className="card-header-icon" />
              <h3 className="card-inner-title">Actions Required ({formData.actions_required?.length || 0})</h3>
            </div>
            {isEditing && (
              <button
                type="button"
                className="btn-add-item"
                onClick={() => handleAddArrayItem('actions_required')}
              >
                <Plus size={13} /> Add Action
              </button>
            )}
          </div>

          <div className="bullet-cards-stack">
            {(formData.actions_required || []).map((act, idx) => (
              <div key={idx} className="action-item-card">
                <span className="action-check-badge">✓</span>
                {isEditing ? (
                  <div className="edit-row-inline">
                    <input
                      type="text"
                      className="input-text-edit"
                      value={safeText(act)}
                      onChange={(e) => handleArrayItemChange('actions_required', idx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => handleRemoveArrayItem('actions_required', idx)}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="action-text">{safeText(act)}</span>
                )}
              </div>
            ))}
            {(!formData.actions_required || formData.actions_required.length === 0) && (
              <p className="empty-subtext">No explicit actions required by source.</p>
            )}
          </div>
        </div>

        {/* Warnings */}
        <div className="understanding-card">
          <div className="card-header-inner">
            <div className="card-header-left">
              <AlertTriangle size={18} className="warning-icon-red" />
              <h3 className="card-inner-title">Warnings & Restrictions ({formData.warnings?.length || 0})</h3>
            </div>
            {isEditing && (
              <button
                type="button"
                className="btn-add-item"
                onClick={() => handleAddArrayItem('warnings')}
              >
                <Plus size={13} /> Add Warning
              </button>
            )}
          </div>

          <div className="bullet-cards-stack">
            {(formData.warnings || []).map((warn, idx) => (
              <div key={idx} className="warning-item-card">
                <AlertTriangle size={16} className="warning-callout-icon" />
                {isEditing ? (
                  <div className="edit-row-inline">
                    <input
                      type="text"
                      className="input-text-edit"
                      value={safeText(warn)}
                      onChange={(e) => handleArrayItemChange('warnings', idx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => handleRemoveArrayItem('warnings', idx)}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="warning-text">{safeText(warn)}</span>
                )}
              </div>
            ))}
            {(!formData.warnings || formData.warnings.length === 0) && (
              <p className="empty-subtext">No warnings or restrictive caveats noted.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
