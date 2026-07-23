const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

// Fix 1: compare string representations of IDs
code = code.replace(
  `const patientRecords = data.filter(d => d.patientId === id);`,
  `const patientRecords = data.filter(d => String(d.patientId) === String(id));`
);

// Fix 2: date display in table (desktop)
code = code.replace(
  `<td className="p-4 text-sm">{item.admissionDate || item.date || '-'}</td>`,
  `<td className="p-4 text-sm whitespace-nowrap">{formatDate(item.admissionDate || item.date)}</td>`
);

// Fix 3: date display in table (mobile)
code = code.replace(
  `{item.admissionDate || item.date || '-'}`,
  `{formatDate(item.admissionDate || item.date)}`
);

// Add formatDate helper
code = code.replace(
  `  const calculateLOS = (admDateStr: string, disDateStr: string) => {`,
  `  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return format(d, 'yyyy-MM-dd HH:mm');
    } catch (e) {
      return dateStr;
    }
  };

  const calculateLOS = (admDateStr: string, disDateStr: string) => {`
);

fs.writeFileSync('src/components/AdmissionsView.tsx', code);
