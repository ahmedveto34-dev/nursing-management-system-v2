import React, { useEffect, useState } from 'react';
import { getRRT, addRRT } from '../lib/api';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function RRTView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { translate } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getRRT();
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
      ward: formData.get('ward') as string,
      reason: formData.get('reason') as string,
      outcome: formData.get('outcome') as string,
    };
    
    try {
      const isDuplicate = data.some(item => item.patientId === payload.patientId && item.reason === payload.reason);
      if (isDuplicate) {
        if (!window.confirm(translate('duplicateWarning'))) {
          setSubmitting(false);
          return;
        }
      }

      await addRRT(payload);
      form.reset();
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(translate('saveError') + '\n' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <h2 className="text-xl font-bold mb-4">{translate('newCase')} - RRT</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('ward')}</label>
            <input required name="ward" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('rrtReason')}</label>
            <input required name="reason" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('outcome')}</label>
            <input required name="outcome" type="text" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="md:col-span-2">
            <button disabled={submitting} type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center min-w-[120px]">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : translate('save')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">{translate('rrt')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 font-medium">{translate('dateAndTime')}</th>
                <th className="p-4 font-medium">{translate('patientId')}</th>
                <th className="p-4 font-medium">{translate('patientName')}</th>
                <th className="p-4 font-medium">{translate('ward')}</th>
                <th className="p-4 font-medium">{translate('rrtReason')}</th>
                <th className="p-4 font-medium">{translate('outcome')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">{translate('loading')}</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">{translate('noData')}</td></tr>
              ) : (
                data.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 text-sm">{item.date}</td>
                    <td className="p-4 font-medium">{item.patientId}</td>
                    <td className="p-4">{item.patientName || '-'}</td>
                    <td className="p-4">{item.ward}</td>
                    <td className="p-4">{item.reason}</td>
                    <td className="p-4">{item.outcome}</td>
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
