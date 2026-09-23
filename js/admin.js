/**
 * TITIK TEMU COFFEEHOUSE - BARISTA & KASIR ADMIN SCRIPT
 * Mengatur metrik kafe, pengubah status antrean seduh, dan CRUD menu kopi
 */

let editingItemId = null;

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
});

function checkAdminAuth() {
  const container = document.getElementById("admin-content");
  if (!container) return;

  const session = Store.getSession();
  if (!session || session.role !== "ADMIN") {
    container.innerHTML = `
      <div style="background-color: #ffffff; border: 1px solid var(--coffee-border); border-radius: var(--radius-xl); padding: 48px 24px; text-align: center; max-width: 520px; margin: 40px auto; box-shadow: var(--shadow-sm);">
        <div style="width: 64px; height: 64px; background-color: #fee2e2; color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px;">
          🔒
        </div>
        <h2 style="font-size: 20px; font-weight: 900; color: var(--coffee-dark); margin-bottom: 8px;">Akses Khusus Barista & Kasir</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.6;">
          Halaman ini khusus untuk barista Titik Temu Coffeehouse dalam mengelola antrean seduhan meja dan inventaris menu kopi.
        </p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button onclick="quickLoginBarista()" class="btn btn-primary">
            Masuk Sebagai Barista (Demo)
          </button>
          <a href="menu.html" class="btn btn-outline">
            Kembali ke Menu
          </a>
        </div>
      </div>
    `;
    return;
  }

  renderAdminDashboard(session);
}

function quickLoginBarista() {
  Store.login("admin", "kopiadmin");
  renderNavbar();
  checkAdminAuth();
}

