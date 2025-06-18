import { initializeDatabase, seedAdminUser } from './db.js';

export async function initializeApp() {
  try {
    console.log('🔧 Initializing database...');
    await initializeDatabase();

    console.log('👤 Seeding admin user...');
    await seedAdminUser();

    console.log('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    throw error;
  }
}

// Jalankan hanya di server-side
if (typeof window === 'undefined') {
  initializeApp().catch(console.error);
}
