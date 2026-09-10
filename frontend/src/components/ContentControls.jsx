import React from 'react';
import { Users, Sparkles, Globe, AlignLeft, ChevronDown } from 'lucide-react';

export default function ContentControls({ controls, onChange }) {
  const options = {
    audience: [
      { value: 'Student', label: 'Student' },
      { value: 'Employee', label: 'Employee' },
      { value: 'Public', label: 'Public' },
    ],
    tone: [
      { value: 'Formal', label: 'Formal' },
      { value: 'Simple', label: 'Simple' },
      { value: 'Professional', label: 'Professional' },
      { value: 'Friendly', label: 'Friendly' },
    ],
    language: [
      { value: 'English', label: 'English' },
      { value: 'Tamil', label: 'Tamil' },
    ],
    length: [
      { value: 'Short', label: 'Short' },
      { value: 'Medium', label: 'Medium' },
      { value: 'Detailed', label: 'Detailed' },
    ],
  };

  const handleChange = (key, value) => {
    onChange({
      ...controls,
      [key]: value,
    });
  };

  return (
    <div className="controls-card">
      <div className="section-header-row">
        <h2 className="section-title">Content Controls</h2>
        <span className="section-helper-pill">Output Tuning</span>
      </div>

      <div className="controls-grid">
        {/* Audience Control */}
        <div className="control-field">
          <label htmlFor="select-audience" className="control-label">
            <span className="control-label-left">
              <Users size={16} className="control-icon" />
              <span>Target Audience</span>
            </span>
          </label>
          <div className="select-wrapper">
            <select
              id="select-audience"
              className="custom-select"
              value={controls.audience}
              onChange={(e) => handleChange('audience', e.target.value)}
            >
              {options.audience.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-arrow" />
          </div>
        </div>

        {/* Tone Control */}
        <div className="control-field">
          <label htmlFor="select-tone" className="control-label">
            <span className="control-label-left">
              <Sparkles size={16} className="control-icon" />
              <span>Communication Tone</span>
            </span>
          </label>
          <div className="select-wrapper">
            <select
              id="select-tone"
              className="custom-select"
              value={controls.tone}
              onChange={(e) => handleChange('tone', e.target.value)}
            >
              {options.tone.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-arrow" />
          </div>
        </div>

        {/* Language Control */}
        <div className="control-field">
          <label htmlFor="select-language" className="control-label">
            <span className="control-label-left">
              <Globe size={16} className="control-icon" />
              <span>Output Language</span>
            </span>
          </label>
          <div className="select-wrapper">
            <select
              id="select-language"
              className="custom-select"
              value={controls.language}
              onChange={(e) => handleChange('language', e.target.value)}
            >
              {options.language.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-arrow" />
          </div>
        </div>

        {/* Length Control */}
        <div className="control-field">
          <label htmlFor="select-length" className="control-label">
            <span className="control-label-left">
              <AlignLeft size={16} className="control-icon" />
              <span>Content Length</span>
            </span>
          </label>
          <div className="select-wrapper">
            <select
              id="select-length"
              className="custom-select"
              value={controls.length}
              onChange={(e) => handleChange('length', e.target.value)}
            >
              {options.length.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
}
