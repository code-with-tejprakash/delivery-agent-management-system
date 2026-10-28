require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'delivery_app',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'delivery_agents',
    multipleStatements: true
  });
  const schema = fs.readFileSync(path.join(__dirname, '../../sql/schema.sql'), 'utf8')
    .replace(/^\s*CREATE DATABASE IF NOT EXISTS delivery_agents;\s*/i, '')
    .replace(/^\s*USE delivery_agents;\s*/i, '');
  await connection.query(schema);
  await connection.end();
  console.log('Database schema initialized.');
}
main().catch((error) => {
  console.error('Database initialization failed:', error.message);
  process.exit(1);
});
