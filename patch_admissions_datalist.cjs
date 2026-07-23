const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

code = code.replace(
  `  const activeAdmissions = data.filter(item => (!item.dischargeDate || item.dischargeDate === '') && (item.status === 'دخول' || item.type === 'دخول' || item.type === 'Admission'));`,
  ``
);

code = code.replace(
  `  return (
    <div className="space-y-6">`,
  `  const activeAdmissions = data.filter(d => (!d.dischargeDate || d.dischargeDate === '') && (d.status === 'دخول' || d.type === 'دخول' || d.type === 'Admission'));

  return (
    <div className="space-y-6">`
);

code = code.replace(
  `        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('patientId')}</label>
            <input required name="patientId" type="text" value={patientIdInput} onChange={handlePatientIdChange} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`,
  `        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <datalist id="active-patients-list">
            {activeAdmissions.map(d => (
              <option key={d.id || d.patientId} value={d.patientId}>{d.patientName}</option>
            ))}
          </datalist>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('patientId')}</label>
            <input required name="patientId" type="text" value={patientIdInput} onChange={handlePatientIdChange} list={formType === 'خروج' ? 'active-patients-list' : undefined} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />`
);

fs.writeFileSync('src/components/AdmissionsView.tsx', code);
