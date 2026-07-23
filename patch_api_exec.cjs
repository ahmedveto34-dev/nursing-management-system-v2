const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  `const API_URL = (import.meta as any).env?.VITE_API_URL && (import.meta as any).env?.VITE_API_URL !== 'https://script.google.com/macros/s/AKfycbz1aGJVF24K2mWjic9uFw2oZVC8q81KFtBFJMCjIML7jyoMLU6bYo2PqxM84UzJGuNv/exec' ? (import.meta as any).env?.VITE_API_URL : '';`,
  `let API_URL = (import.meta as any).env?.VITE_API_URL && (import.meta as any).env?.VITE_API_URL !== 'https://script.google.com/macros/s/AKfycbz1aGJVF24K2mWjic9uFw2oZVC8q81KFtBFJMCjIML7jyoMLU6bYo2PqxM84UzJGuNv/exec' ? (import.meta as any).env?.VITE_API_URL : '';
  if (API_URL && !API_URL.endsWith('/exec')) {
    if (API_URL.endsWith('/')) {
      API_URL = API_URL + 'exec';
    } else {
      API_URL = API_URL + '/exec';
    }
  }`
);

fs.writeFileSync('src/lib/api.ts', code);
