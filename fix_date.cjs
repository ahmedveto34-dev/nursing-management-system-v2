const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

const target = `    const formData = new FormData(form);
    const payload = {
      date: format(new Date(), 'yyyy-MM-dd HH:mm'),
      patientId: formData.get('patientId') as string,`;

const replacement = `    const formData = new FormData(form);
    
    const rawDate = formData.get('date') as string;
    const dateObj = rawDate ? new Date(rawDate) : new Date();

    const payload = {
      date: format(dateObj, 'yyyy-MM-dd HH:mm'),
      patientId: formData.get('patientId') as string,`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdmissionsView.tsx', code);
