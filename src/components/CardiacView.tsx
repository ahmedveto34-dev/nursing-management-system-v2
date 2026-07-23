import React, { useEffect, useState } from 'react';
import { getCardiac, addCardiac } from '../lib/api';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function CardiacView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [patientNameInput, setPatientNameInput] = useState('');
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const { translate } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const handlePatientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [patientIdInput, data]);

  const loadData = async () => {
    
try {
      const res = await getCardiac();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload = {
      date: format(new Date(), 'yyyy-MM-dd HH:mm'),
      patientId: formData.get('patientId') as string,
      patientName: formData.get('patientName') as string,
      responseTime: formData.get('responseTime'),
      outcome: formData.get('outcome'),
    };
    
    try {
      
      const isDuplicate = data.some(item => item.patientId === payload.patientId && item.outcome === payload.outcome);
      if (isDuplicate) {
        if (!window.confirm(translate('duplicateWarning'))) {
          setSubmitting(false);
          return;
        }
      }

      
        addCardiac(payload).catch(err => {
          console.error(err);
        });
        setData(prev => [...prev, { ...payload, id: Date.now().toString() }]);

      form.reset();
      setPatientIdInput('');
      setPatientNameInput('');
      setIsExistingPatient(false);
      // loadData(); // Removed to speed up UI
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ\n' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <h2 className="text-xl font-bold mb-4">تسجيل كود بلو (Code Blue)</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('patientId')}</label>
            <input required name="patientId" type="text" value={patientIdInput} onChange={handlePatientIdChange} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('patientName')}</label>
            <input required name="patientName" type="text" value={patientNameInput} onChange={(e) => setPatientNameInput(e.target.value)} readOnly={isExistingPatient} className={`w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-emerald-500 ${isExistingPatient ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">زمن الاستجابة (بالدقائق)</label>
            <input required name="responseTime" type="number" min="0" step="0.5" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">النتيجة (Outcome)</label>
            <input required name="outcome" type="text" placeholder="مثال: نجاة، وفاة" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="md:col-span-2">
            <button disabled={submitting} type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center min-w-[120px]">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">سجل حالات الكود بلو</h2>
        </div>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 font-medium">التاريخ والوقت</th>
                <th className="p-4 font-medium">{translate('patientId')}</th>
                <th className="p-4 font-medium">{translate('patientName')}</th>
                <th className="p-4 font-medium">زمن الاستجابة</th>
                <th className="p-4 font-medium">النتيجة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">جاري التحميل...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">لا توجد بيانات</td></tr>
              ) : (
                data.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 text-sm">{item.date}</td>
                    <td className="p-4 font-medium">{item.patientId}</td>
                    
                    
                    <td className="p-4">{item.responseTime} دقيقة</td>
                    <td className="p-4">{item.outcome}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">لا توجد بيانات</div>
          ) : (
            data.map((item, i) => (
              <div key={i} className="p-4 space-y-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.patientName || '-'}</h3>
                    <div className="text-sm text-gray-500 mt-1">ID: {item.patientId}</div>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {item.responseTime} دقيقة
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="text-gray-500 block text-xs">التاريخ والوقت</span>
                    <span className="font-medium">{item.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">النتيجة</span>
                    <span className="font-medium">{item.outcome}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
