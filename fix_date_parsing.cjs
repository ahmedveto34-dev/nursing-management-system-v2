const fs = require('fs');
let content = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

content = content.replace(
  "const dischargeDate = parse(dischargeDateStr, 'yyyy-MM-dd HH:mm', new Date());",
  "const dischargeDate = new Date(dischargeDateStr);"
);

content = content.replace(
  "const admDate = parse(adm.date, 'yyyy-MM-dd HH:mm', new Date());",
  "const admDate = new Date(adm.date);"
);

content = content.replace(
  "const admDate = parse(closestAdmis.date, 'yyyy-MM-dd HH:mm', new Date());",
  "const admDate = new Date(closestAdmis.date);"
);

fs.writeFileSync('src/components/AdmissionsView.tsx', content);
