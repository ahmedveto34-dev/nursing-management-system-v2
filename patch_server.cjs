const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: 'Admissions!A2:E',
    });
    const rows = response.data.values || [];
    const data = rows.map((row) => ({
      id: row[0],
      date: row[1],
      patientId: row[2],
      ward: row[3],
      type: row[4], // Admission or Discharge
    }));`,
  `    const response = await sheets.spreadsheets.values.get({
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
    }));`
);

fs.writeFileSync('server.ts', code);
