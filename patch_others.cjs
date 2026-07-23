const fs = require('fs');

const views = ['BedsoresView.tsx', 'InfectionsView.tsx', 'FallsView.tsx', 'CardiacView.tsx', 'RRTView.tsx'];

for (const view of views) {
  const filePath = `src/components/${view}`;
  if (!fs.existsSync(filePath)) continue;
  let code = fs.readFileSync(filePath, 'utf8');

  // Add states
  code = code.replace(
    `  const [submitting, setSubmitting] = useState(false);`,
    `  const [submitting, setSubmitting] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [patientNameInput, setPatientNameInput] = useState('');`
  );

  // Add handler
  code = code.replace(
    `  const loadData = async () => {`,
    `  const handlePatientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value;
    setPatientIdInput(id);
    
    if (!id) {
      setPatientNameInput('');
      return;
    }
    
    const patientRecords = data.filter(d => d.patientId === id);
    if (patientRecords.length > 0) {
      const recordWithName = patientRecords.find(d => d.patientName);
      if (recordWithName) {
        setPatientNameInput(recordWithName.patientName);
      }
    } else {
      setPatientNameInput('');
    }
  };

  const loadData = async () => {`
  );

  // Add patientId handler
  code = code.replace(
    `<input required name="patientId" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`,
    `<input required name="patientId" type="text" value={patientIdInput} onChange={handlePatientIdChange} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`
  );

  // Add patientName handler
  code = code.replace(
    `<input required name="patientName" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`,
    `<input required name="patientName" type="text" value={patientNameInput} onChange={(e) => setPatientNameInput(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`
  );

  // When form completes, reset inputs
  code = code.replace(
    `form.reset();
      await loadData();`,
    `form.reset();
      setPatientIdInput('');
      setPatientNameInput('');
      await loadData();`
  );

  fs.writeFileSync(filePath, code);
}
