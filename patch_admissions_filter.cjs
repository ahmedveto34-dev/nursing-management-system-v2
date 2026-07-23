const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');

code = code.replace(
  `{loading ? (`,
  `{(() => {
    const activeAdmissions = data.filter(item => !item.dischargeDate);
    return loading ? (`
);

code = code.replace(
  `) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    {translate('noData')}
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (`,
  `) : activeAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    {translate('noData')}
                  </td>
                </tr>
              ) : (
                activeAdmissions.map((item, i) => (`
);

code = code.replace(
  `                  </tr>
                ))
              )}`,
  `                  </tr>
                ))
              );
            })()}`
);

// Mobile cards
code = code.replace(
  `<div className="md:hidden flex flex-col divide-y divide-gray-100">
          {loading ? (`,
  `<div className="md:hidden flex flex-col divide-y divide-gray-100">
          {(() => {
            const activeAdmissions = data.filter(item => !item.dischargeDate);
            return loading ? (`
);

code = code.replace(
  `) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {translate('noData')}
            </div>
          ) : (
            data.map((item, i) => (`,
  `) : activeAdmissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {translate('noData')}
            </div>
          ) : (
            activeAdmissions.map((item, i) => (`
);

code = code.replace(
  `              </div>
            ))
          )}
        </div>`,
  `              </div>
            ))
          );
          })()}
        </div>`
);

fs.writeFileSync('src/components/AdmissionsView.tsx', code);
