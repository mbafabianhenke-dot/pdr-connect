/**
 * One-shot script: applies migration 011 (storage RLS + documents policies)
 * Run: node scripts/run-migration-011.js
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SUPABASE_URL      = 'https://spmbtjynxbqpecgumadv.supabase.co';
const SERVICE_ROLE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbWJ0anlueGJxcGVjZ3VtYWR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTU5NjkwMSwiZXhwIjoyMDk1MTcyOTAxfQ.Da-kS6xYNIM-kfwI031WcucYXcXrLFRkXm9YkixMZ2w';

const sql = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/011_storage_rls_fixes.sql'),
  'utf8'
);

function post(url, body, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, body }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Applying migration 011 via Supabase Management API...\n');

  // Try the Supabase Management API endpoint
  const PROJECT_REF = 'spmbtjynxbqpecgumadv';

  // Split SQL into individual statements (skip empty + comments)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute.\n`);

  // Use the Supabase REST API rpc endpoint to execute each statement
  // via a custom exec_sql function if it exists
  // First, check if exec_sql exists:
  const checkRes = await post(
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    { sql_string: 'SELECT 1' },
    {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    }
  );

  if (checkRes.status === 200) {
    console.log('exec_sql function found! Running statements...\n');
    for (const stmt of statements) {
      const res = await post(
        `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        { sql_string: stmt + ';' },
        {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
        }
      );
      if (res.status !== 200) {
        console.error(`FAILED:\n${stmt}\nError:`, JSON.stringify(res.body, null, 2));
      } else {
        const preview = stmt.substring(0, 60).replace(/\n/g, ' ');
        console.log(`✅ ${preview}...`);
      }
    }
  } else {
    // Fallback: try pg_meta endpoint (Supabase Studio internal)
    console.log('exec_sql not available. Trying /pg/query endpoint...');

    const metaRes = await post(
      `${SUPABASE_URL.replace('https://', 'https://api.supabase.com/v1/projects/spmbtjynxbqpecgumadv')}/database/query`,
      { query: sql },
      {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    );

    console.log('pg/query result:', metaRes.status, JSON.stringify(metaRes.body).substring(0, 200));

    if (metaRes.status !== 200) {
      console.log('\n⚠️  Cannot auto-apply via API. Please run the SQL manually:');
      console.log('1. Open https://app.supabase.com/project/spmbtjynxbqpecgumadv/sql/new');
      console.log('2. Paste the contents of: supabase/migrations/011_storage_rls_fixes.sql');
      console.log('3. Click Run\n');
      process.exit(1);
    }
  }

  console.log('\n✅ Migration 011 applied successfully!');
}

main().catch(e => { console.error(e); process.exit(1); });
