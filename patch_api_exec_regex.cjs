const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  `  if (API_URL && !API_URL.endsWith('/exec')) {
    if (API_URL.endsWith('/')) {
      API_URL = API_URL + 'exec';
    } else {
      API_URL = API_URL + '/exec';
    }
  }`,
  `  if (API_URL && API_URL.includes('/macros/s/')) {
    const match = API_URL.match(/(https:\\/\\/script\\.google\\.com\\/macros\\/s\\/[a-zA-Z0-9-_]+)/);
    if (match) {
      API_URL = match[1] + '/exec';
    }
  }`
);

fs.writeFileSync('src/lib/api.ts', code);
