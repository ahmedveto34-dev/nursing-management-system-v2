const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');
code = code.replace(/          <div>\n          <div>/g, "          <div>");
fs.writeFileSync('src/components/AdmissionsView.tsx', code);
