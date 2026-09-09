const mysql = require('mysql2/promise');
const { execSync } = require('child_process');

const DB_NAME = 'verde_db_test';

async function createDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await conn.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
  await conn.query(`CREATE DATABASE \`${DB_NAME}\``);
  await conn.end();
  console.log(`[test] Banco "${DB_NAME}" recriado`);
}

function runCli(command) {
  execSync(`npx sequelize-cli ${command} --env test`, {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'test' },
  });
}

async function main() {
  await createDatabase();
  runCli('db:migrate');
  runCli('db:seed:all');
  console.log('[test] Migrations e seeders aplicados no banco de teste');
}

main().catch((err) => {
  console.error('[test] Falha no setup:', err);
  process.exit(1);
});