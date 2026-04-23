import * as mysql from 'mysql2/promise';

async function test() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Michael#12345',
    database: 'appointment_db'
  });
  const [rows] = await conn.execute('SELECT * FROM services');
  console.log('✅ Result:', JSON.stringify(rows, null, 2));
  await conn.end();
}

test().catch((e: any) => console.error('❌ Error:', e.message));