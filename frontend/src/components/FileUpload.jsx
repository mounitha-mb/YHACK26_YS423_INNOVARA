import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileCheck, 
  Trash2, 
  Image as ImageIcon, 
  File, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

import { uploadDocument } from '../services/api';

export default function FileUpload({ 
  file, 
  onExtractionSuccess, 
  onFileRemove,
  isProcessing,
  setIsProcessing
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgressState, setUploadProgressState] = useState('idle'); // idle | uploading | processing | success | error
  const fileInputRef = useRef(null);

  const allowedExtensions = ['.pdf', '.txt', '.png', '.jpg', '.jpeg'];
  const allowedMimeTypes = [
    'application/pdf',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    if (selectedFile.size === 0) {
      setErrorMessage("Uploaded file is empty (0 bytes). Please select a valid document.");
      setUploadProgressState('error');
      return false;
    }

    const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
    if (selectedFile.size > MAX_SIZE_BYTES) {
      const mb = (selectedFile.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`File size exceeds 25MB limit (${mb}MB). Please upload a smaller file.`);
      setUploadProgressState('error');
      return false;
    }

    const extension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    const isValidExt = allowedExtensions.includes(extension);
    const isValidMime = allowedMimeTypes.includes(selectedFile.type);

    if (!isValidExt && !isValidMime) {
      setErrorMessage(`Unsupported format '${extension}'. Please upload PDF, TXT, PNG, JPG, or JPEG.`);
      setUploadProgressState('error');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const uploadAndExtract = async (targetFile) => {
    if (!validateFile(targetFile)) return;

    setErrorMessage('');
    setIsProcessing(true);
    setUploadProgressState('uploading');

    try {
      // Transition to processing state after small delay for smooth visual feedback
      const progressTimer = setTimeout(() => {
        setUploadProgressState('processing');
      }, 350);

      const data = await uploadDocument(targetFile);

      clearTimeout(progressTimer);
      setUploadProgressState('success');
      setIsProcessing(false);
      onExtractionSuccess(targetFile, data);

    } catch (err) {
      console.error('Extraction upload error:', err);
      setErrorMessage(err.message || 'Unable to process this file. Please ensure backend is running.');
      setUploadProgressState('error');
      setIsProcessing(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      uploadAndExtract(droppedFile);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const chosenFile = e.target.files[0];
      uploadAndExtract(chosenFile);
      // Reset input value so same file can be re-uploaded if desired
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    setUploadProgressState('idle');
    setErrorMessage('');
    onFileRemove();
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      return <ImageIcon size={28} className="file-preview-icon image-type" />;
    } else if (ext === 'pdf') {
      return <FileText size={28} className="file-preview-icon pdf-type" />;
    } else if (ext === 'txt') {
      return <FileText size={28} className="file-preview-icon txt-type" />;
    }
    return <File size={28} className="file-preview-icon generic-type" />;
  };

  return (
    <section className="upload-section-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.txt,.png,.jpg,.jpeg"
        className="file-hidden-input"
        id="content-file-input"
      />

      {!file ? (
        <div
          className={`upload-dropzone ${isDragging ? 'dropzone-active' : ''} ${isProcessing ? 'dropzone-loading' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current && fileInputRef.current.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isProcessing) {
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload source content dropzone"
        >
          {isProcessing ? (
            <div className="upload-loading-box">
              <Loader2 size={42} className="spinner-icon" />
              <p className="loading-state-title">
                {uploadProgressState === 'uploading' ? 'Uploading...' : 'Extracting content...'}
              </p>
              <span className="loading-subtext">Parsing document structure and text tokens</span>
            </div>
          ) : (
            <>
              <div className="upload-icon-circle">
                <UploadCloud size={36} className="upload-cloud-icon" />
              </div>

              <div className="upload-content-text">
                <h3 className="upload-main-heading">Upload your source content</h3>
                <p className="upload-subtext">PDF, TXT or image files</p>
              </div>

              <div className="upload-actions">
                <button
                  type="button"
                  className="btn-upload-browse"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <UploadCloud size={16} />
                  <span>Choose File</span>
                </button>
              </div>

              <div className="supported-formats-pills">
                <span className="format-pill">PDF</span>
                <span className="format-pill">TXT</span>
                <span className="format-pill">PNG</span>
                <span className="format-pill">JPG</span>
                <span className="format-pill">JPEG</span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="selected-file-card">
          <div className="selected-file-info">
            <div className="file-icon-badge">
              {getFileIcon(file.name)}
            </div>
            <div className="file-details">
              <div className="file-name-row">
                <span className="file-name" title={file.name}>{file.name}</span>
                {uploadProgressState === 'processing' || uploadProgressState === 'uploading' ? (
                  <span className="file-badge-processing">
                    <Loader2 size={12} className="spinner-icon-sm" />
                    {uploadProgressState === 'uploading' ? 'Uploading...' : 'Extracting content...'}
                  </span>
                ) : (
                  <span className="file-badge-success">
                    <CheckCircle2 size={14} />
                    Content extracted successfully
                  </span>
                )}
              </div>
              <div className="file-meta">
                <span>{formatFileSize(file.size)}</span>
                <span className="meta-separator">•</span>
                <span className="file-ext-tag">{file.name.split('.').pop().toUpperCase()}</span>
                <span className="meta-separator">•</span>
                <span className="file-status-indicator">Ready in Source Content</span>
              </div>
            </div>
          </div>

          <div className="selected-file-actions">
            <button
              type="button"
              className="btn-change-file"
              onClick={() => fileInputRef.current?.click()}
              title="Upload another file"
              disabled={isProcessing}
            >
              Replace
            </button>
            <button
              type="button"
              className="btn-remove-file"
              onClick={handleRemove}
              aria-label="Remove selected file"
              title="Remove file"
              disabled={isProcessing}
            >
              <Trash2 size={16} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="upload-error-banner" role="alert">
          <AlertCircle size={18} className="error-icon-flex" />
          <div className="error-text-wrap">
            <strong className="error-strong">Unable to process this file: </strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
    </section>
  );
}
