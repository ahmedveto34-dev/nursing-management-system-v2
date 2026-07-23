const fs = require('fs');
const views = ['BedsoresView.tsx', 'InfectionsView.tsx', 'FallsView.tsx', 'CardiacView.tsx', 'RRTView.tsx'];

for (const view of views) {
  const filePath = `src/components/${view}`;
  if (!fs.existsSync(filePath)) continue;
  let code = fs.readFileSync(filePath, 'utf8');

  code = code.replace(
    `const patientRecords = data.filter(d => d.patientId === id);`,
    `const patientRecords = data.filter(d => String(d.patientId) === String(id));`
  );

  fs.writeFileSync(filePath, code);
}
