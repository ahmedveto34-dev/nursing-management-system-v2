const fs = require('fs');
let code = fs.readFileSync('src/components/ArchiveView.tsx', 'utf8');

// Rename component
code = code.replace(/export default function AdmissionsView/g, "export default function ArchiveView");

// Remove forms
code = code.replace(/<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">[\s\S]*?<\/form>\s*<\/div>/, "");

// We don't need handlePatientIdChange, handleSubmit, etc., but we can just leave them or strip them. Let's strip them to avoid unused vars.
// Also we need to change activeAdmissions filter
code = code.replace(/const activeAdmissions = data\.filter\(item => !item\.dischargeDate\);/g, "const activeAdmissions = data.filter(item => !!item.dischargeDate);");

fs.writeFileSync('src/components/ArchiveView.tsx', code);
