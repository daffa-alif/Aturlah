/**
 * TITIK TEMU COFFEEHOUSE - COMMON APP SCRIPT
 * Navigasi dinamis, deteksi sesi, dan render elemen bersama
 */

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  renderFooter();
});

// Render Dynamic Navbar
function renderNavbar() {
  const navContainer = document.getElementById("main-nav");
  if (!navContainer) return;

  const session = Store.getSession();
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  let userSectionHtml = "";
  let adminLinkHtml = "";

  if (session) {
    const isBarista = session.role === "ADMIN";
    if (isBarista) {
      adminLinkHtml = `
        <a href="admin.html" class="nav-item ${currentPath === "admin.html" ? "active" : ""}" style="color: #b87431; font-weight: 800;">
          ☕ Panel Barista
        </a>
      `;
    }

    userSectionHtml = `
      <div class="nav-user">
        <a href="profile.html" class="user-badge">
          <span>☕ ${escapeHtml(session.name)}</span>
          <span class="user-role-tag">${session.role === "ADMIN" ? "BARISTA" : "MEMBER"}</span>
        </a>
        <button onclick="handleLogout()" class="btn btn-outline btn-sm" title="Keluar & Bersihkan Sesi">
          Keluar
        </button>
      </div>
    `;
  } else {
    userSectionHtml = `
      <div class="nav-user">
        <a href="login.html" class="btn btn-primary btn-sm">
          Masuk Akun Member
        </a>
      </div>
    `;
  }

  navContainer.className = "navbar";
  navContainer.innerHTML = `
    <div class="container nav-inner">
      <a href="index.html" class="brand-link">
        <div class="brand-icon">☕</div>
        <div>
          <div class="brand-title">TITIK TEMU</div>
          <div class="brand-subtitle">Artisan Coffee & Roastery</div>
        </div>
      </a>

      <div class="nav-links">
        <a href="index.html" class="nav-item ${currentPath === "index.html" || currentPath === "" ? "active" : ""}">
          Beranda
        </a>
        <a href="menu.html" class="nav-item ${currentPath === "menu.html" ? "active" : ""}">
          Menu Kopi
        </a>
        <a href="profile.html" class="nav-item ${currentPath === "profile.html" ? "active" : ""}">
          Profil & Pesanan Meja
        </a>
        ${adminLinkHtml}
      </div>

      ${userSectionHtml}
    </div>
  `;
}

// Render Standard Footer
function renderFooter() {
  const footerContainer = document.getElementById("main-footer");
  if (!footerContainer) return;

  footerContainer.className = "footer";
  footerContainer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="brand-link" style="margin-bottom: 12px;">
            <div class="brand-icon" style="background-color: var(--coffee-amber); color: #ffffff;">☕</div>
            <div>
              <div class="brand-title" style="color: #ffffff;">TITIK TEMU COFFEEHOUSE</div>
              <div class="brand-subtitle" style="color: #f7b777;">Tempat Berjumpa & Berbagi Cerita Rasa</div>
            </div>
          </div>
          <p class="footer-desc">
            Menyajikan biji kopi single origin terpilih dari berbagai dataran tinggi nusantara.
            Disangrai segar mingguan dan diseduh dengan rasio presisi untuk kenikmatan secangkir kopi otentik.
          </p>
        </div>

        <div>
          <div class="footer-col-title">Jam Operasional</div>
          <ul class="footer-list">
            <li>Senin - Jumat: 08:00 - 22:00 WIB</li>
            <li>Sabtu - Minggu: 07:00 - 23:00 WIB</li>
            <li>Hari Libur Nasional Tetap Buka</li>
            <li style="color: #f7b777; margin-top: 10px; font-weight: 700;">Wi-Fi Berkecepatan Tinggi & Colokan Tersedia</li>
          </ul>
        </div>

        <div>
          <div class="footer-col-title">Lokasi & Kontak</div>
          <ul class="footer-list">
            <li>📍 Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan</li>
            <li>📞 (021) 7890-4321</li>
            <li>💬 WhatsApp Barista: 0812-9988-7766</li>
            <li>✉️ halo@titiktemu.cafe</li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        &copy; ${new Date().getFullYear()} Titik Temu Coffeehouse. Edisi Web Murni (HTML, CSS, JS) - Berjalan Mandiri di Komputer Lokal.
      </div>
    </div>
  `;
}

// Handle Logout Bersih
function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
    Store.logout();
    window.location.href = "login.html";
  }
}

// Helper escape HTML untuk keamanan XSS
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
