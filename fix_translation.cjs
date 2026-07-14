const fs = require('fs');

const views = [
  'src/components/BedsoresView.tsx',
  'src/components/InfectionsView.tsx',
  'src/components/FallsView.tsx',
  'src/components/CardiacView.tsx'
];

views.forEach(v => {
  let content = fs.readFileSync(v.file || v, 'utf8');

  if (!content.includes("useLanguage")) {
    content = content.replace(
      "import { Loader2 } from 'lucide-react';",
      "import { Loader2 } from 'lucide-react';\nimport { useLanguage } from '../lib/LanguageContext';"
    );
    
    content = content.replace(
      "const [submitting, setSubmitting] = useState(false);",
      "const [submitting, setSubmitting] = useState(false);\n  const { translate } = useLanguage();"
    );
  }

  fs.writeFileSync(v.file || v, content);
});
