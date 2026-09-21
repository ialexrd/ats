const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./ats74-52170-firebase-adminsdk-fbsvc-055fe2d995.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

(async () => {
  const snap = await db.collection('crm').doc('state').get();
  const data = snap.data();
  console.log('_rev:', data._rev);

  const query = process.argv[2] || '';
  const digits = query.replace(/\D/g, '');
  const matchClients = (data.clients || []).filter(c =>
    (c.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (digits && (c.phone || '').replace(/\D/g, '').includes(digits))
  );
  console.log(`\nКлиенты, совпавшие с "${query}":`, matchClients.length);
  matchClients.forEach(c => console.log(JSON.stringify(c)));

  const clientIds = matchClients.map(c => c.id);
  const matchBookings = (data.bookings || []).filter(b => clientIds.includes(b.clientId));
  console.log(`\nЗаписи этих клиентов:`, matchBookings.length);
  matchBookings.forEach(b => console.log(JSON.stringify(b)));
})().catch(e => { console.error('ERROR', e); process.exit(1); });
