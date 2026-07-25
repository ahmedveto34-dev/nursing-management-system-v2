const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { Toast }')) {
  code = code.replace("import { useLanguage } from './lib/LanguageContext';", "import { useLanguage } from './lib/LanguageContext';\nimport { Toast } from './components/Toast';");
}

if (!code.includes('<Toast />')) {
  code = code.replace('</div>\n    </div>\n  );', '  <Toast />\n    </div>\n    </div>\n  );');
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for Toast");
