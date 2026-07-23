const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(/    \} else if \(endpoint === 'bedsores'\) \{/, `    } else if (endpoint === 'discharge') {
      action = 'dischargePatient';
    } else if (endpoint === 'bedsores') {`);

code += `\nexport const dischargePatient = (data: any) => fetchApi('discharge', { method: 'POST', body: JSON.stringify(data) });\n`;

fs.writeFileSync('src/lib/api.ts', code);
