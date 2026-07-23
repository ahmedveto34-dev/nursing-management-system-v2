const fs = require('fs');
const views = ['BedsoresView.tsx', 'InfectionsView.tsx', 'FallsView.tsx', 'CardiacView.tsx', 'RRTView.tsx'];

for (const view of views) {
  const filePath = `src/components/${view}`;
  if (!fs.existsSync(filePath)) continue;
  let code = fs.readFileSync(filePath, 'utf8');

  code = code.replace(
    `  const handlePatientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value;
    setPatientIdInput(id);
    
    if (!id) {
      setPatientNameInput('');
      setIsExistingPatient(false);
      return;
    }
    
    const patientRecords = data.filter(d => String(d.patientId).trim() === String(id).trim());
    if (patientRecords.length > 0) {
      setIsExistingPatient(true);
      const recordWithName = patientRecords.find(d => d.patientName);
      if (recordWithName) {
        setPatientNameInput(recordWithName.patientName);
      }
    } else {
      setIsExistingPatient(false);
      setPatientNameInput('');
    }
  };`,
    `  const handlePatientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientIdInput(e.target.value);
  };

  useEffect(() => {
    const id = patientIdInput;
    if (!id) {
      setPatientNameInput('');
      setIsExistingPatient(false);
      return;
    }
    
    const safeData = data || [];
    const patientRecords = safeData.filter(d => String(d.patientId).trim() === String(id).trim());
    if (patientRecords.length > 0) {
      setIsExistingPatient(true);
      const recordWithName = patientRecords.find(d => d.patientName);
      if (recordWithName) {
        setPatientNameInput(recordWithName.patientName);
      }
    } else {
      setIsExistingPatient(false);
    }
  }, [patientIdInput, data]);`
);

  fs.writeFileSync(filePath, code);
}
