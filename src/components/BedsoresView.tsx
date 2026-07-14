import React, { useEffect, useState } from 'react';
import { getBedsores, addBedsore } from '../lib/api';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function BedsoresView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getBedsores();
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
    const formData = new FormData(e.currentTarget);
    const payload = {
      date: format(new Date(), 'yyyy-MM-dd HH:mm'),
      patientId: formData.get('patientId'),
      stage: formData.get('stage'),
      location: formData.get('location'),
      progress: formData.get('progress'),
    };
    
    try {
      await addBedsore(payload);
      e.currentTarget.reset();
      await loadData();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <h2 className="text-xl font-bold mb-4">تسجيل حالة قرحة فراش</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم المريض (ID)</label>
            <input required name="patientId" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">مكان القرحة</label>
            <input required name="location" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المرحلة (Stage)</label>
            <select required name="stage" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500">
              <option value="المرحلة الأولى">المرحلة الأولى</option>
              <option value="المرحلة الثانية">المرحلة الثانية</option>
              <option value="المرحلة الثالثة">المرحلة الثالثة</option>
              <option value="المرحلة الرابعة">المرحلة الرابعة</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">حالة الالتئام</label>
            <select required name="progress" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500">
              <option value="في تحسن">في تحسن</option>
              <option value="مستقرة">مستقرة</option>
              <option value="تدهور">تدهور</option>
            </select>
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
          <h2 className="text-xl font-bold">سجل قرح الفراش</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 font-medium">التاريخ والوقت</th>
                <th className="p-4 font-medium">رقم المريض</th>
                <th className="p-4 font-medium">المكان</th>
                <th className="p-4 font-medium">المرحلة</th>
                <th className="p-4 font-medium">التطور</th>
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
                    <td className="p-4">{item.location}</td>
                    <td className="p-4">{item.stage}</td>
                    <td className="p-4">{item.progress}</td>
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
