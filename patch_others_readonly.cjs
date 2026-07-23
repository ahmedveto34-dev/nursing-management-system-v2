const fs = require('fs');
const views = ['BedsoresView.tsx', 'InfectionsView.tsx', 'FallsView.tsx', 'CardiacView.tsx', 'RRTView.tsx'];

for (const view of views) {
  const filePath = `src/components/${view}`;
  if (!fs.existsSync(filePath)) continue;
  let code = fs.readFileSync(filePath, 'utf8');

  code = code.replace(
    `  const [patientNameInput, setPatientNameInput] = useState('');`,
    `  const [patientNameInput, setPatientNameInput] = useState('');
  const [isExistingPatient, setIsExistingPatient] = useState(false);`
  );

  code = code.replace(
    `    if (!id) {
      setPatientNameInput('');
      return;
    }`,
    `    if (!id) {
      setPatientNameInput('');
      setIsExistingPatient(false);
      return;
    }`
  );

  code = code.replace(
    `    const patientRecords = data.filter(d => d.patientId === id);
    if (patientRecords.length > 0) {
      const recordWithName = patientRecords.find(d => d.patientName);
      if (recordWithName) {
        setPatientNameInput(recordWithName.patientName);
      }`,
    `    const patientRecords = data.filter(d => d.patientId === id);
    if (patientRecords.length > 0) {
      setIsExistingPatient(true);
      const recordWithName = patientRecords.find(d => d.patientName);
      if (recordWithName) {
        setPatientNameInput(recordWithName.patientName);
      }`
  );

  code = code.replace(
    `    } else {
      setPatientNameInput('');
    }`,
    `    } else {
      setIsExistingPatient(false);
      setPatientNameInput('');
    }`
  );

  code = code.replace(
    `<input required name="patientName" type="text" value={patientNameInput} onChange={(e) => setPatientNameInput(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`,
    `<input required name="patientName" type="text" value={patientNameInput} onChange={(e) => setPatientNameInput(e.target.value)} readOnly={isExistingPatient} className={\`w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 \${isExistingPatient ? 'bg-gray-100 cursor-not-allowed' : ''}\`} />`
  );
  
  code = code.replace(
    `      setPatientNameInput('');
      await loadData();`,
    `      setPatientNameInput('');
      setIsExistingPatient(false);
      await loadData();`
  );

  fs.writeFileSync(filePath, code);
}
