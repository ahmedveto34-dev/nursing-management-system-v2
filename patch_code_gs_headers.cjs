const fs = require('fs');
let code = fs.readFileSync('code.gs', 'utf8');

code = code.replace(
  `    var admDateIdx = headers.indexOf('admissionDate');
    var wardIdx = headers.indexOf('ward');
    var statusIdx = headers.indexOf('status');
    var nameIdx = headers.indexOf('patientName');
    var disDateIdx = headers.indexOf('dischargeDate');
    var disReasonIdx = headers.indexOf('dischargeReason');
    var disTypeIdx = headers.indexOf('dischargeType');`,
  `    var admDateIdx = headers.indexOf('admissionDate') > -1 ? headers.indexOf('admissionDate') : headers.indexOf('date');
    var wardIdx = headers.indexOf('ward');
    var statusIdx = headers.indexOf('status') > -1 ? headers.indexOf('status') : headers.indexOf('type');
    var nameIdx = headers.indexOf('patientName');
    var disDateIdx = headers.indexOf('dischargeDate');
    var disReasonIdx = headers.indexOf('dischargeReason');
    var disTypeIdx = headers.indexOf('dischargeType');
    
    // Ensure missing columns are added
    if (nameIdx === -1) { sheet.getRange(1, headers.length + 1).setValue('patientName'); nameIdx = headers.length++; }
    if (disDateIdx === -1) { sheet.getRange(1, headers.length + 1).setValue('dischargeDate'); disDateIdx = headers.length++; }
    if (disReasonIdx === -1) { sheet.getRange(1, headers.length + 1).setValue('dischargeReason'); disReasonIdx = headers.length++; }
    if (disTypeIdx === -1) { sheet.getRange(1, headers.length + 1).setValue('dischargeType'); disTypeIdx = headers.length++; }`
);

fs.writeFileSync('code.gs', code);
