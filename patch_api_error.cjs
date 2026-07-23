const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  /const resData = await response\.json\(\);/,
  `const text = await response.text();
    if (text.includes('Google Apps Script for Nursing Management System is Running Successfully.')) {
      throw new Error('رابط VITE_API_URL غير صحيح: تم تحويل طلب POST إلى GET. تأكد من أن الرابط ينتهي بـ /exec ولا تستخدم روابط مختصرة.');
    }
    let resData;
    try {
      resData = JSON.parse(text);
    } catch (e) {
      throw new Error('استجابة غير صالحة من الخادم (ليست JSON). قد يكون الرابط خاطئاً أو السكربت يرجع خطأ غير متوقع.');
    }`
);

fs.writeFileSync('src/lib/api.ts', code);
