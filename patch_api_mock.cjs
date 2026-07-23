const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  `       return [];`,
  `       if (options.method === 'POST') return { success: true };
       return [];`
);

fs.writeFileSync('src/lib/api.ts', code);
