const fs = require('fs');
const views = ['AdmissionsView.tsx', 'BedsoresView.tsx', 'InfectionsView.tsx', 'FallsView.tsx', 'CardiacView.tsx', 'RRTView.tsx'];

for (const view of views) {
  const filePath = `src/components/${view}`;
  if (!fs.existsSync(filePath)) continue;
  let code = fs.readFileSync(filePath, 'utf8');

  // Change handleSubmit to instantly update local state and avoid await loadData()
  if (view === 'AdmissionsView.tsx') {
    code = code.replace(/await addAdmission\(payload\);/, `
        addAdmission(payload).catch(err => {
          console.error(err);
          // Optional: handle failure
        });
        setData(prev => [...prev, { ...payload, id: Date.now().toString() }]);
`);
    code = code.replace(/await dischargePatient\(payload\);/, `
        dischargePatient(payload).catch(err => {
          console.error(err);
        });
        setData(prev => prev.map(d => String(d.patientId).trim() === String(payload.patientId).trim() && !d.dischargeDate ? { ...d, ...payload, status: 'خروج' } : d));
`);
    code = code.replace(/await loadData\(\);/, `// loadData(); // Removed to speed up UI`);
  } else {
    // For other views:
    const functionNameMatch = code.match(/await (add[A-Za-z]+)\(payload\);/);
    if (functionNameMatch) {
      const addFunc = functionNameMatch[1];
      code = code.replace(new RegExp(`await ${addFunc}\\(payload\\);`), `
        ${addFunc}(payload).catch(err => {
          console.error(err);
        });
        setData(prev => [...prev, { ...payload, id: Date.now().toString() }]);
`);
      code = code.replace(/await loadData\(\);/, `// loadData(); // Removed to speed up UI`);
    }
  }
  
  // Also speed up loading animation by hiding it immediately when submitting?
  // We already removed `await loadData()` so it doesn't even trigger loading.
  
  // Luxury styling in views
  code = code.replace(/bg-indigo-600/g, 'bg-emerald-600');
  code = code.replace(/hover:bg-indigo-700/g, 'hover:bg-emerald-700');
  code = code.replace(/text-indigo-600/g, 'text-emerald-600');
  code = code.replace(/ring-indigo-500/g, 'ring-emerald-500');
  code = code.replace(/bg-indigo-50/g, 'bg-emerald-50');
  code = code.replace(/text-indigo-700/g, 'text-emerald-700');

  fs.writeFileSync(filePath, code);
}
