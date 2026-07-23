const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

// Add states
code = code.replace(
  `  const [formType, setFormType] = useState('دخول'); // 'دخول' or 'خروج'`,
  `  const [formType, setFormType] = useState('دخول'); // 'دخول' or 'خروج'
  const [patientIdInput, setPatientIdInput] = useState('');
  const [patientNameInput, setPatientNameInput] = useState('');
  const [patientExistsError, setPatientExistsError] = useState('');`
);

// Add handler
code = code.replace(
  `  const loadData = async () => {`,
  `  const handlePatientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value;
    setPatientIdInput(id);
    
    if (!id) {
      setPatientNameInput('');
      setPatientExistsError('');
      return;
    }
    
    const patientRecords = data.filter(d => d.patientId === id);
    
    if (patientRecords.length > 0) {
      const recordWithName = patientRecords.find(d => d.patientName);
      if (recordWithName) {
        setPatientNameInput(recordWithName.patientName);
      }
      
      const isCurrentlyAdmitted = patientRecords.some(d => (!d.dischargeDate || d.dischargeDate === '') && (d.status === 'دخول' || d.type === 'دخول' || d.type === 'Admission'));
      
      if (isCurrentlyAdmitted && formType === 'دخول' || formType === translate('admission')) {
        setPatientExistsError('هذا المريض مسجل دخول مسبقاً ولم يتم خروجه');
      } else if (!isCurrentlyAdmitted && formType === 'خروج') {
        setPatientExistsError('لا يوجد تسجيل دخول حالي لهذا المريض لإجراء خروج له');
      } else {
        setPatientExistsError('');
      }
    } else {
      if (formType === 'خروج') {
        setPatientExistsError('هذا المريض غير مسجل مسبقاً');
      } else {
        setPatientExistsError('');
      }
      setPatientNameInput('');
    }
  };

  // Re-validate on formType change
  useEffect(() => {
    if (patientIdInput) {
       handlePatientIdChange({ target: { value: patientIdInput } } as any);
    }
  }, [formType, data]);

  const loadData = async () => {`
);

// Add patientId handler and error display
code = code.replace(
  `<input required name="patientId" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`,
  `<input required name="patientId" type="text" value={patientIdInput} onChange={handlePatientIdChange} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`
);

code = code.replace(
  `<div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('patientId')}</label>`,
  `<div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('patientId')}</label>`
);

code = code.replace(
  `<input required name="patientId" type="text" value={patientIdInput} onChange={handlePatientIdChange} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>`,
  `<input required name="patientId" type="text" value={patientIdInput} onChange={handlePatientIdChange} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
            {patientExistsError && (
              <p className="text-red-500 text-xs mt-1">{patientExistsError}</p>
            )}
          </div>`
);

code = code.replace(
  `<input required name="patientName" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`,
  `<input required name="patientName" type="text" value={patientNameInput} onChange={(e) => setPatientNameInput(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`
);

// Disable save button if patientExistsError is present
code = code.replace(
  `disabled={submitting}`,
  `disabled={submitting || !!patientExistsError}`
);

// When form completes, reset inputs
code = code.replace(
  `form.reset();
      await loadData();`,
  `form.reset();
      setPatientIdInput('');
      setPatientNameInput('');
      setPatientExistsError('');
      await loadData();`
);

fs.writeFileSync('src/components/AdmissionsView.tsx', code);
