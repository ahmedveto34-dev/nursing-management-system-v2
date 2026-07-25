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
  
  if (!code.includes("import { showToast }")) {
    code = code.replace("import React,", "import React, { useState } from 'react';\nimport { showToast } from './Toast';\n//");
  }
  
  // Try to find the end of the try block in handleSubmit and add the toast before form.reset()
  // Or just before the catch block if form.reset is missing or elsewhere.
  // Actually, standard is form.reset()
  if (code.includes('form.reset();') && !code.includes('showToast(')) {
    code = code.replace('form.reset();', "form.reset();\n      showToast('كل مؤشر صحي يتم تسجيله بدقة هو خطوة نحو رعاية أفضل وسلامة أكبر للمريض.');");
    fs.writeFileSync(path, code);
    console.log("Patched", view);
  } else if (!code.includes('showToast(')) {
    // If form.reset() is not found, just put it before catch
    code = code.replace('} catch (err', "showToast('كل مؤشر صحي يتم تسجيله بدقة هو خطوة نحو رعاية أفضل وسلامة أكبر للمريض.');\n    } catch (err");
    fs.writeFileSync(path, code);
    console.log("Patched (fallback)", view);
  }
});
