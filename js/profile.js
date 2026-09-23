/**
 * TITIK TEMU COFFEEHOUSE - PROFILE & ORDER HISTORY SCRIPT
 * Menampilkan lama keanggotaan akun, status antrean meja realtime, dan struk thermal
 */

document.addEventListener("DOMContentLoaded", () => {
  renderCustomerProfile();
});

function renderCustomerProfile() {
  const container = document.getElementById("profile-content");
  if (!container) return;

  const session = Store.getSession();
  if (!session) {
    container.innerHTML = `
      <div style="background-color: #ffffff; border: 1px solid var(--coffee-border); border-radius: var(--radius-xl); padding: 48px 24px; text-align: center; max-width: 520px; margin: 40px auto; box-shadow: var(--shadow-sm);">
        <div style="width: 64px; height: 64px; background-color: var(--coffee-foam); color: var(--coffee-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 16px;">
          👤
        </div>
        <h2 style="font-size: 20px; font-weight: 900; color: var(--coffee-dark); margin-bottom: 8px;">Belum Masuk Akun Member</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.6;">
          Silakan masuk akun Anda untuk memantau lama keanggotaan, antrean seduhan kopi di meja, dan mencetak riwayat struk kasir.
        </p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <a href="login.html" class="btn btn-primary">
            Masuk Akun Member
          </a>
          <a href="menu.html" class="btn btn-outline">
            Lihat Menu Kopi
          </a>
        </div>
      </div>
    `;
    return;
  }

  const profile = Store.getUserProfile(session.id) || {
    ...session,
    membershipDuration: "Baru bergabung hari ini",
    joinedDateFormatted: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
  };

  const userOrders = Store.getOrders(session.id);

  let totalCups = 0;
  let totalSpent = 0;
  userOrders.forEach((o) => {
    totalSpent += o.totalAmount || 0;
    if (Array.isArray(o.items)) {
      o.items.forEach((it) => (totalCups += it.quantity || 1));
    }
  });

  container.innerHTML = `
    <!-- PROFILE HEADER CARD -->
    <div class="profile-card">
      <div class="profile-header" style="flex-wrap: wrap;">
        <div class="avatar-circle">
          ${session.role === "ADMIN" ? "☕" : "👤"}
        </div>
        <div style="flex: 1; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <h2 style="font-size: 22px; font-weight: 900; color: var(--coffee-dark);">${escapeHtml(profile.name)}</h2>
            <span class="user-role-tag">${profile.role === "ADMIN" ? "BARISTA & KASIR" : "MEMBER SETIA"}</span>
          </div>
          <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">
            @${escapeHtml(profile.username)} • ${escapeHtml(profile.email)}
          </div>
          <div class="membership-duration-pill">
            ⏳ Lama Akun: <strong>${escapeHtml(profile.membershipDuration)}</strong> (Bergabung sejak ${escapeHtml(profile.joinedDateFormatted)})
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="handleLogout()" class="btn btn-outline btn-sm">
            🚪 Keluar Akun
          </button>
          ${
            session.role === "ADMIN"
              ? `<a href="admin.html" class="btn btn-primary btn-sm">☕ Buka Panel Barista</a>`
              : ""
          }
        </div>
      </div>

      <!-- MEMBER STATS SUMMARY -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--coffee-border);">
        <div style="background-color: var(--coffee-foam); padding: 16px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Total Cangkir Dinikmati</div>
          <div style="font-size: 24px; font-weight: 900; color: var(--coffee-dark); margin-top: 4px;">${totalCups} Cangkir</div>
        </div>

        <div style="background-color: var(--coffee-foam); padding: 16px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Total Pembelian</div>
          <div style="font-size: 24px; font-weight: 900; color: var(--coffee-dark); margin-top: 4px;">${Store.formatRupiah(totalSpent)}</div>
        </div>

        <div style="background-color: var(--coffee-foam); padding: 16px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Poin Loyalitas Kopi</div>
          <div style="font-size: 24px; font-weight: 900; color: var(--coffee-amber); margin-top: 4px;">${totalCups * 10} Poin</div>
        </div>
      </div>
    </div>

    <!-- ORDER HISTORY & LIVE STATUS TRACKER -->
    <div style="margin-bottom: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <span class="section-tag">Status Meja & Riwayat</span>
          <h3 style="font-size: 20px; font-weight: 900; color: var(--coffee-dark); margin: 0;">Pesanan Cangkir Kopi Anda</h3>
        </div>
        <a href="menu.html" class="btn btn-outline btn-sm">
          + Pesan Seduhan Baru
        </a>
      </div>

      ${
        userOrders.length === 0
          ? `
        <div style="background-color: #ffffff; border: 1px solid var(--coffee-border); border-radius: var(--radius-lg); padding: 40px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 8px;">☕</div>
          <h4 style="font-size: 16px; font-weight: 800; margin-bottom: 4px;">Belum Ada Riwayat Pesanan</h4>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Kunjungi katalog menu kopi dan nikmati seduhan artisan kami.</p>
          <a href="menu.html" class="btn btn-primary btn-sm">Pesan Kopi Sekarang</a>
        </div>
      `
          : `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${userOrders.map((order) => renderOrderCard(order)).join("")}
        </div>
      `
      }
    </div>
  `;
}

