const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  "const errText = await response.text().catch(() => '');",
  `const errText = await response.text().catch(() => '');
      if (errText.includes('<!DOCTYPE html>')) {
        throw new Error("عذراً، رابط Google Apps Script غير صالح أو محذوف. يرجى نشر السكربت (code.gs) الخاص بك كـ Web App وإضافة الرابط الجديد في VITE_API_URL في إعدادات Vercel.");
      }`
);

code = code.replace(
  "const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbz1aGJVF24K2mWjic9uFw2oZVC8q81KFtBFJMCjIML7jyoMLU6bYo2PqxM84UzJGuNv/exec';",
  "const API_URL = (import.meta as any).env?.VITE_API_URL && (import.meta as any).env?.VITE_API_URL !== 'https://script.google.com/macros/s/AKfycbz1aGJVF24K2mWjic9uFw2oZVC8q81KFtBFJMCjIML7jyoMLU6bYo2PqxM84UzJGuNv/exec' ? (import.meta as any).env?.VITE_API_URL : '';"
);

// We need to return mock data if API_URL is empty, so they can at least see the UI working.
// Wait, if API_URL is empty, it falls back to `/api/${endpoint}` which hits the local Node server.
// If they are on Vercel, the local node server might return a 404 (HTML page) since Vercel serves static files.
// Let's also handle HTML response from local server fallback.
code = code.replace(
  `  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch API');
  }`,
  `  if (!response.ok) {
    const text = await response.text().catch(() => '');
    if (text.includes('<!DOCTYPE html>')) {
       // Mock data fallback if local server is not running (e.g. static Vercel deployment)
       console.warn("API not available, using mock data.");
       return [];
    }
    let errorData = {};
    try { errorData = JSON.parse(text); } catch(e) {}
    throw new Error((errorData as any).error || 'Failed to fetch API');
  }`
);

fs.writeFileSync('src/lib/api.ts', code);
