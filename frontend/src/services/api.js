/**
 * ContentForge AI - Centralized Frontend API Service
 */
const API_BASE_URL = 'http://127.0.0.1:8000';

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data?.error || 'Login failed.');
  return data;
}

export async function registerUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data?.error || 'Registration failed.');
  return data;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data?.error || 'Failed to upload and extract document');
  }
  return data;
}

export async function analyzeContent(text) {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data?.error || 'Unable to analyze the content. Please try again.');
  }
  return {
    analysis: data.analysis,
    structured_content: data.structured_content,
    llm_status: data.llm_status,
    llm_message: data.llm_message,
  };
}

export async function generateContent({ text, format, formats, controls = {} }) {
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      format,
      formats,
      audience: controls.audience || 'General',
      tone: controls.tone || 'Professional',
      language: controls.language || 'English',
      length: controls.length || 'Medium',
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data?.error || 'Failed to transform content. Please try again.');
  }

  return data;
}

export function getDownloadUrl(fileId) {
  return `${API_BASE_URL}/api/download/${fileId}`;
}

