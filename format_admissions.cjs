const fs = require('fs');
let content = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

content = content.replace(
  "import { format } from 'date-fns';",
  "import { format, differenceInDays, differenceInHours, parse } from 'date-fns';"
);

const calcCode = `
  const calculateLOS = (patientId: string, dischargeDateStr: string) => {
    const admissions = data.filter(d => 
      d.patientId === patientId && 
      (d.type === translate('admission') || d.type === 'دخول' || d.type === 'Admission')
    );
    
    if (admissions.length === 0) return '-';

    const dischargeDate = parse(dischargeDateStr, 'yyyy-MM-dd HH:mm', new Date());
    
    let closestAdmis: any = null;
    let minDiff = Infinity;
    
    for (const adm of admissions) {
      const admDate = parse(adm.date, 'yyyy-MM-dd HH:mm', new Date());
      const diff = dischargeDate.getTime() - admDate.getTime();
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        closestAdmis = adm;
      }
    }

    if (!closestAdmis) return '-';

    const admDate = parse(closestAdmis.date, 'yyyy-MM-dd HH:mm', new Date());
    const days = differenceInDays(dischargeDate, admDate);
    const hours = differenceInHours(dischargeDate, admDate) % 24;

    if (days === 0 && hours === 0) return \`< 1 \${translate('hours')}\`;
    
    let res = '';
    if (days > 0) res += \`\${days} \${translate('days')} \`;
    if (hours > 0) res += \`\${hours} \${translate('hours')}\`;
    
    return res.trim();
  };
`;

content = content.replace("  const handleSubmit = async", calcCode + "\n  const handleSubmit = async");

// add column header
content = content.replace(
  "<th className=\"p-4 font-medium\">{translate('type')}</th>",
  "<th className=\"p-4 font-medium\">{translate('type')}</th>\n                <th className=\"p-4 font-medium\">{translate('lengthOfStay')}</th>"
);

// update colspan
content = content.replace(/colSpan=\{5\}/g, "colSpan={6}");

// add column data
const cellHtml = `
                    <td className="p-4">
                      {item.type === translate('discharge') || item.type === 'خروج' || item.type === 'Discharge' ? calculateLOS(item.patientId, item.date) : '-'}
                    </td>
                  </tr>
`;

content = content.replace(
  "</span>\n                    </td>\n                  </tr>",
  "</span>\n                    </td>" + cellHtml
);

fs.writeFileSync('src/components/AdmissionsView.tsx', content);
