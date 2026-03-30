import pg from "pg";

const password = "TR5eVMXxi2_Tpyh";

// Tentando conectar diretamente pelo endereço IPv6 resolvido pelo DNS local
const ipv6Host = "[2600:1f1e:75b:4b12:af78:b9af:b875:bc84]";
const url = `postgresql://postgres:${password}@${ipv6Host}:5432/postgres`;

console.log("Testando conexão ao IPv6...");

const client = new pg.Client({ 
  connectionString: url, 
  connectionTimeoutMillis: 5000 
});

try {
  await client.connect();
  const res = await client.query("SELECT count(*) FROM moradores");
  console.log(`✅ SUCCESS: conectados via IPv6! Moradores count: ${res.rows[0].count}`);
  await client.end();
} catch(e) {
  console.log(`❌ FAIL: -> ${e.message}`);
}
