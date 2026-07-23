import React, { useEffect, useState } from 'react';
import { getAdmissions } from '../lib/api';
import { differenceInDays, differenceInHours } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function ArchiveView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      
      if (days === 0 && hours === 0) return `< 1 ${translate('hours')}`;
      
      let res = '';
      if (days > 0) res += `${days} ${translate('days')} `;
      if (hours > 0) res += `${hours} ${translate('hours')}`;
      
      return res.trim();
    } catch(e) {
      return '-';
    }
  };

  const activeAdmissions = data.filter(item => !!item.dischargeDate);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">أرشيف الخروج</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
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
              ) : activeAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    {translate('noData')}
                  </td>
                </tr>
              ) : (
                activeAdmissions.map((item, i) => (
                  <tr key={item.id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm">{item.admissionDate || item.date || '-'}</td>
                    <td className="p-4 text-sm">{item.dischargeDate || '-'}</td>
                    <td className="p-4 font-medium">{item.patientId}</td>
                    <td className="p-4">{item.patientName || '-'}</td>
                    <td className="p-4">{item.ward || '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${(item.status === 'دخول' || item.type === 'دخول') && !item.dischargeDate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
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

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : activeAdmissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {translate('noData')}
            </div>
          ) : (
            activeAdmissions.map((item, i) => (
              <div key={item.id || i} className="p-4 space-y-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.patientName || '-'}</h3>
                    <div className="text-sm text-gray-500 mt-1">ID: {item.patientId}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${(item.status === 'دخول' || item.type === 'دخول') && !item.dischargeDate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.dischargeDate ? 'خروج' : (item.status || item.type || 'دخول')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="text-gray-500 block text-xs">الجناح</span>
                    <span className="font-medium">{item.ward || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">{translate('los')}</span>
                    <span className="font-medium">{item.dischargeDate ? calculateLOS(item.admissionDate || item.date, item.dischargeDate) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">تاريخ الدخول</span>
                    <span className="font-medium">{item.admissionDate || item.date || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">تاريخ الخروج</span>
                    <span className="font-medium">{item.dischargeDate || '-'}</span>
                  </div>
                </div>
                
                {item.dischargeDate && (
                  <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-gray-500 block text-xs mb-1">بيانات الخروج</span>
                    <div>السبب: <span className="font-medium">{item.dischargeReason || '-'}</span></div>
                    <div>النوع: <span className="font-medium">{item.dischargeType || '-'}</span></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
