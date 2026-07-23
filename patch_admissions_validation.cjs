const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

code = code.replace(
  `  const handlePatientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value;
    setPatientIdInput(id);
    
    if (!id) {
      setPatientNameInput('');
      setPatientExistsError('');
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
      
      const isCurrentlyAdmitted = patientRecords.some(d => (!d.dischargeDate || d.dischargeDate === '') && (d.status === 'دخول' || d.type === 'دخول' || d.type === 'Admission'));
      
      if (isCurrentlyAdmitted && (formType === 'دخول' || formType === translate('admission'))) {
        setPatientExistsError('هذا المريض مسجل دخول مسبقاً ولم يتم خروجه');
      } else if (!isCurrentlyAdmitted && formType === 'خروج') {
        setPatientExistsError('لا يوجد تسجيل دخول حالي لهذا المريض لإجراء خروج له');
      } else {
        setPatientExistsError('');
      }
    } else {
      setIsExistingPatient(false);
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
  }, [formType, data]);`,
  `  const handlePatientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientIdInput(e.target.value);
  };

  // Validate whenever patientIdInput, formType, or data changes
  useEffect(() => {
    const id = patientIdInput;
    
    if (!id) {
      setPatientNameInput('');
      setPatientExistsError('');
      setIsExistingPatient(false);
      return;
    }
    
    // Safety fallback: sometimes data might be stale or undefined
    const safeData = data || [];
    const patientRecords = safeData.filter(d => String(d.patientId).trim() === String(id).trim());
    
    if (patientRecords.length > 0) {
      setIsExistingPatient(true);
      const recordWithName = patientRecords.find(d => d.patientName);
      if (recordWithName) {
        setPatientNameInput(recordWithName.patientName);
      }
      
      const isCurrentlyAdmitted = patientRecords.some(d => (!d.dischargeDate || d.dischargeDate === '') && (d.status === 'دخول' || d.type === 'دخول' || d.type === 'Admission'));
      
      if (isCurrentlyAdmitted && (formType === 'دخول' || formType === translate('admission'))) {
        setPatientExistsError('هذا المريض مسجل دخول مسبقاً ولم يتم خروجه');
      } else if (!isCurrentlyAdmitted && formType === 'خروج') {
        setPatientExistsError('لا يوجد تسجيل دخول حالي لهذا المريض لإجراء خروج له');
      } else {
        setPatientExistsError('');
      }
    } else {
      setIsExistingPatient(false);
      if (formType === 'خروج') {
        setPatientExistsError('هذا المريض غير مسجل مسبقاً');
      } else {
        setPatientExistsError('');
      }
      // Only clear name if we are typing a new unknown patient, 
      // but maybe they are currently typing the name, so don't clear it forcefully on every stroke if not خروج
      if (formType === 'خروج') {
         setPatientNameInput('');
      }
    }
  }, [patientIdInput, formType, data]);`
);

fs.writeFileSync('src/components/AdmissionsView.tsx', code);
