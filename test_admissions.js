import fetch from 'node-fetch';
async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/admissions');
    const data = await res.json();
    console.log("Total records:", data.length);
    console.log(data);
  } catch(e) { console.error(e); }
}
test();
