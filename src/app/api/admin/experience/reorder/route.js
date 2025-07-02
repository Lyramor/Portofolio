// src/app/api/admin/experience/reorder/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache'; // Import revalidatePath

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { experienceIds } = await request.json();
    
    if (!Array.isArray(experienceIds) || experienceIds.length === 0) {
      return NextResponse.json({ error: 'Invalid experience IDs' }, { status: 400 });
    }
    
    // Hapus baris ALTER TABLE dari sini.
    // Kolom `display_order` seharusnya sudah ada dari inisialisasi database.
    // Menjalankan ALTER TABLE di setiap permintaan reorder tidak efisien dan bisa menyebabkan masalah.
    
    // Gunakan transaksi untuk memastikan semua pembaruan berhasil atau tidak sama sekali
    // Perhatikan: Fungsi `query` Anda saat ini tidak mendukung transaksi langsung per panggilan.
    // Jika Anda ingin transaksi atomik, Anda perlu memodifikasi `db.js` untuk mengekspos
    // `connection.beginTransaction()`, `connection.commit()`, dan `connection.rollback()`.
    // Untuk saat ini, kita akan menjalankan UPDATE secara berurutan.
    
    for (let i = 0; i < experienceIds.length; i++) {
      // Pastikan experienceIds[i] adalah angka yang valid.
      // Meskipun frontend mengirimnya sebagai angka, validasi ekstra tidak ada salahnya.
      const experienceId = parseInt(experienceIds[i], 10);
      if (isNaN(experienceId)) {
          console.warn(`Invalid experience ID found during reorder: ${experienceIds[i]}`);
          continue; // Lewati ID yang tidak valid
      }

      await query(
        'UPDATE experience SET display_order = ? WHERE id = ?',
        [i + 1, experienceId] // Mengatur urutan baru (dimulai dari 1)
      );
    }
    
    // Revalidate paths untuk memastikan data terbaru ditampilkan di frontend
    revalidatePath('/lyramor/experience'); // Untuk halaman admin experience
    revalidatePath('/api/experiences'); // Untuk API publik yang digunakan di halaman utama
    revalidatePath('/'); // Untuk halaman utama jika menampilkan pengalaman langsung

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering experiences:', error);
    // Berikan pesan error yang lebih informatif jika memungkinkan
    return NextResponse.json({ error: 'Internal server error during reorder' }, { status: 500 });
  }
}
