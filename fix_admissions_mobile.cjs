const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

// replace the table block with a responsive structure
const targetTableStart = `<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right">`;

const replacement = `<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left rtl:text-right">`;

code = code.replace(targetTableStart, replacement);

const targetTableEnd = `              )}
            </tbody>
          </table>
        </div>
      </div>`;

const replacementEnd = `              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {translate('noData')}
            </div>
          ) : (
            data.map((item, i) => (
              <div key={item.id || i} className="p-4 space-y-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.patientName || '-'}</h3>
                    <div className="text-sm text-gray-500 mt-1">ID: {item.patientId}</div>
                  </div>
                  <span className={\`px-3 py-1 rounded-full text-xs font-medium \${(item.status === 'دخول' || item.type === 'دخول') && !item.dischargeDate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}\`}>
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
      </div>`;

code = code.replace(targetTableEnd, replacementEnd);
fs.writeFileSync('src/components/AdmissionsView.tsx', code);
