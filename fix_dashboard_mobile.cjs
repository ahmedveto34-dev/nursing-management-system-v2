const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  `<div className="grid grid-cols-2 gap-8 mt-8">`,
  `<div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">`
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
