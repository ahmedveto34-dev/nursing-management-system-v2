/**
 * كود Google Apps Script الخاص بنظام إدارة التمريض (code.gs)
 * 
 * يرجى نسخ هذا الكود بالكامل ولصقه في مشروع Google Apps Script الخاص بك (ملحقات > Apps Script)
 * ثم قم بنشر التطبيق كـ Web App مع إعطاء الصلاحية للوصول للجميع (Anyone) لتمكين استقبال البيانات.
 */

function doPost(e) {
  try {
    // جلب البيانات المرسلة وتحويلها إلى كائن JSON
    var incoming = JSON.parse(e.postData.contents);
    
    // جلب معرّف جدول البيانات المرسل ديناميكياً من التطبيق بدون روابط ثابتة في الأكواد
    // الكود المطلوب والمصرح به لتوجيه الإرسال لقاعدة البيانات الخاصة بك:
    const ss = SpreadsheetApp.openById(incoming.sheetId);
    
    var action = incoming.action;
    var payload = incoming.payload || {};
    var result;
    
    // توجيه الطلبات حسب العملية المطلوبة (Action)
    if (action === 'getAdmissions') {
      result = getSheetData(ss, 'Admissions', ['id', 'date', 'patientId', 'ward', 'type', 'patientName']);
    } else if (action === 'addAdmission') {
      result = appendRow(ss, 'Admissions', [payload.id, payload.date, payload.patientId, payload.ward, payload.type, payload.patientName]);
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
    } else {
      throw new Error('عملية غير معروفة: ' + action);
    }
    
    // إرجاع النتيجة بتنسيق JSON مع تفعيل CORS تلقائياً
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// دالة اختبار سريعة تظهر عند فتح رابط الـ Web App في المتصفح عبر طريقة GET
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

/**
 * دالة مساعدة لجلب البيانات من جدول معين بشكل مرن وتلقائي
 */
function getSheetData(ss, sheetName, headers) {
  var sheet = getSheetCaseInsensitive(ss, sheetName);
  if (!sheet) {
    // إنشاء الجدول في حال عدم وجوده مع إدراج العناوين الأولى تلقائياً لتهيئة الملف للعمل
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

/**
 * دالة مساعدة لإضافة سطر جديد للجدول بشكل تلقائي
 */
function appendRow(ss, sheetName, values) {
  var sheet = getSheetCaseInsensitive(ss, sheetName);
  if (!sheet) {
    // تهيئة الجدول بالعناوين المناسبة إذا كان غير موجود
    var headers = [];
    if (sheetName === 'Admissions') headers = ['id', 'date', 'patientId', 'ward', 'type', 'patientName'];
    else if (sheetName === 'Bedsores') headers = ['id', 'date', 'patientId', 'stage', 'location', 'progress', 'patientName'];
    else if (sheetName === 'Infections') headers = ['id', 'date', 'patientId', 'infectionType', 'infectionSite', 'isolationProtocol', 'patientName'];
    else if (sheetName === 'Falls') headers = ['id', 'date', 'patientId', 'riskAssessment', 'location', 'postFallAction', 'patientName'];
    else if (sheetName === 'CardiacArrests') headers = ['id', 'date', 'patientId', 'responseTime', 'outcome', 'patientName'];
    
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
  }
  sheet.appendRow(values);
  return { success: true };
}
