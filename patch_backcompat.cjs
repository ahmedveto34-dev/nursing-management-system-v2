const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

code = code.replace(
  `      const isCurrentlyAdmitted = patientRecords.some(d => (!d.dischargeDate || d.dischargeDate === '') && (d.status === 'دخول' || d.type === 'دخول' || d.type === 'Admission'));`,
  `      const isCurrentlyAdmitted = patientRecords.some(d => (!d.dischargeDate || d.dischargeDate === '') && (d.status === 'دخول' || d.type === 'دخول' || d.type === 'Admission' || (!d.status && !d.type)));`
);

code = code.replace(
  `  const activeAdmissions = data.filter(d => (!d.dischargeDate || d.dischargeDate === '') && (d.status === 'دخول' || d.type === 'دخول' || d.type === 'Admission'));`,
  `  const activeAdmissions = data.filter(d => (!d.dischargeDate || d.dischargeDate === '') && (d.status === 'دخول' || d.type === 'دخول' || d.type === 'Admission' || (!d.status && !d.type)));`
);

code = code.replace(
  `        const payload = {
          admissionDate: dateStr,
          patientId: formData.get('patientId') as string,
          patientName: formData.get('patientName') as string,
          ward: formData.get('ward'),
          status: 'دخول'
        };`,
  `        const payload = {
          admissionDate: dateStr,
          date: dateStr, // For backward compatibility with old script
          patientId: formData.get('patientId') as string,
          patientName: formData.get('patientName') as string,
          ward: formData.get('ward'),
          status: 'دخول',
          type: 'دخول' // For backward compatibility with old script
        };`
);

fs.writeFileSync('src/components/AdmissionsView.tsx', code);
