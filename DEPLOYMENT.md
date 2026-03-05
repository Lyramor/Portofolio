# Deployment Documentation — CyliaTech Portfolio

> Dokumentasi lengkap untuk deploy, konfigurasi, dan maintenance project ini di VPS Ubuntu.

---

## Stack

| Komponen | Versi |
|---|---|
| OS | Ubuntu 22.04 |
| Node.js | v20.x |
| npm | v10.x |
| Next.js | 14.x |
| MySQL | 8.0 |
| Nginx | latest |
| PM2 | 6.x |

---

## 1. Persiapan Server

### Install Node.js (v20)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install MySQL
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### Install Nginx
```bash
sudo apt install -y nginx
```

### Install PM2 (process manager)
```bash
npm install -g pm2
```

---

## 2. Clone & Setup Project

```bash
cd /var/www
git clone <repo-url> CyliaTech
cd CyliaTech
npm install
```

---

## 3. Environment Variables

Buat file `.env` di root project:

```env
# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=portofolio

# JWT Secret (untuk auth admin)
JWT_SECRET=your_random_secret_string

# Email (untuk form contact)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_SECURE=false
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
```

> **Penting:** File `.env` sudah ada di `.gitignore`, jangan pernah di-commit.

---

## 4. Setup Database

### Buat database MySQL
```bash
mysql -u root -p
```
```sql
CREATE DATABASE portofolio;
CREATE USER 'cylia_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON portofolio.* TO 'cylia_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Inisialisasi tabel & seed data awal
```bash
npm run init
```

Perintah ini akan:
- Membuat semua tabel (skills, experience, projects, organizations, speaking, awards, dll.)
- Membuat admin user default
- Mengisi skill descriptions

---

## 5. Buat Folder Upload

Next.js production **tidak** serve file baru di `public/` secara otomatis — semua upload wajib di-serve lewat Nginx (lihat bagian Nginx).

```bash
mkdir -p /var/www/CyliaTech/public/uploads/skills
mkdir -p /var/www/CyliaTech/public/uploads/projects
mkdir -p /var/www/CyliaTech/public/uploads/activities
chmod -R 755 /var/www/CyliaTech/public/uploads
```

> **Kenapa perlu ini:** Next.js `next start` hanya me-serve file statis yang sudah ada saat server pertama kali jalan. File yang di-upload setelah server jalan tidak terbaca oleh Next.js. Solusinya adalah Nginx yang serve folder `/uploads/` langsung dari filesystem.

---

## 6. Build & Jalankan dengan PM2

### Build project
```bash
cd /var/www/CyliaTech
npm run build
```

### Jalankan via PM2
```bash
pm2 start npm --name "cylia" -- start -- -p 3002
pm2 save
pm2 startup
```

### Perintah PM2 umum
```bash
pm2 restart cylia      # restart app
pm2 stop cylia         # stop app
pm2 logs cylia         # lihat log
pm2 status             # cek status semua app
```

---

## 7. Konfigurasi Nginx

### SSL — Cloudflare Origin Certificate

Taruh file certificate dari Cloudflare di:
```
/etc/ssl/cloudflare/cyliatech.crt
/etc/ssl/cloudflare/cyliatech.key
```

```bash
sudo mkdir -p /etc/ssl/cloudflare
# paste isi certificate dari Cloudflare dashboard
sudo nano /etc/ssl/cloudflare/cyliatech.crt
sudo nano /etc/ssl/cloudflare/cyliatech.key
sudo chmod 600 /etc/ssl/cloudflare/cyliatech.key
```

### Config Nginx

Buat file `/etc/nginx/sites-available/cylia`:

```nginx
server {
    listen 80;
    server_name cyliatech.my.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name cyliatech.my.id;

    ssl_certificate     /etc/ssl/cloudflare/cyliatech.crt;
    ssl_certificate_key /etc/ssl/cloudflare/cyliatech.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Batas ukuran upload (sesuaikan kebutuhan)
    client_max_body_size 20M;

    # ⚠️ PENTING: Serve uploaded files langsung dari filesystem
    # Ini wajib karena Next.js production tidak serve file upload baru
    location /uploads/ {
        alias /var/www/CyliaTech/public/uploads/;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        try_files $uri =404;
    }

    # Proxy semua request ke Next.js
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Aktifkan config
```bash
sudo ln -s /etc/nginx/sites-available/cylia /etc/nginx/sites-enabled/cylia
sudo nginx -t          # test config
sudo systemctl reload nginx
```

---

## 8. Update / Redeploy

Setiap kali ada perubahan kode:

```bash
cd /var/www/CyliaTech
git pull
npm install            # kalau ada dependency baru
npm run build
pm2 restart cylia
```

---

## 9. Package / Plugin yang Diinstall

### Dependencies Utama

| Package | Kegunaan |
|---|---|
| `next` 14 | Framework React full-stack |
| `react` + `react-dom` | UI library |
| `mysql2` | Koneksi ke database MySQL |
| `bcryptjs` | Hash password admin |
| `jsonwebtoken` | JWT auth untuk admin panel |
| `next-auth` | Session management |
| `multer` | Handle file upload (gambar) |
| `sharp` | Optimasi gambar |
| `trix` | Rich text editor (Trix) untuk deskripsi |
| `framer-motion` | Animasi (Activities slider, dll.) |
| `react-icons` | Icon set (Fi, dll.) |
| `react-hot-toast` | Notifikasi toast |
| `react-dnd` + `react-dnd-html5-backend` | Drag & drop urutan project/skill |
| `lucide-react` | Icon tambahan |
| `nodemailer` | Kirim email dari form contact |
| `prop-types` | Type checking komponen |
| `uuid` | Generate unique ID |
| `zod` | Validasi data |
| `@react-three/fiber` + `drei` | 3D elements (Three.js wrapper) |
| `@fortawesome/react-fontawesome` | FontAwesome icons |

### DevDependencies

| Package | Kegunaan |
|---|---|
| `tailwindcss` | Utility-first CSS framework |
| `postcss` | CSS processor (diperlukan Tailwind) |
| `eslint` + `eslint-config-next` | Linting |

---

## 10. Hal Penting yang Perlu Diketahui

### Upload Gambar
- Gambar yang di-upload disimpan di `public/uploads/{skills|projects|activities}/`
- **Nginx wajib** punya block `location /uploads/` agar file terbaca di production
- Tanpa block tersebut, semua gambar yang di-upload akan **404**
- Ukuran maksimal upload: **20MB** (diatur di Nginx `client_max_body_size`)

### `'use client'` Directive
- Semua komponen yang pakai hooks (`useState`, `useEffect`, dll.) **wajib** punya `'use client'` di **baris pertama**
- Jangan taruh komentar di atas `'use client'` — akan menyebabkan crash

### next/image vs `<img>`
- Project ini menggunakan tag `<img>` biasa (bukan `next/image`) untuk gambar dari upload
- Alasan: `next/image` crash ketika `src` bernilai `null` (`TypeError: Cannot read properties of null (reading 'default')`)
- `next.config.mjs` sudah set `unoptimized: true` dan `dangerouslyAllowSVG: true`

### Force Dynamic
- `page.jsx` homepage pakai `export const dynamic = 'force-dynamic'`
- Ini agar data dari DB selalu fresh, tidak di-cache oleh Next.js

### Port
- Next.js jalan di port **3002** (bukan default 3000)
- Diatur di PM2: `npm start -- -p 3002`

---

## 11. Struktur Folder Penting

```
/var/www/CyliaTech/
├── src/
│   ├── app/
│   │   ├── page.jsx                  # Homepage (Server Component)
│   │   ├── lyramor/                  # Admin panel
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx              # Admin dashboard
│   │   │   ├── projects/
│   │   │   ├── skills/
│   │   │   ├── experience/
│   │   │   ├── organizations/
│   │   │   ├── speaking/
│   │   │   └── awards/
│   │   └── api/
│   │       └── admin/                # API routes
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ImageUploader.jsx     # Komponen upload gambar
│   │   │   ├── TrixEditor.jsx        # Rich text editor
│   │   │   └── SkillsSelector.jsx
│   │   ├── Experience.jsx            # Section experience (dengan See More)
│   │   ├── Project.jsx               # Section project (dengan modal detail)
│   │   ├── ProjectCard.jsx
│   │   ├── ProjectDetail.jsx         # Modal detail project
│   │   ├── Activities.jsx            # Slider auto-rotate 6 detik
│   │   └── ...
│   └── lib/
│       ├── db.js                     # Database queries & seeder
│       ├── init.js                   # Script inisialisasi DB
│       └── auth.js
├── public/
│   └── uploads/                      # Folder gambar upload
│       ├── skills/
│       ├── projects/
│       └── activities/
├── .env                              # ⚠️ Jangan di-commit!
├── next.config.mjs
└── package.json
```
