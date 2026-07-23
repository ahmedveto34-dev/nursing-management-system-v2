const fs = require('fs');
let content = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

content = content.replace(
  /const dischargeDate = new Date\(dischargeDateStr\);/g,
  "const dischargeDate = new Date(dischargeDateStr.replace(' ', 'T'));"
);

content = content.replace(
  /const admDate = new Date\(adm\.date\);/g,
  "const admDate = new Date(adm.date.replace(' ', 'T'));"
);

content = content.replace(
  /const admDate = new Date\(closestAdmis\.date\);/g,
  "const admDate = new Date(closestAdmis.date.replace(' ', 'T'));"
);

fs.writeFileSync('src/components/AdmissionsView.tsx', content);
