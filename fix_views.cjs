const fs = require('fs');

const views = [
  {
    file: 'src/components/AdmissionsView.tsx',
    payloadTypeKey: 'type'
  },
  {
    file: 'src/components/BedsoresView.tsx',
    payloadTypeKey: 'stage'
  },
  {
    file: 'src/components/InfectionsView.tsx',
    payloadTypeKey: 'infectionType'
  },
  {
    file: 'src/components/FallsView.tsx',
    payloadTypeKey: 'riskAssessment'
  },
  {
    file: 'src/components/CardiacView.tsx',
    payloadTypeKey: 'outcome'
  }
];

views.forEach(v => {
  let content = fs.readFileSync(v.file, 'utf8');

  // Fix form.reset issue
  content = content.replace(/const formData = new FormData\(e\.currentTarget\);/g, 'const form = e.target as HTMLFormElement;\n    const formData = new FormData(form);');
  content = content.replace(/const formData = new FormData\(form\);/g, 'const form = e.target as HTMLFormElement;\n    const formData = new FormData(form);');
  content = content.replace(/const form = e\.currentTarget;\s*const form = e\.target as HTMLFormElement;/g, 'const form = e.target as HTMLFormElement;');

  // Add patientName to payload
  content = content.replace(/patientId:\s*formData\.get\('patientId'\),/, 'patientId: formData.get(\'patientId\') as string,\n      patientName: formData.get(\'patientName\') as string,');
  
  // Add duplicate check before add...
  const checkCode = `
    const isDuplicate = data.some(item => item.patientId === payload.patientId && item.${v.payloadTypeKey} === payload.${v.payloadTypeKey});
    if (isDuplicate) {
      if (!window.confirm(translate('duplicateWarning'))) {
        setSubmitting(false);
        return;
      }
    }
  `;
  // find try {
  content = content.replace(/try\s*\{/, checkCode + '\n    try {');

  // Add patientName input
  const nameInput = `
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('patientName')}</label>
            <input required name="patientName" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>`;
  content = content.replace(/<input required name="patientId".*?\/>\s*<\/div>/, '$&\n' + nameInput);

  // Add patientName table header
  content = content.replace(/<th className="p-4 font-medium">{translate\('patientId'\)}<\/th>/, '$&\n                <th className="p-4 font-medium">{translate(\'patientName\')}</th>');

  // Add patientName table cell
  content = content.replace(/<td className="p-4 font-medium">{item\.patientId}<\/td>/, '$&\n                    <td className="p-4">{item.patientName || \'-\'}</td>');

  fs.writeFileSync(v.file, content);
});
