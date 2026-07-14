const fs = require('fs');

const views = [
  'src/components/BedsoresView.tsx',
  'src/components/InfectionsView.tsx',
  'src/components/FallsView.tsx',
  'src/components/CardiacView.tsx'
];

views.forEach(v => {
  let content = fs.readFileSync(v, 'utf8');

  // Replace header
  content = content.replace(/<th className="p-4 font-medium">رقم المريض<\/th>/, '<th className="p-4 font-medium">{translate(\'patientId\')}</th>\n                <th className="p-4 font-medium">{translate(\'patientName\')}</th>');
  
  // Replace cell
  content = content.replace(/<td className="p-4 font-medium">{item\.patientId}<\/td>/, '<td className="p-4 font-medium">{item.patientId}</td>\n                    <td className="p-4">{item.patientName || \'-\'}</td>');

  fs.writeFileSync(v, content);
});
