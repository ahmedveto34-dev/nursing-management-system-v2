const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `             {renderView()}
          </div>
        </div>
      </main>
    </div>`,
  `             {renderView()}
          </div>
          <div className="max-w-7xl mx-auto print:max-w-none mt-12 text-sm text-slate-400 font-medium pb-8 w-full flex justify-end">
            <span>(تحت إشراف مس/ هبة كريم)</span>
          </div>
        </div>
      </main>
    </div>`
);

fs.writeFileSync('src/App.tsx', code);
