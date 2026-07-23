const fs = require('fs');
const content = `import React, { useEffect, useState } from 'react';
import { getAdmissions, addAdmission, dischargePatient } from '../lib/api';
import { format, differenceInDays, differenceInHours, parse } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function AdmissionsView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formType, setFormType] = useState('دخول'); // 'دخول' or 'خروج'
  const { translate } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getAdmissions();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateLOS = (admDateStr: string, disDateStr: string) => {
    if (!admDateStr || !disDateStr) return '-';
    try {
      const admDate = new Date(admDateStr.replace(' ', 'T'));
      const disDate = new Date(disDateStr.replace(' ', 'T'));
      const days = differenceInDays(disDate, admDate);
      const hours = differenceInHours(disDate, admDate) % 24;
      
      if (days === 0 && hours === 0) return \`< 1 \${translate('hours')}\`;
      
      let res = '';
      if (days > 0) res += \`\${days} \${translate('days')} \`;
      if (hours > 0) res += \`\${hours} \${translate('hours')}\`;
      
      return res.trim();
    } catch(e) {
      return '-';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const rawDate = formData.get('date') as string;
    const dateObj = rawDate ? new Date(rawDate) : new Date();
    const dateStr = format(dateObj, 'yyyy-MM-dd HH:mm');

    try {
      if (formType === 'دخول' || formType === translate('admission')) {
        const payload = {
          admissionDate: dateStr,
          patientId: formData.get('patientId') as string,
          patientName: formData.get('patientName') as string,
          ward: formData.get('ward'),
          status: 'دخول'
        };
        await addAdmission(payload);
      } else {
        const payload = {
          dischargeDate: dateStr,
          patientId: formData.get('patientId') as string,
          dischargeReason: formData.get('dischargeReason') as string,
          dischargeType: formData.get('dischargeType') as string
        };
        await dischargePatient(payload);
      }
      form.reset();
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(translate('saveError') + '\\n\\n' + (err.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <h2 className="text-xl font-bold mb-4">{translate('newCase')}</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{translate('type')}</label>
          <select 
            className="w-full md:w-1/3 rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500"
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
          >
            <option value="دخول">{translate('admission')} / دخول</option>
            <option value="خروج">{translate('discharge')} / خروج</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('patientId')}</label>
            <input required name="patientId" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>

          {(formType === 'دخول' || formType === translate('admission')) ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{translate('patientName')}</label>
                <input required name="patientName" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{translate('ward')}</label>
                <input required name="ward" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الدخول</label>
                <input required name="date" type="datetime-local" defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الخروج</label>
                <input required name="date" type="datetime-local" defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سبب الخروج</label>
                <input required name="dischargeReason" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخروج</label>
                <select required name="dischargeType" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500">
                  <option value="">اختر...</option>
                  <option value="تحسن">تحسن</option>
                  <option value="نقل لمستشفى آخر">نقل لمستشفى آخر</option>
                  <option value="خروج ضد النصح الطبي">خروج ضد النصح الطبي</option>
                  <option value="وفاة">وفاة</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            </>
          )}

          <div className="md:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {translate('save')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium text-gray-600">تاريخ الدخول</th>
                <th className="p-4 font-medium text-gray-600">تاريخ الخروج</th>
                <th className="p-4 font-medium text-gray-600">{translate('patientId')}</th>
                <th className="p-4 font-medium text-gray-600">{translate('patientName')}</th>
                <th className="p-4 font-medium text-gray-600">{translate('ward')}</th>
                <th className="p-4 font-medium text-gray-600">الحالة</th>
                <th className="p-4 font-medium text-gray-600">بيانات الخروج</th>
                <th className="p-4 font-medium text-gray-600">{translate('los')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    {translate('noData')}
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={item.id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm">{item.admissionDate || item.date || '-'}</td>
                    <td className="p-4 text-sm">{item.dischargeDate || '-'}</td>
                    <td className="p-4 font-medium">{item.patientId}</td>
                    <td className="p-4">{item.patientName || '-'}</td>
                    <td className="p-4">{item.ward || '-'}</td>
                    <td className="p-4">
                      <span className={\`px-3 py-1 rounded-full text-xs font-medium \${(item.status === 'دخول' || item.type === 'دخول') && !item.dischargeDate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}\`}>
                        {item.dischargeDate ? 'خروج' : (item.status || item.type || 'دخول')}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {item.dischargeDate ? (
                        <div>
                          <div>السبب: {item.dischargeReason || '-'}</div>
                          <div>النوع: {item.dischargeType || '-'}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      {item.dischargeDate ? calculateLOS(item.admissionDate || item.date, item.dischargeDate) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AdmissionsView.tsx', content);
