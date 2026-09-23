# ☕ Titik Temu Coffeehouse (Artisan Coffee & Roastery)

Aplikasi web pemesanan dan manajemen kafe lokal berbasis **HTML, CSS, dan JavaScript murni tanpa backend**, dirancang khusus untuk berjalan secara mandiri di komputer lokal tanpa dependensi database eksternal.

---

## 🛠️ Tech Stack & Arsitektur

Proyek ini dibangun secara eksklusif menggunakan teknologi web standar tanpa framework berat atau bundler:

| Komponen | Teknologi | Keterangan & Rincian Teknis |
| :--- | :--- | :--- |
| **Markup** | **HTML5 Semantik** | Struktur halaman terorganisir rapi (`index.html`, `menu.html`, `profile.html`, `admin.html`, `login.html`) menggunakan tag semantik (`<nav>`, `<main>`, `<section>`, `<header>`, `<footer>`, `<dialog>/modal`). |
| **Styling** | **Basic CSS Murni** | File tunggal [`css/style.css`](css/style.css) tanpa Tailwind/Bootstrap. Menggunakan CSS Variables (warna kopi espresso, amber karamel, crema foam), Flexbox, CSS Grid responsif, dan efek kertas struk kasir thermal berpori. |
| **Interaktivitas** | **Vanilla JavaScript (ES6+)** | Logika modular murni tanpa runtime Node.js/React. Terbagi ke dalam modul fungsional: `store.js`, `app.js`, `menu.js`, `profile.js`, dan `admin.js`. |
| **Penyimpanan Data** | **Client-Side Cache (`localStorage`)** | Berfungsi sebagai database persisten lokal. Menyimpan data katalog menu kopi, daftar akun pengguna, antrean pesanan meja, dan sesi login aktif secara instan & offline. |
| **Live Server** | **Python `http.server`** | Menggunakan server bawaan Python (`python -m http.server 8080`) sebagai server HTTP lokal berkecepatan tinggi tanpa perlu instalasi Apache, NGINX, atau paket npm tambahan. |

---

## 🚀 Cara Menjalankan Aplikasi

Anda dapat menjalankan web ini dengan 2 metode:

### Metode 1: Menggunakan Python sebagai Live Server (Rekomendasi)
Python menyediakan modul live server bawaan yang ringan dan cepat:

1. Buka terminal (PowerShell atau Command Prompt).
2. Pindah ke direktori proyek kafe:
   ```powershell
   cd C:\Users\VICTUS\.gemini\antigravity\scratch\cafe-html
   ```
3. Jalankan server lokal:
   ```powershell
   python -m http.server 8080
   ```
4. Buka browser pada alamat:
   👉 **`http://localhost:8080`**

*(Server lokal saat ini sudah aktif di latar belakang).*

---

### Metode 2: Langsung Buka File di Browser (Tanpa Server)
Karena web ini murni static file:
- Buka folder `C:\Users\VICTUS\.gemini\antigravity\scratch\cafe-html` di File Explorer.
- Klik ganda file **`index.html`**.
- Seluruh halaman, modal QRIS, struk belanja, dan penyimpanan cache lokal tetap berjalan sempurna 100%.

---

## 📂 Struktur Direktori Proyek

```text
C:\Users\VICTUS\.gemini\antigravity\scratch\cafe-html\
├── index.html            # Halaman Beranda (Hero, Nilai Roastery, Kopi Unggulan)
├── menu.html             # Katalog Menu, Filter Kategori, Kustomisasi, & QRIS Meja
├── profile.html          # Profil Pelanggan: Lama Akun, Pelacak Antrean, & Struk Thermal
├── admin.html            # Barista & Kasir Command Center: Status Seduh & CRUD Menu
├── login.html            # Masuk & Pendaftaran Member (Tombol Demo 1-Klik)
├── README.md             # Dokumentasi Lengkap Proyek
├── summary.txt           # Rangkuman Ringkas Teknis Proyek
├── css/
│   └── style.css         # Stylesheet Basic CSS Murni (Palet Warna Artisan Roastery)
└── js/
    ├── store.js          # Cache Engine (localStorage persisten untuk menu, user, pesanan, sesi)
    ├── app.js            # Navigasi Dinamis, Footer, Format Rupiah, & Logout Bersih
    ├── menu.js           # Filter Kategori, Pencarian Realtime, Kustomisasi, & Modal QRIS
    ├── profile.js        # Hitung Usia Akun, Stepper Status Meja, & Pop-up Struk Thermal
    └── admin.js          # Statistik Omzet, Pengubah Status Antrean, & CRUD Menu Kopi
```

---

## ☕ Fitur-Fitur Unggulan

1. **Penyimpanan Cache Terintegrasi**:
   - Menyimpan 10 menu seduhan kopi Indonesia (Aceh Gayo V60, Toraja Sapan, Kopi Susu Aren Senja, Flores Bajawa, dll.) beserta catatan rasa (*tasting notes*), asal daerah (mdpl), dan tingkat sangrai (*roast level*).
2. **Kustomisasi Seduhan Presisi**:
   - Pilihan suhu penyajian (*Hot* / *Iced*), kadar pemanis aren (*Normal* / *50%* / *0%*), jumlah porsi, serta catatan khusus untuk barista.
3. **Pemesanan Meja & QRIS Kafe Dinamis**:
   - Pilihan meja (Meja 01 s/d 06, Bar Counter) atau bungkus (*Takeaway*).
   - Dilengkapi simulasi QR Code QRIS, hitung mundur batas bayar 5 menit, verifikasi akun otomatis, dan bukti struk lunas.
4. **Profil Pelanggan & Durasi Akun**:
   - Menghitung secara otomatis **berapa lama akun telah dibuat** (misal: *"35 hari yang lalu"* atau *"Baru bergabung hari ini"*).
   - Pelacak status meja realtime: `PAID (Lunas)` ➔ `BREWING (Diseduh)` ➔ `READY (Siap Saji)` ➔ `COMPLETED (Selesai)`.
   - Pop-up struk thermal kasir dengan opsi cetak fisik browser (`window.print()`).
5. **Dashboard Barista & Kasir dengan Navigasi Gabungan**:
   - Menampilkan navigasi ganda (panel barista + tombol cepat ke katalog & beranda).
   - Metrik omzet, jumlah cangkir, antrean aktif, dan menu terlaris (*best seller*).
   - Tombol satu-klik untuk memajukan status pesanan antrean meja secara berurutan.
   - Panel CRUD menu kopi (tambah, edit, saklar ketersediaan stok habis/tersedia, dan hapus).
6. **Autentikasi & Logout Bersih**:
   - Tombol 1-klik masuk akun demo.
   - Proses logout seketika menghapus cache sesi browser tanpa meninggalkan cookie atau residu sesi yang tersangkut.

---

## 👤 Akun Demo Bawaan

| Peran | Username | Password | Akses & Fitur |
| :--- | :--- | :--- | :--- |
| **Barista / Kasir (Admin)** | `admin` | `kopiadmin` | Akses penuh dashboard `admin.html`, update status seduhan meja, dan kelola menu kopi (CRUD) |
| **Pelanggan Setia (Member)** | `pelanggan` | `kopienak` | Akses `profile.html`, melihat riwayat pesanan, cek lama keanggotaan akun, dan cetak struk kasir |

---

## 🔒 Pemisahan Direktori & Keamanan Git

Proyek ini berada di folder terpisah (`cafe-html`) dan **tidak memiliki remote Git** sehingga tidak akan pernah ter-push ke GitHub katalog software (`catalogue`). Seluruh data bersifat lokal, aman, dan siap dipindahkan kapan saja.
