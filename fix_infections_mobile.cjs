const fs = require('fs');
let code = fs.readFileSync('src/components/InfectionsView.tsx', 'utf8');

const targetTableStart = `        <div className="overflow-x-auto">
          <table className="w-full text-right">`;

const replacement = `        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right">`;

code = code.replace(targetTableStart, replacement);

const targetTableRows = `                    <td className="p-4">{item.patientName || '-'}</td>
                    <td className="p-4">{item.patientName || '-'}</td>
                    <td className="p-4">{item.infectionType}</td>
                    <td className="p-4">{item.infectionSite}</td>
                    <td className="p-4">{item.isolationProtocol}</td>`;

const replacementRows = `                    <td className="p-4">{item.patientName || '-'}</td>
                    <td className="p-4">{item.infectionType}</td>
                    <td className="p-4">{item.infectionSite}</td>
                    <td className="p-4">{item.isolationProtocol}</td>`;

code = code.replace(targetTableRows, replacementRows);

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
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {item.infectionType}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="text-gray-500 block text-xs">التاريخ والوقت</span>
                    <span className="font-medium">{item.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">المكان</span>
                    <span className="font-medium">{item.infectionSite}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs">العزل</span>
                    <span className="font-medium">{item.isolationProtocol}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>`;

code = code.replace(targetTableEnd, replacementEnd);
fs.writeFileSync('src/components/InfectionsView.tsx', code);
