const fs = require('fs');
let code = fs.readFileSync('code.gs', 'utf8');

code = code.replace(
  `result = appendRow(ss, 'Admissions', [payload.id, payload.admissionDate, payload.patientId, payload.ward, payload.status, payload.patientName, '', '', '']);`,
  `result = addOrUpdateAdmission(ss, 'Admissions', payload);`
);

code = code.replace(
  `function appendRow(ss, sheetName, values) {`,
  `function addOrUpdateAdmission(ss, sheetName, payload) {
  var sheet = getSheetCaseInsensitive(ss, sheetName);
  if (!sheet) {
    var headers = ['id', 'admissionDate', 'patientId', 'ward', 'status', 'patientName', 'dischargeDate', 'dischargeReason', 'dischargeType'];
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var patientIdIdx = headers.indexOf('patientId');
  
  if (patientIdIdx === -1) {
    sheet.appendRow([payload.id, payload.admissionDate, payload.patientId, payload.ward, payload.status, payload.patientName, '', '', '']);
    return { success: true };
  }
  
  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][patientIdIdx] == payload.patientId) {
      targetRow = i + 1;
      break;
    }
  }
  
  if (targetRow > -1) {
    var admDateIdx = headers.indexOf('admissionDate');
    var wardIdx = headers.indexOf('ward');
    var statusIdx = headers.indexOf('status');
    var nameIdx = headers.indexOf('patientName');
    var disDateIdx = headers.indexOf('dischargeDate');
    var disReasonIdx = headers.indexOf('dischargeReason');
    var disTypeIdx = headers.indexOf('dischargeType');
    
    if (admDateIdx > -1) sheet.getRange(targetRow, admDateIdx + 1).setValue(payload.admissionDate);
    if (wardIdx > -1) sheet.getRange(targetRow, wardIdx + 1).setValue(payload.ward);
    if (statusIdx > -1) sheet.getRange(targetRow, statusIdx + 1).setValue(payload.status);
    if (nameIdx > -1) sheet.getRange(targetRow, nameIdx + 1).setValue(payload.patientName);
    if (disDateIdx > -1) sheet.getRange(targetRow, disDateIdx + 1).setValue('');
    if (disReasonIdx > -1) sheet.getRange(targetRow, disReasonIdx + 1).setValue('');
    if (disTypeIdx > -1) sheet.getRange(targetRow, disTypeIdx + 1).setValue('');
  } else {
    sheet.appendRow([payload.id, payload.admissionDate, payload.patientId, payload.ward, payload.status, payload.patientName, '', '', '']);
  }
  
  return { success: true };
}

function appendRow(ss, sheetName, values) {`
);

fs.writeFileSync('code.gs', code);
