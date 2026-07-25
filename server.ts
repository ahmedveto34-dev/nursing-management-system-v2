import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';

const app = express();
app.use(express.json());
const PORT = 3000;

// Fallback mock data arrays to allow the app to work in preview mode without Google Sheets credentials
const mockData = {
  admissions: [
    { id: '1', date: new Date().toISOString(), patientId: '101', ward: 'الباطنة', type: 'دخول' },
    { id: '2', date: new Date().toISOString(), patientId: '102', ward: 'العناية المركزة', type: 'دخول' },
    { id: '3', date: new Date().toISOString(), patientId: '103', ward: 'الجراحة', type: 'خروج' },
  ],
  bedsores: [
    { id: '1', date: new Date().toISOString(), patientId: '201', stage: 'المرحلة الأولى', location: 'أسفل الظهر', progress: 'في تحسن' },
  ],
  infections: [
    { id: '1', date: new Date().toISOString(), patientId: '301', infectionType: 'VAP', infectionSite: 'الرئة', isolationProtocol: 'رذاذ (Droplet)' },
  ],
  falls: [
    { id: '1', date: new Date().toISOString(), patientId: '401', riskAssessment: 'عالي (High)', location: 'الحمام', postFallAction: 'تقييم طبية وعمل أشعة' },
  ],
  cardiac: [
    { id: '1', date: new Date().toISOString(), patientId: '501', responseTime: '2', outcome: 'نجاة' },
  ]
};

// Middleware to get Google Sheets instance using either OAuth token from header OR Service Account
const getSheetsClient = (req: express.Request) => {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID, VITE_SHEET_ID } = process.env;
  const sheetId = VITE_SHEET_ID || GOOGLE_SHEET_ID;
  if (GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY && sheetId) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
  }

  // Return null to indicate we should use mock data
  return null;
};

const getSpreadsheetId = () => {
  const id = process.env.VITE_SHEET_ID || process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new Error('يرجى إضافة VITE_SHEET_ID في إعدادات التطبيق (Secrets).');
  }
  return id;
};

// API: Get Admissions
app.get('/api/admissions', async (req, res) => {
  try {
    const sheets = getSheetsClient(req);
    if (!sheets) return res.json(mockData.admissions);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: 'Admissions!A2:I',
    });
    const rows = response.data.values || [];
    const data = rows.map((row) => ({
      id: row[0],
      admissionDate: row[1],
      patientId: row[2],
      ward: row[3],
      status: row[4], // Admission or Discharge
      patientName: row[5],
      dischargeDate: row[6],
      dischargeReason: row[7],
      dischargeType: row[8],
      // For backward compatibility with frontend code:
      date: row[1],
      type: row[4],
    }));
    res.json(data);
  } catch (error: any) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// API: Add Admission
