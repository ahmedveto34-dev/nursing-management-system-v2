/**
 * كود Google Apps Script الخاص بنظام إدارة التمريض (code.gs)
 * 
 * يرجى نسخ هذا الكود بالكامل ولصقه في مشروع Google Apps Script الخاص بك (ملحقات > Apps Script)
 * ثم قم بنشر التطبيق كـ Web App مع إعطاء الصلاحية للوصول للجميع (Anyone) لتمكين استقبال البيانات.
 */

function doPost(e) {
  try {
    var incoming = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(incoming.sheetId);
    
    var action = incoming.action;
    var payload = incoming.payload || {};
    var result;
    
    if (action === 'getAdmissions') {
      result = getSheetData(ss, 'Admissions', ['id', 'admissionDate', 'patientId', 'ward', 'status', 'patientName', 'dischargeDate', 'dischargeReason', 'dischargeType']);
    } else if (action === 'addAdmission') {
      result = addOrUpdateAdmission(ss, 'Admissions', payload);
    } else if (action === 'dischargePatient') {
      result = updateDischarge(ss, 'Admissions', payload.patientId, payload.dischargeDate, payload.dischargeReason, payload.dischargeType);
    } else if (action === 'getBedsores') {
      result = getSheetData(ss, 'Bedsores', ['id', 'date', 'patientId', 'stage', 'location', 'progress', 'patientName']);
    } else if (action === 'addBedsore') {
      result = appendRow(ss, 'Bedsores', [payload.id, payload.date, payload.patientId, payload.stage, payload.location, payload.progress, payload.patientName]);
    } else if (action === 'getInfections') {
      result = getSheetData(ss, 'Infections', ['id', 'date', 'patientId', 'infectionType', 'infectionSite', 'isolationProtocol', 'patientName']);
    } else if (action === 'addInfection') {
      result = appendRow(ss, 'Infections', [payload.id, payload.date, payload.patientId, payload.infectionType, payload.infectionSite || payload.site, payload.isolationProtocol, payload.patientName]);
    } else if (action === 'getFalls') {
      result = getSheetData(ss, 'Falls', ['id', 'date', 'patientId', 'riskAssessment', 'location', 'postFallAction', 'patientName']);
    } else if (action === 'addFall') {
      result = appendRow(ss, 'Falls', [payload.id, payload.date, payload.patientId, payload.riskAssessment, payload.location, payload.postFallAction, payload.patientName]);
    } else if (action === 'getCardiac') {
      result = getSheetData(ss, 'CardiacArrests', ['id', 'date', 'patientId', 'responseTime', 'outcome', 'patientName']);
    } else if (action === 'addCardiac') {
      result = appendRow(ss, 'CardiacArrests', [payload.id, payload.date, payload.patientId, payload.responseTime, payload.outcome, payload.patientName]);
    } else if (action === 'getRRT') {
      result = getSheetData(ss, 'RRT', ['id', 'date', 'patientId', 'ward', 'reason', 'outcome', 'patientName']);
    } else if (action === 'addRRT') {
      result = appendRow(ss, 'RRT', [payload.id, payload.date, payload.patientId, payload.ward, payload.reason, payload.outcome, payload.patientName]);
    } else {
      throw new Error('عملية غير معروفة: ' + action);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Google Apps Script for Nursing Management System is Running Successfully.");
}

function getSheetCaseInsensitive(ss, sheetName) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toLowerCase() === sheetName.toLowerCase()) {
      return sheets[i];
    }
  }
  return null;
}

function getSheetData(ss, sheetName, headers) {
  var sheet = getSheetCaseInsensitive(ss, sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    return [];
  }
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  return rows;
}

function addOrUpdateAdmission(ss, sheetName, payload) {
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
    var admDateIdx = headers.indexOf('admissionDate') > -1 ? headers.indexOf('admissionDate') : headers.indexOf('date');
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
    if (disTypeIdx === -1) { sheet.getRange(1, headers.length + 1).setValue('dischargeType'); disTypeIdx = headers.length++; }
    
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

function appendRow(ss, sheetName, values) {
  var sheet = getSheetCaseInsensitive(ss, sheetName);
  if (!sheet) {
    var headers = [];
    if (sheetName === 'Admissions') headers = ['id', 'admissionDate', 'patientId', 'ward', 'status', 'patientName', 'dischargeDate', 'dischargeReason', 'dischargeType'];
    else if (sheetName === 'Bedsores') headers = ['id', 'date', 'patientId', 'stage', 'location', 'progress', 'patientName'];
    else if (sheetName === 'Infections') headers = ['id', 'date', 'patientId', 'infectionType', 'infectionSite', 'isolationProtocol', 'patientName'];
    else if (sheetName === 'Falls') headers = ['id', 'date', 'patientId', 'riskAssessment', 'location', 'postFallAction', 'patientName'];
    else if (sheetName === 'CardiacArrests') headers = ['id', 'date', 'patientId', 'responseTime', 'outcome', 'patientName'];
    else if (sheetName === 'RRT') headers = ['id', 'date', 'patientId', 'ward', 'reason', 'outcome', 'patientName'];
    
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
  }
  sheet.appendRow(values);
  return { success: true };
}

function updateDischarge(ss, sheetName, patientId, dischargeDate, dischargeReason, dischargeType) {
  var sheet = getSheetCaseInsensitive(ss, sheetName);
  if (!sheet) {
    throw new Error('ورقة الدخول غير موجودة');
  }
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var patientIdIdx = headers.indexOf('patientId');
  var disDateIdx = headers.indexOf('dischargeDate');
  var disReasonIdx = headers.indexOf('dischargeReason');
  var disTypeIdx = headers.indexOf('dischargeType');
  var statusIdx = headers.indexOf('status');
  
  if (patientIdIdx === -1) throw new Error('عمود patientId غير موجود');
  
  // Find the last row with this patientId that hasn't been discharged yet
  var targetRow = -1;
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][patientIdIdx] == patientId && (!data[i][disDateIdx] || data[i][disDateIdx] === '')) {
      targetRow = i + 1; // 1-based index for sheet
      break;
    }
  }
  
  if (targetRow === -1) {
    throw new Error('لم يتم العثور على حالة دخول مفتوحة لهذا المريض');
  }
  
  // Ensure discharge columns exist
  if (disDateIdx === -1) { sheet.getRange(1, headers.length + 1).setValue('dischargeDate'); disDateIdx = headers.length++; }
  if (disReasonIdx === -1) { sheet.getRange(1, headers.length + 1).setValue('dischargeReason'); disReasonIdx = headers.length++; }
  if (disTypeIdx === -1) { sheet.getRange(1, headers.length + 1).setValue('dischargeType'); disTypeIdx = headers.length++; }
  
  // Update the row
  sheet.getRange(targetRow, disDateIdx + 1).setValue(dischargeDate);
  sheet.getRange(targetRow, disReasonIdx + 1).setValue(dischargeReason);
  sheet.getRange(targetRow, disTypeIdx + 1).setValue(dischargeType);
  if (statusIdx !== -1) {
    sheet.getRange(targetRow, statusIdx + 1).setValue('خروج');
  }
  
  return { success: true };
}
