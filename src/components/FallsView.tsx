import React, { useEffect, useState } from 'react';
import { getFalls, addFall } from '../lib/api';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function FallsView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { translate } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    
try {
      const res = await getFalls();
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
      riskAssessment: formData.get('riskAssessment'),
      location: formData.get('location'),
      postFallAction: formData.get('postFallAction'),
    };
    
    try {
      
      const isDuplicate = data.some(item => item.patientId === payload.patientId && item.riskAssessment === payload.riskAssessment);
      if (isDuplicate) {
        if (!window.confirm(translate('duplicateWarning'))) {
          setSubmitting(false);
          return;
        }
      }

      await addFall(payload);
      form.reset();
      await loadData();
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
        <h2 className="text-xl font-bold mb-4">تسجيل حالة سقوط</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('patientId')}</label>
            <input required name="patientId" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('patientName')}</label>
            <input required name="patientName" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">مكان السقوط</label>
            <input required name="location" type="text" placeholder="مثال: الحمام، الممر" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تقييم الخطر المسبق</label>
            <select required name="riskAssessment" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500">
              <option value="عالي (High)">عالي (High)</option>
              <option value="متوسط (Medium)">متوسط (Medium)</option>
              <option value="منخفض (Low)">منخفض (Low)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الإجراء المتخذ (Post-fall action)</label>
            <input required name="postFallAction" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="md:col-span-2">
            <button disabled={submitting} type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center min-w-[120px]">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">سجل حالات السقوط</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 font-medium">التاريخ والوقت</th>
                <th className="p-4 font-medium">{translate('patientId')}</th>
                <th className="p-4 font-medium">{translate('patientName')}</th>
                <th className="p-4 font-medium">المكان</th>
                <th className="p-4 font-medium">التقييم</th>
                <th className="p-4 font-medium">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">جاري التحميل...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">لا توجد بيانات</td></tr>
              ) : (
                data.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 text-sm">{item.date}</td>
                    <td className="p-4 font-medium">{item.patientId}</td>
                    <td className="p-4">{item.patientName || '-'}</td>
                    <td className="p-4">{item.patientName || '-'}</td>
                    <td className="p-4">{item.location}</td>
                    <td className="p-4">{item.riskAssessment}</td>
                    <td className="p-4">{item.postFallAction}</td>
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
