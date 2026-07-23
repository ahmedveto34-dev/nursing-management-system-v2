const fs = require('fs');
let code = fs.readFileSync('src/components/RRTView.tsx', 'utf8');

const targetTableStart = `        <div className="overflow-x-auto">
          <table className="w-full text-right">`;

const replacement = `        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right">`;

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
            <div className="p-8 text-center text-gray-500">{translate('loading')}</div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{translate('noData')}</div>
          ) : (
            data.map((item, i) => (
              <div key={i} className="p-4 space-y-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.patientName || '-'}</h3>
                    <div className="text-sm text-gray-500 mt-1">ID: {item.patientId}</div>
                  </div>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                    {item.ward}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="text-gray-500 block text-xs">{translate('dateAndTime')}</span>
                    <span className="font-medium">{item.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">{translate('outcome')}</span>
                    <span className="font-medium">{item.outcome}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs">{translate('rrtReason')}</span>
                    <span className="font-medium">{item.reason}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>`;

code = code.replace(targetTableEnd, replacementEnd);
fs.writeFileSync('src/components/RRTView.tsx', code);
