const fs = require('fs');
let code = fs.readFileSync('src/components/AdmissionsView.tsx', 'utf8');
code = code.replace(
`          </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('ward')}</label>`,
`          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('ward')}</label>`);
fs.writeFileSync('src/components/AdmissionsView.tsx', code);