function renderAdminDashboard(session) {
  const container = document.getElementById("admin-content");
  if (!container) return;

  const stats = Store.getAdminStats();
  const orders = Store.getOrders();
  const menu = Store.getMenu();

  container.innerHTML = `
    <!-- HEADER BARISTA -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="user-role-tag">BARISTA & KASIR COMMAND CENTER</span>
          <span style="font-size: 12px; color: var(--coffee-amber); font-weight: 700;">● Live Sinkronisasi Cache</span>
        </div>
        <h1 class="section-title" style="margin-top: 4px; margin-bottom: 2px;">
          Meja Seduh & Manajemen Kafe
        </h1>
        <p class="section-subtitle">
          Pantau antrean pesanan pelanggan realtime dan sesuaikan ketersediaan biji kopi harian.
        </p>
      </div>

      <!-- Quick Nav Gabungan (Admin + Akses Cepat User) -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <a href="menu.html" class="btn btn-outline btn-sm">
          🔍 Buka Katalog Menu
        </a>
        <a href="index.html" class="btn btn-outline btn-sm">
          🏠 Halaman Depan
        </a>
        <button onclick="handleLogout()" class="btn btn-danger btn-sm">
          🚪 Keluar Barista
        </button>
      </div>
    </div>

    <!-- METRICS 4-KARTU -->
    <div class="admin-metrics">
      <div class="metric-card">
        <div class="metric-label">Total Omzet Kasir</div>
        <div class="metric-value" style="color: #059669;">${Store.formatRupiah(stats.totalRevenue)}</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Cangkir Terjual</div>
        <div class="metric-value" style="color: var(--coffee-amber);">${stats.totalCups} <span style="font-size: 14px; font-weight: normal;">Cangkir</span></div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Antrean Seduh Aktif</div>
        <div class="metric-value" style="color: #d97706;">${stats.activeQueue} <span style="font-size: 14px; font-weight: normal;">Pesanan</span></div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Seduhan Terlaris</div>
        <div class="metric-value" style="font-size: 16px; line-height: 1.3; margin-top: 6px;">${escapeHtml(stats.topSeller)}</div>
      </div>
    </div>

    <!-- SECTION 1: ANTREAN PESANAN MASUK -->
    <div style="margin-bottom: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 18px; font-weight: 900; color: var(--coffee-dark);">
          Antrean Pesanan Masuk Meja (${orders.length})
        </h3>
        <span style="font-size: 12px; color: var(--text-muted);">
          Klik tombol status untuk memajukan alur seduhan pesanan
        </span>
      </div>

      <div style="overflow-x: auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>No. Order</th>
              <th>Waktu</th>
              <th>Pelanggan & Lokasi</th>
              <th>Menu & Preferensi</th>
              <th>Total</th>
              <th>Status Seduh</th>
              <th>Tindakan Barista</th>
            </tr>
          </thead>
          <tbody>
            ${
              orders.length === 0
                ? `<tr><td colspan="7" style="text-align: center; padding: 30px;">Belum ada pesanan masuk.</td></tr>`
                : orders.map((order) => renderOrderTableRow(order)).join("")
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- SECTION 2: CRUD MENU KOPI -->
    <div style="margin-bottom: 50px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="font-size: 18px; font-weight: 900; color: var(--coffee-dark); margin-bottom: 2px;">
            Inventaris & Daftar Menu Kopi (${menu.length} Item)
          </h3>
          <p style="font-size: 12px; color: var(--text-muted);">
            Tambah menu baru, ubah harga, atau matikan ketersediaan jika biji kopi habis hari ini.
          </p>
        </div>

        <button onclick="openAddMenuModal()" class="btn btn-primary btn-sm">
          + Tambah Menu Kopi / Kudapan
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nama Menu</th>
              <th>Kategori</th>
              <th>Asal & Sangrai</th>
              <th>Harga</th>
              <th>Status Ketersediaan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${menu.map((item) => renderMenuTableRow(item)).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderOrderTableRow(order) {
  let statusBadgeClass = "status-completed";
  let statusLabel = "Selesai";
  let actionButton = `<span style="font-size: 11px; color: var(--text-muted);">✓ Tuntas</span>`;

  if (order.status === "PAID") {
    statusBadgeClass = "status-paid";
    statusLabel = "Sudah Bayar";
    actionButton = `
      <button onclick="advanceOrderStatus('${order.id}', 'BREWING')" class="btn btn-primary btn-sm">
        ☕ Mulai Seduh
      </button>
    `;
  } else if (order.status === "BREWING") {
    statusBadgeClass = "status-brewing";
    statusLabel = "Sedang Diseduh";
    actionButton = `
      <button onclick="advanceOrderStatus('${order.id}', 'READY')" class="btn btn-success btn-sm">
        🔔 Siap Saji
      </button>
    `;
  } else if (order.status === "READY") {
    statusBadgeClass = "status-ready";
    statusLabel = "Siap di Meja";
    actionButton = `
      <button onclick="advanceOrderStatus('${order.id}', 'COMPLETED')" class="btn btn-dark btn-sm">
        ✓ Selesaikan
      </button>
    `;
  }

  const itemsDetail = order.items
    .map(
      (it) => `
    <div style="margin-bottom: 4px;">
      <strong>${escapeHtml(it.name)}</strong> (${it.quantity}x)
      <div style="font-size: 11px; color: var(--text-muted);">
        ${escapeHtml(it.temperature || "Hot")}, ${escapeHtml(it.sugar || "Normal")}
        ${it.notes ? ` • <em>"${escapeHtml(it.notes)}"</em>` : ""}
      </div>
    </div>
  `
    )
    .join("");

  return `
    <tr>
      <td style="font-family: var(--font-mono); font-weight: 800;">${escapeHtml(order.orderNumber)}</td>
      <td style="font-size: 11px; color: var(--text-muted);">${new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</td>
      <td>
        <strong>${escapeHtml(order.customerName)}</strong>
        <div style="font-size: 11px; color: var(--coffee-amber); font-weight: 700;">${escapeHtml(order.tableNumber)}</div>
      </td>
      <td>${itemsDetail}</td>
      <td style="font-weight: 900;">${Store.formatRupiah(order.totalAmount)}</td>
      <td>
        <span class="status-badge ${statusBadgeClass}">${statusLabel}</span>
      </td>
      <td>${actionButton}</td>
    </tr>
  `;
}

function advanceOrderStatus(orderId, nextStatus) {
  Store.updateOrderStatus(orderId, nextStatus);
  const session = Store.getSession();
  renderAdminDashboard(session);
}

function renderMenuTableRow(item) {
  return `
    <tr>
      <td style="width: 60px;">
        <img src="${escapeHtml(item.imageUrl)}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--coffee-border);">
      </td>
      <td>
        <strong>${escapeHtml(item.name)}</strong>
        ${item.popular ? `<span style="font-size: 10px; color: var(--coffee-amber); margin-left: 4px;">★ Populer</span>` : ""}
        <div style="font-size: 11px; color: var(--text-muted); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${escapeHtml(item.description)}
        </div>
      </td>
      <td><span class="user-role-tag">${escapeHtml(item.category)}</span></td>
      <td style="font-size: 12px;">
        <div>📍 ${escapeHtml(item.origin || "-")}</div>
        <div style="color: var(--text-muted); font-size: 11px;">${escapeHtml(item.roastLevel || "-")}</div>
      </td>
      <td style="font-weight: 900;">${Store.formatRupiah(item.price)}</td>
      <td>
        <button 
          onclick="handleToggleStock('${item.id}')" 
          class="btn btn-sm ${item.isAvailable ? "btn-outline" : "btn-danger"}"
          title="Klik untuk mengubah status stok"
        >
          ${item.isAvailable ? "✓ Stok Tersedia" : "✕ Habis Hari Ini"}
        </button>
      </td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button onclick="openEditMenuModal('${item.id}')" class="btn btn-outline btn-sm">
            ✏️ Edit
          </button>
          <button onclick="handleDeleteMenu('${item.id}')" class="btn btn-danger btn-sm" style="padding: 6px 8px;">
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `;
}

function handleToggleStock(itemId) {
  Store.toggleAvailability(itemId);
  const session = Store.getSession();
  renderAdminDashboard(session);
}

function handleDeleteMenu(itemId) {
  if (confirm("Apakah Anda yakin ingin menghapus menu kopi ini dari katalog kafe?")) {
    Store.deleteMenuItem(itemId);
    const session = Store.getSession();
    renderAdminDashboard(session);
  }
}

// Modal Tambah / Edit Menu
function openAddMenuModal() {
  editingItemId = null;
  openMenuFormModal({
    name: "",
    category: "Manual Brew",
    price: 28000,
    origin: "",
    roastLevel: "Medium",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    tastingNotes: "Floral, Citrus, Honey",
    description: "",
    popular: false,
  });
}

function openEditMenuModal(itemId) {
  const item = Store.getMenuItem(itemId);
  if (!item) return;

  editingItemId = itemId;
  openMenuFormModal({
    ...item,
    tastingNotes: Array.isArray(item.tastingNotes) ? item.tastingNotes.join(", ") : item.tastingNotes || "",
  });
}

function openMenuFormModal(data) {
  const backdrop = document.getElementById("admin-menu-modal");
  const content = document.getElementById("admin-menu-modal-content");
  if (!backdrop || !content) return;

  content.innerHTML = `
    <form id="menu-crud-form" onsubmit="handleSaveMenuForm(event)">
      <div class="form-group">
        <label class="form-label">Nama Menu Seduhan / Kudapan:</label>
        <input type="text" id="form-menu-name" class="form-input" required value="${escapeHtml(data.name)}" placeholder="Contoh: Aceh Gayo Natural V60">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="form-label">Kategori:</label>
          <select id="form-menu-category" class="form-select">
            <option value="Manual Brew" ${data.category === "Manual Brew" ? "selected" : ""}>Manual Brew</option>
            <option value="Milk Based" ${data.category === "Milk Based" ? "selected" : ""}>Milk Based</option>
            <option value="Espresso & Black" ${data.category === "Espresso & Black" ? "selected" : ""}>Espresso & Black</option>
            <option value="Non-Coffee" ${data.category === "Non-Coffee" ? "selected" : ""}>Non-Coffee</option>
            <option value="Pastry" ${data.category === "Pastry" ? "selected" : ""}>Artisan Pastry</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Harga (Rupiah):</label>
          <input type="number" id="form-menu-price" class="form-input" required value="${data.price}" step="1000">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="form-label">Asal Perkebunan / Asal Biji:</label>
          <input type="text" id="form-menu-origin" class="form-input" value="${escapeHtml(data.origin || "")}" placeholder="Contoh: Takengon, Aceh (1.550 mdpl)">
        </div>

        <div class="form-group">
          <label class="form-label">Profil Sangrai (Roast Level):</label>
          <input type="text" id="form-menu-roast" class="form-input" value="${escapeHtml(data.roastLevel || "Medium")}" placeholder="Contoh: Light to Medium">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">URL Foto Menu:</label>
        <input type="url" id="form-menu-image" class="form-input" required value="${escapeHtml(data.imageUrl || "")}">
      </div>

      <div class="form-group">
        <label class="form-label">Catatan Rasa (Tasting Notes - Pisahkan dengan Koma):</label>
        <input type="text" id="form-menu-notes" class="form-input" value="${escapeHtml(data.tastingNotes || "")}" placeholder="Blueberry, Floral, Honey, Jasmine">
      </div>

      <div class="form-group">
        <label class="form-label">Deskripsi Seduhan:</label>
        <textarea id="form-menu-desc" class="form-textarea" rows="2" placeholder="Ceritakan keistimewaan rasa kopi ini...">${escapeHtml(data.description || "")}</textarea>
      </div>

      <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
        <input type="checkbox" id="form-menu-popular" ${data.popular ? "checked" : ""}>
        <label for="form-menu-popular" style="font-size: 13px; font-weight: 700; cursor: pointer;">Tandai Sebagai Menu Populer / Unggulan di Beranda</label>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 24px;">
        <button type="button" onclick="closeAdminMenuModal()" class="btn btn-outline" style="flex: 1;">
          Batal
        </button>
        <button type="submit" class="btn btn-primary" style="flex: 2;">
          Simpan ke Cache Kafe
        </button>
      </div>
    </form>
  `;

  backdrop.classList.add("open");
}

function handleSaveMenuForm(e) {
  e.preventDefault();

  const name = document.getElementById("form-menu-name").value.trim();
  const category = document.getElementById("form-menu-category").value;
  const price = parseInt(document.getElementById("form-menu-price").value) || 20000;
  const origin = document.getElementById("form-menu-origin").value.trim();
  const roastLevel = document.getElementById("form-menu-roast").value.trim();
  const imageUrl = document.getElementById("form-menu-image").value.trim();
  const notesRaw = document.getElementById("form-menu-notes").value;
  const description = document.getElementById("form-menu-desc").value.trim();
  const popular = document.getElementById("form-menu-popular").checked;

  const tastingNotes = notesRaw
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  const itemPayload = {
    id: editingItemId,
    name,
    category,
    price,
    origin: origin || "Artisan House Blend",
    roastLevel: roastLevel || "Medium",
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    tastingNotes,
    description: description || "Seduhan kopi pilihan barista dengan cita rasa istimewa.",
    popular,
  };

  Store.saveMenuItem(itemPayload);
  closeAdminMenuModal();

  const session = Store.getSession();
  renderAdminDashboard(session);
}

function closeAdminMenuModal() {
  const modal = document.getElementById("admin-menu-modal");
  if (modal) modal.classList.remove("open");
}
