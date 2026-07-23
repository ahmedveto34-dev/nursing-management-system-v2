const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

code = code.replace(
  `  const [patientExistsError, setPatientExistsError] = useState('');`,
  `  const [patientExistsError, setPatientExistsError] = useState('');
  const [isExistingPatient, setIsExistingPatient] = useState(false);`
);

code = code.replace(
  `    if (!id) {
      setPatientNameInput('');
      setPatientExistsError('');
      return;
    }`,
  `    if (!id) {
      setPatientNameInput('');
      setPatientExistsError('');
      setIsExistingPatient(false);
      return;
    }`
);

code = code.replace(
  `    if (patientRecords.length > 0) {
      const recordWithName = patientRecords.find(d => d.patientName);
      if (recordWithName) {
        setPatientNameInput(recordWithName.patientName);
      }`,
  `    if (patientRecords.length > 0) {
      setIsExistingPatient(true);
      const recordWithName = patientRecords.find(d => d.patientName);
      if (recordWithName) {
        setPatientNameInput(recordWithName.patientName);
      }`
);

code = code.replace(
  `    } else {
      if (formType === 'خروج') {`,
  `    } else {
      setIsExistingPatient(false);
      if (formType === 'خروج') {`
);

// Disable name input if isExistingPatient
code = code.replace(
  `<input required name="patientName" type="text" value={patientNameInput} onChange={(e) => setPatientNameInput(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`,
  `<input required name="patientName" type="text" value={patientNameInput} onChange={(e) => setPatientNameInput(e.target.value)} readOnly={isExistingPatient} className={\`w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 \${isExistingPatient ? 'bg-gray-100 cursor-not-allowed' : ''}\`} />`
);

// Reset state
code = code.replace(
  `      setPatientExistsError('');
      await loadData();`,
  `      setPatientExistsError('');
      setIsExistingPatient(false);
      await loadData();`
);

fs.writeFileSync('src/components/AdmissionsView.tsx', code);
