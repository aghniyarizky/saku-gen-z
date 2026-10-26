# SAKU SEHAT Frontend

## Deskripsi
SAKU SEHAT Frontend adalah antarmuka web untuk aplikasi SAKU SEHAT yang fokus pada pengalaman pengguna dalam mengelola keuangan pribadi. Project ini menyediakan alur autentikasi, dashboard keuangan, pencatatan transaksi, serta fitur pengelolaan pinjaman dengan desain modern berbasis Next.js dan React. Aplikasi ini dirancang untuk membantu pengguna masuk ke sistem, melihat kondisi keuangan mereka, dan mengelola aktivitas finansial secara lebih terstruktur.

Dokumentasi ini memberikan gambaran umum mengenai fitur, struktur proyek, setup lokal, serta standar kontribusi yang digunakan dalam repository ini.

## Key Features
- Alur registrasi pengguna dengan validasi input seperti nama lengkap, username, email, password, dan konfirmasi password.
- Proses verifikasi akun melalui OTP untuk memastikan identitas pengguna.
- Halaman login dengan alur sederhana dan dukungan penyimpanan token sementara untuk pengalaman demo.
- Dashboard dengan ringkasan saldo, pemasukan, pengeluaran, pinjaman aktif, dan grafik keuangan.
- Modul transaksi yang mencakup tampilan daftar transaksi, scan struk, dan tambah transaksi.
- Modul kelola pinjaman yang mencakup daftar pinjaman, tambah pinjaman, dan kalkulator bunga.
- UI responsif dengan desain dark mode dan komponen yang terorganisir untuk pengalaman pengguna yang konsisten.

## Preview
Berikut adalah contoh endpoint yang digunakan oleh frontend untuk berinteraksi dengan backend pada alur autentikasi.

### 1. Register
Endpoint:
```http
POST /api/auth/register
```

Contoh request:
```json
{
  "fullName": "Budi Santoso",
  "username": "budis",
  "email": "budi@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

Contoh response:
```json
{
  "success": true,
  "message": "Pendaftaran berhasil, silakan cek email untuk kode OTP",
  "data": {
    "email": "budi@example.com"
  }
}
```

Validasi:
- Password dan confirmPassword harus sama.
- Email, username, dan password wajib diisi.
- Frontend menampilkan pesan error jika registrasi gagal.

### 2. Verify OTP
Endpoint:
```http
POST /api/auth/verify-otp
```

Contoh request:
```json
{
  "email": "budi@example.com",
  "otpCode": "123456"
}
```

Contoh response:
```json
{
  "success": true,
  "message": "Akun berhasil diaktifkan"
}
```

Validasi:
- Kode OTP wajib berupa 6 digit angka.
- Email dan OTP wajib diisi.
- Jika OTP kadaluarsa, pengguna dapat meminta OTP baru.

### 3. Login
Endpoint:
```http
POST /api/auth/login
```

Contoh request:
```json
{
  "identifier": "budis",
  "password": "Password123!"
}
```

Contoh response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Validasi:
- Identifier dan password wajib diisi.
- Jika login gagal, frontend menampilkan pesan kesalahan dari backend.
- Token disimpan ke localStorage setelah login berhasil.

## Project Structure
Struktur folder utama proyek ini adalah sebagai berikut:

```text
app/                  # Halaman utama dan routing Next.js
components/          # Komponen UI yang digunakan di seluruh aplikasi
  auth/               # Komponen untuk register, login, OTP, profil, dan kondisi
  main/               # Dashboard, grafik, sidebar, transaksi, dan pinjaman
public/              # Asset statis seperti gambar dan ikon
services/            # Tempat untuk logika API atau service layer
next.config.ts       # Konfigurasi Next.js
package.json         # Daftar dependency dan script project
tsconfig.json        # Konfigurasi TypeScript
```

Penjelasan folder penting:
- app/page.tsx: mengatur navigasi antar tampilan berdasarkan mode seperti register, login, dashboard, transaksi, dan pinjaman.
- components/auth/register.tsx: tampilan dan logika registrasi pengguna.
- components/auth/login.tsx: tampilan dan logika login pengguna.
- components/main/dashboard.tsx: halaman dashboard utama dengan ringkasan keuangan.
- components/main/catatan-keuangan/: berisi modul transaksi dan pengelolaan pinjaman.
- .env: berisi konfigurasi environment variable lokal seperti URL backend.

## Tech Stack
Teknologi yang digunakan dalam project ini:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Axios
- Material Icons
- ESLint

## Local Setup
Berikut langkah setup project di local.

### Prerequisites
Sebelum menjalankan project, pastikan perangkat Anda sudah menyiapkan:
- Node.js 20+ (disarankan versi 20.18 atau 22)
- npm atau pnpm
- Git
- Koneksi internet untuk mengakses backend API

### 1. Clone repository
```bash
git clone <repository-url>
cd saku-sehat-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Konfigurasi environment variable
Buat file .env jika belum ada, lalu isi variabel berikut:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Jika Anda menggunakan backend yang sudah di-deploy, gunakan URL backend tersebut, misalnya:
```env
NEXT_PUBLIC_API_URL=https://saku-sehat-backend.vercel.app
```

### 4. Jalankan project secara local
```bash
npm run dev
```

Setelah itu buka browser ke:
```text
http://localhost:3000
```

## Documentation
Dokumentasi resmi teknologi yang digunakan:
- Next.js: https://nextjs.org/docs
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- Axios: https://axios-http.com/docs/intro
- ESLint: https://eslint.org/docs/latest/

## Commit Format Standards
Repository ini disarankan menggunakan format commit message yang konsisten seperti berikut:

```text
type(scope): subject
```

Contoh:
```text
feat(auth): add login page UI
fix(otp): handle expired otp state
docs(readme): update project documentation
chore(deps): upgrade next.js to latest patch
refactor(transactions): simplify transaction state flow
```

Standar yang umum dipakai:
- feat: penambahan fitur baru
- fix: perbaikan bug
- docs: perubahan dokumentasi
- chore: tugas maintenance seperti update dependency
- refactor: perbaikan struktur kode tanpa mengubah perilaku
