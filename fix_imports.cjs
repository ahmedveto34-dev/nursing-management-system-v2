const fs = require('fs');
const views = [
  'AdmissionsView.tsx',
  'BedsoresView.tsx',
  'CardiacView.tsx',
  'FallsView.tsx',
  'InfectionsView.tsx',
  'RRTView.tsx'
];

views.forEach(view => {
  const path = 'src/components/' + view;
  let code = fs.readFileSync(path, 'utf8');
  
  if (code.includes('import { showToast } from \'./Toast\';\n// { useEffect, useState } from \'react\';')) {
    code = code.replace("import React, { useState } from 'react';\nimport { showToast } from './Toast';\n// { useEffect, useState } from 'react';", "import React, { useEffect, useState } from 'react';\nimport { showToast } from './Toast';");
    fs.writeFileSync(path, code);
  } else if (code.includes('// {')) {
     code = code.replace(/import React, \{ useState \} from 'react';\nimport \{ showToast \} from '\.\/Toast';\n\/\/(.*)from 'react';/, "import React, $1 from 'react';\nimport { showToast } from './Toast';");
     fs.writeFileSync(path, code);
  }
});
