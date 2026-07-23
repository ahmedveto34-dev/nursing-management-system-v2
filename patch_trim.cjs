const fs = require('fs');
const views = ['AdmissionsView.tsx', 'BedsoresView.tsx', 'InfectionsView.tsx', 'FallsView.tsx', 'CardiacView.tsx', 'RRTView.tsx'];

for (const view of views) {
  const filePath = `src/components/${view}`;
  if (!fs.existsSync(filePath)) continue;
  let code = fs.readFileSync(filePath, 'utf8');

  code = code.replace(
    `const patientRecords = data.filter(d => String(d.patientId) === String(id));`,
    `const patientRecords = data.filter(d => String(d.patientId).trim() === String(id).trim());`
  );

  fs.writeFileSync(filePath, code);
}
