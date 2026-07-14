const fs = require('fs');

const views = [
  { file: 'src/components/AdmissionsView.tsx', payloadTypeKey: 'type' },
  { file: 'src/components/BedsoresView.tsx', payloadTypeKey: 'stage' },
  { file: 'src/components/InfectionsView.tsx', payloadTypeKey: 'infectionType' },
  { file: 'src/components/FallsView.tsx', payloadTypeKey: 'riskAssessment' },
  { file: 'src/components/CardiacView.tsx', payloadTypeKey: 'outcome' }
];

views.forEach(v => {
  let content = fs.readFileSync(v.file, 'utf8');

  // Remove the badly inserted code from loadData
  const badCodeRegex = new RegExp(`[ \\t]*const isDuplicate = data\\.some\\(item => item\\.patientId === payload\\.patientId && item\\.${v.payloadTypeKey} === payload\\.${v.payloadTypeKey}\\);\\s*if \\(isDuplicate\\) \\{\\s*if \\(!window\\.confirm\\(translate\\('duplicateWarning'\\)\\)\\) \\{\\s*setSubmitting\\(false\\);\\s*return;\\s*\\}\\s*\\}\\s*`);
  
  content = content.replace(badCodeRegex, '');

  // Insert it before await add...(payload);
  const addRegex = new RegExp(`await add[A-Za-z]+\\(payload\\);`);
  const checkCode = `
      const isDuplicate = data.some(item => item.patientId === payload.patientId && item.${v.payloadTypeKey} === payload.${v.payloadTypeKey});
      if (isDuplicate) {
        if (!window.confirm(translate('duplicateWarning'))) {
          setSubmitting(false);
          return;
        }
      }

      `;
  
  // replace await add with the check + await add
  content = content.replace(addRegex, match => checkCode + match);

  fs.writeFileSync(v.file, content);
});
