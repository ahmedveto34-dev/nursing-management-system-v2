const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `          <div className="max-w-7xl mx-auto print:max-w-none mt-12 text-sm text-slate-400 font-medium pb-8 w-full flex justify-end">
            <span>(تحت إشراف مس/ هبة كريم)</span>
          </div>`,
  `          <div className="max-w-7xl mx-auto print:max-w-none mt-12 text-sm text-slate-400 font-medium pb-8 w-full text-right" dir="rtl">
            <span className="print:text-black">(تحت إشراف مس/ هبة كريم)</span>
          </div>`
);

fs.writeFileSync('src/App.tsx', code);
