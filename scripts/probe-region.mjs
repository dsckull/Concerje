import pg from "pg";

const password = "TR5eVMXxi2_Tpyh";
const projectRef = "xqntkuwtfhpicjkjqaax";

const urls = [
  // Transaction pooler (port 6543)
  `postgresql://postgres.${projectRef}:${password}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`,
  // Session pooler (port 5432)
  `postgresql://postgres.${projectRef}:${password}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`,
  // Try other regions
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`,
  // Direct with SSL
  `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`,
  // IPv4 forced via special supabase hostname format
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
];

for (const url of urls) {
  const label = url.replace(password, "****").split("@")[1];
  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 5000, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const res = await client.query("SELECT count(*) FROM moradores");
    console.log(`✅ SUCCESS: ${label} | moradores: ${res.rows[0].count}`);
    await client.end();
    break;
  } catch(e) {
    console.log(`❌ FAIL: ${label} => ${e.message?.substring(0, 80)}`);
    try { await client.end(); } catch {}
  }
}