app.post('/api/admissions', async (req, res) => {
  try {
    const sheets = getSheetsClient(req);
    const { date, patientId, ward, type } = req.body;
    const id = Date.now().toString();

    if (!sheets) {
      mockData.admissions.unshift({ id, date, patientId, ward, type });
      return res.json({ success: true, id, mock: true });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: getSpreadsheetId(),
      range: 'Admissions!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[id, date, patientId, ward, type]],
      },
    });
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Discharge Patient
app.post('/api/discharge', async (req, res) => {
  try {
    const sheets = getSheetsClient(req);
    const { patientId, dischargeDate, dischargeReason, dischargeType } = req.body;
    
    if (!sheets) {
      const idx = mockData.admissions.findIndex(a => a.patientId === patientId && (!a.dischargeDate || a.type === 'دخول'));
      if (idx !== -1) {
        mockData.admissions[idx] = { ...mockData.admissions[idx], dischargeDate, dischargeReason, dischargeType, type: 'خروج', status: 'خروج' };
      }
      return res.json({ success: true, mock: true });
    }

    // 1. Fetch all rows to find the one we need to update
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: 'Admissions!A:I',
    });
    
    const rows = response.data.values || [];
    // Search backwards for the latest active admission for this patient
    let targetRowIndex = -1;
    let existingRowData = [];
    
    for (let i = rows.length - 1; i >= 0; i--) {
      const row = rows[i];
      // row[2] is patientId, row[6] is dischargeDate
      if (row[2] === patientId && (!row[6] || String(row[6]).trim() === '')) {
        targetRowIndex = i;
        existingRowData = row;
        break;
      }
    }
    
    if (targetRowIndex === -1) {
      // Fallback: If no active admission found, maybe we just append a new discharge row
      const id = Date.now().toString();
      await sheets.spreadsheets.values.append({
        spreadsheetId: getSpreadsheetId(),
        range: 'Admissions!A:I',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[id, dischargeDate, patientId, '', 'خروج', '', dischargeDate, dischargeReason, dischargeType]],
        },
      });
      return res.json({ success: true, message: "Appended as new row since active admission not found" });
    }
    
    // 2. Update the row
    // The sheet row number is targetRowIndex + 1
    const rowNum = targetRowIndex + 1;
    
    // Ensure the row has enough elements up to index 8
    while(existingRowData.length < 9) {
       existingRowData.push('');
    }
    
    // Update the relevant fields
    existingRowData[4] = 'خروج'; // status/type
    existingRowData[6] = dischargeDate;
    existingRowData[7] = dischargeReason;
    existingRowData[8] = dischargeType;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: getSpreadsheetId(),
      range: `Admissions!A${rowNum}:I${rowNum}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [existingRowData],
      },
    });

    res.json({ success: true, message: "Row updated successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get Bedsores
app.get('/api/bedsores', async (req, res) => {
  try {
    const sheets = getSheetsClient(req);
    if (!sheets) return res.json(mockData.bedsores);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: 'Bedsores!A2:F',
    });
    const rows = response.data.values || [];
    const data = rows.map((row) => ({
      id: row[0],
      date: row[1],
      patientId: row[2],
      stage: row[3],
      location: row[4],
      progress: row[5],
    }));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Add Bedsore
app.post('/api/bedsores', async (req, res) => {
  try {
    const sheets = getSheetsClient(req);
    const { date, patientId, stage, location, progress } = req.body;
    const id = Date.now().toString();

    if (!sheets) {
      mockData.bedsores.unshift({ id, date, patientId, stage, location, progress });
      return res.json({ success: true, id, mock: true });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: getSpreadsheetId(),
      range: 'Bedsores!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[id, date, patientId, stage, location, progress]],
      },
    });
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get Infections
app.get('/api/infections', async (req, res) => {
  try {
    const sheets = getSheetsClient(req);
    if (!sheets) return res.json(mockData.infections);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: 'Infections!A2:F',
    });
    const rows = response.data.values || [];
    const data = rows.map((row) => ({
      id: row[0],
      date: row[1],
      patientId: row[2],
      infectionType: row[3],
      infectionSite: row[4],
      isolationProtocol: row[5],
    }));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Add Infection
app.post('/api/infections', async (req, res) => {
  try {
    const sheets = getSheetsClient(req);
    const { date, patientId, infectionType, infectionSite, isolationProtocol } = req.body;
    const id = Date.now().toString();

    if (!sheets) {
      mockData.infections.unshift({ id, date, patientId, infectionType, infectionSite, isolationProtocol });
      return res.json({ success: true, id, mock: true });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: getSpreadsheetId(),
      range: 'Infections!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[id, date, patientId, infectionType, infectionSite, isolationProtocol]],
      },
    });
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get Falls
app.get('/api/falls', async (req, res) => {
  try {
    const sheets = getSheetsClient(req);
    if (!sheets) return res.json(mockData.falls);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: 'Falls!A2:F',
    });
    const rows = response.data.values || [];
    const data = rows.map((row) => ({
      id: row[0],
      date: row[1],
      patientId: row[2],
      riskAssessment: row[3],
      location: row[4],
      postFallAction: row[5],
    }));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Add Fall
app.post('/api/falls', async (req, res) => {
  try {
    const sheets = getSheetsClient(req);
    const { date, patientId, riskAssessment, location, postFallAction } = req.body;
    const id = Date.now().toString();

    if (!sheets) {
      mockData.falls.unshift({ id, date, patientId, riskAssessment, location, postFallAction });
      return res.json({ success: true, id, mock: true });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: getSpreadsheetId(),
      range: 'Falls!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[id, date, patientId, riskAssessment, location, postFallAction]],
      },
    });
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get Cardiac Arrests
app.get('/api/cardiac', async (req, res) => {
  try {
    const sheets = getSheetsClient(req);
    if (!sheets) return res.json(mockData.cardiac);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: 'CardiacArrests!A2:E',
    });
    const rows = response.data.values || [];
    const data = rows.map((row) => ({
      id: row[0],
      date: row[1],
      patientId: row[2],
      responseTime: row[3],
      outcome: row[4],
    }));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Add Cardiac Arrest
app.post('/api/cardiac', async (req, res) => {
  try {
    const sheets = getSheetsClient(req);
    const { date, patientId, responseTime, outcome } = req.body;
    const id = Date.now().toString();

    if (!sheets) {
      mockData.cardiac.unshift({ id, date, patientId, responseTime, outcome });
      return res.json({ success: true, id, mock: true });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: getSpreadsheetId(),
      range: 'CardiacArrests!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[id, date, patientId, responseTime, outcome]],
      },
    });
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
