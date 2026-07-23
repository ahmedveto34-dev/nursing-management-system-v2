export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbz1aGJVF24K2mWjic9uFw2oZVC8q81KFtBFJMCjIML7jyoMLU6bYo2PqxM84UzJGuNv/exec';
  let SHEET_ID = (import.meta as any).env?.VITE_SHEET_ID;

  if (API_URL) {
    if (!SHEET_ID) {
      throw new Error("يرجى إضافة VITE_SHEET_ID (معرف جدول بيانات جوجل) في إعدادات التطبيق أو Vercel");
    }

    // تنظيف المعرف في حال قام المستخدم بنسخ الرابط بالكامل
    if (SHEET_ID.includes('google.com/spreadsheets/d/')) {
      const match = SHEET_ID.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        SHEET_ID = match[1];
      }
    }

    // Determine the action and payload based on endpoint and options
    let action = '';
    let payload: any = undefined;

    if (endpoint === 'admissions') {
      action = options.method === 'POST' ? 'addAdmission' : 'getAdmissions';
    } else if (endpoint === 'discharge') {
      action = 'dischargePatient';
    } else if (endpoint === 'bedsores') {
      action = options.method === 'POST' ? 'addBedsore' : 'getBedsores';
    } else if (endpoint === 'infections') {
      action = options.method === 'POST' ? 'addInfection' : 'getInfections';
    } else if (endpoint === 'falls') {
      action = options.method === 'POST' ? 'addFall' : 'getFalls';
    } else if (endpoint === 'cardiac') {
      action = options.method === 'POST' ? 'addCardiac' : 'getCardiac';
    } else if (endpoint === 'rrt') {
      action = options.method === 'POST' ? 'addRRT' : 'getRRT';
    }

    if (options.body) {
      const originalBody = JSON.parse(options.body as string);
      payload = {
        id: originalBody.id || Date.now().toString(),
        ...originalBody,
      };
    }

    // Google Apps Script Web Apps are called via POST.
    // We send sheetId in the payload to let Google Apps Script use:
    // const ss = SpreadsheetApp.openById(incoming.sheetId);
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        sheetId: SHEET_ID,
        action,
        payload,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('GAS API Error:', response.status, response.statusText, errText);
      throw new Error(`فشل الاتصال بقاعدة بيانات Google Sheets (Status: ${response.status}). ${errText ? 'Details: ' + errText : 'عبر الرابط المحدد VITE_API_URL'}`);
    }

    const resData = await response.json();
    if (resData && resData.error) {
      if (resData.error.includes("عملية غير معروفة") || resData.error.includes("Unknown operation")) {
        throw new Error("يجب تحديث VITE_API_URL في إعدادات Vercel برابط Apps Script الجديد الخاص بك، الرابط الافتراضي لا يحتوي على التحديثات الأخيرة!");
      }
      throw new Error(resData.error);
    }
    return resData;
  }

  // Fallback to local server API if VITE_API_URL is not set
  const response = await fetch(`/api/${endpoint}`, {
    ...options,
    headers: { 
      'Content-Type': 'application/json',
      ...options.headers 
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch API');
  }
  return response.json();
};

export const getAdmissions = () => fetchApi('admissions');
export const addAdmission = (data: any) => fetchApi('admissions', { method: 'POST', body: JSON.stringify(data) });

export const getBedsores = () => fetchApi('bedsores');
export const addBedsore = (data: any) => fetchApi('bedsores', { method: 'POST', body: JSON.stringify(data) });

export const getInfections = () => fetchApi('infections');
export const addInfection = (data: any) => fetchApi('infections', { method: 'POST', body: JSON.stringify(data) });

export const getFalls = () => fetchApi('falls');
export const addFall = (data: any) => fetchApi('falls', { method: 'POST', body: JSON.stringify(data) });

export const getCardiac = () => fetchApi('cardiac');
export const addCardiac = (data: any) => fetchApi('cardiac', { method: 'POST', body: JSON.stringify(data) });

export const getRRT = () => fetchApi('rrt');
export const addRRT = (data: any) => fetchApi('rrt', { method: 'POST', body: JSON.stringify(data) });

export const dischargePatient = (data: any) => fetchApi('discharge', { method: 'POST', body: JSON.stringify(data) });