function renderOrderCard(order) {
  let statusBadgeClass = "status-completed";
  let statusLabel = "Selesai";
  let statusIcon = "✓";

  if (order.status === "PAID") {
    statusBadgeClass = "status-paid";
    statusLabel = "Sudah Bayar (Menunggu Antrean Barista)";
    statusIcon = "💳";
  } else if (order.status === "BREWING") {
    statusBadgeClass = "status-brewing";
    statusLabel = "Sedang Diseduh Barista";
    statusIcon = "☕";
  } else if (order.status === "READY") {
    statusBadgeClass = "status-ready";
    statusLabel = "Siap Disajikan di Meja";
    statusIcon = "🔔";
  } else if (order.status === "COMPLETED") {
    statusBadgeClass = "status-completed";
    statusLabel = "Selesai Dinikmati";
    statusIcon = "✓";
  }

  const dateFormatted = new Date(order.createdAt).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <div style="background-color: #ffffff; border: 1px solid var(--coffee-border); border-radius: var(--radius-lg); padding: 22px; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 900; font-size: 15px; color: var(--coffee-dark);">${escapeHtml(order.orderNumber)}</span>
            <span class="status-badge ${statusBadgeClass}">${statusIcon} ${statusLabel}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-light); margin-top: 4px;">
            ${dateFormatted} WIB • ${escapeHtml(order.tableNumber)} (${order.orderType === "DINE_IN" ? "Dine-In" : "Takeaway"})
          </div>
        </div>

        <button onclick="viewThermalReceipt('${order.id}')" class="btn btn-outline btn-sm">
          🧾 Cetak / Lihat Struk Kasir
        </button>
      </div>

      <!-- Live Stepper Tracker -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 16px 0 14px; text-align: center; font-size: 11px; font-weight: 700;">
        <div style="padding: 6px; border-radius: 4px; background-color: ${order.status ? "#dbeafe" : "#f3f4f6"}; color: ${order.status ? "#1e40af" : "#9ca3af"};">
          1. Pembayaran
        </div>
        <div style="padding: 6px; border-radius: 4px; background-color: ${order.status === "BREWING" || order.status === "READY" || order.status === "COMPLETED" ? "#fef3c7" : "#f3f4f6"}; color: ${order.status === "BREWING" || order.status === "READY" || order.status === "COMPLETED" ? "#b45309" : "#9ca3af"};">
          2. Diseduh
        </div>
        <div style="padding: 6px; border-radius: 4px; background-color: ${order.status === "READY" || order.status === "COMPLETED" ? "#d1fae5" : "#f3f4f6"}; color: ${order.status === "READY" || order.status === "COMPLETED" ? "#065f46" : "#9ca3af"};">
          3. Siap Meja
        </div>
        <div style="padding: 6px; border-radius: 4px; background-color: ${order.status === "COMPLETED" ? "#e5e7eb" : "#f3f4f6"}; color: ${order.status === "COMPLETED" ? "#374151" : "#9ca3af"};">
          4. Selesai
        </div>
      </div>

      <!-- Items List -->
      <div style="background-color: var(--coffee-foam); border-radius: var(--radius-md); padding: 12px 14px; margin-top: 10px;">
        ${order.items
          .map(
            (item) => `
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 4px;">
            <span>${escapeHtml(item.name)} (${item.quantity}x)</span>
            <span style="font-weight: 800;">${Store.formatRupiah(item.price * item.quantity)}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">
            ${escapeHtml(item.temperature || "Hot")} • ${escapeHtml(item.sugar || "Normal")}
            ${item.notes ? ` • Catatan: "${escapeHtml(item.notes)}"` : ""}
          </div>
        `
          )
          .join("")}
        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 14px; border-top: 1px dashed var(--coffee-border); padding-top: 8px; margin-top: 6px; color: var(--coffee-dark);">
          <span>Total Tagihan:</span>
          <span>${Store.formatRupiah(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  `;
}

// Buka Modal Struk Thermal Kasir
function viewThermalReceipt(orderId) {
  const orders = Store.getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;

  const modalBackdrop = document.getElementById("profile-receipt-modal");
  const modalContent = document.getElementById("profile-receipt-content");
  if (!modalBackdrop || !modalContent) return;

  modalContent.innerHTML = `
    <div class="thermal-receipt">
      <div class="receipt-header">
        <div class="receipt-title">TITIK TEMU COFFEEHOUSE</div>
        <div style="font-size: 10px; color: #666;">Jl. Senopati No. 45, Jakarta Selatan</div>
        <div style="font-size: 10px; color: #666;">Telp: (021) 7890-4321</div>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-row">
        <span>No. Order:</span>
        <span style="font-weight: bold;">${escapeHtml(order.orderNumber)}</span>
      </div>
      <div class="receipt-row">
        <span>Waktu:</span>
        <span>${new Date(order.createdAt).toLocaleString("id-ID")}</span>
      </div>
      <div class="receipt-row">
        <span>Pelanggan:</span>
        <span>${escapeHtml(order.customerName)}</span>
      </div>
      <div class="receipt-row">
        <span>Lokasi Meja:</span>
        <span style="font-weight: bold;">${escapeHtml(order.tableNumber)}</span>
      </div>

      <div class="receipt-divider"></div>

      ${order.items
        .map(
          (item) => `
        <div class="receipt-row">
          <span>${escapeHtml(item.name)} (${item.quantity}x)</span>
          <span>${Store.formatRupiah(item.price * item.quantity)}</span>
        </div>
        <div style="font-size: 10px; color: #666; margin-bottom: 4px;">
          ${escapeHtml(item.temperature || "Hot")} | ${escapeHtml(item.sugar || "Normal")}
          ${item.notes ? `| "${escapeHtml(item.notes)}"` : ""}
        </div>
      `
        )
        .join("")}

      <div class="receipt-divider"></div>

      <div class="receipt-row" style="font-weight: bold; font-size: 13px;">
        <span>TOTAL PEMBAYARAN</span>
        <span>${Store.formatRupiah(order.totalAmount)}</span>
      </div>
      <div class="receipt-row" style="color: #666;">
        <span>Metode:</span>
        <span>${escapeHtml(order.paymentMethod || "QRIS")}</span>
      </div>

      <div class="receipt-stamp">LUNAS • TERVERIFIKASI</div>

      <div style="text-align: center; margin-top: 14px; font-size: 10px; color: #777;">
        Simpan struk ini sebagai bukti pesanan.<br>Selamat menikmati seduhan kopi Anda!
      </div>
    </div>

    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <button onclick="window.print()" class="btn btn-outline" style="flex: 1;">
        🖨️ Cetak Fisik
      </button>
      <button onclick="closeProfileReceiptModal()" class="btn btn-primary" style="flex: 1;">
        Tutup
      </button>
    </div>
  `;

  modalBackdrop.classList.add("open");
}

function closeProfileReceiptModal() {
  const modal = document.getElementById("profile-receipt-modal");
  if (modal) modal.classList.remove("open");
}
