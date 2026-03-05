import { initializeDatabase, seedAdminUser } from './db.js';

async function main() {
  console.log('Initializing database...');
  await initializeDatabase();
  console.log('Seeding admin user...');
  await seedAdminUser();
  console.log('Done!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Init failed:', err);
  process.exit(1);
});
