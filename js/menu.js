/**
 * TITIK TEMU COFFEEHOUSE - MENU & CHECKOUT SCRIPT
 * Mengatur filter kategori, pencarian, kustomisasi kopi, dan checkout QRIS
 */

let currentSelectedItem = null;
let currentCustomization = {
  temperature: "Hot",
  sugar: "Normal",
  quantity: 1,
  notes: "",
};
let qrisCountdownInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  renderMenuCatalog();
  setupSearchAndFilters();
  checkUrlParams();
});

// Periksa URL jika membawa parameter ?item=slug dari beranda
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const itemSlug = urlParams.get("item");
  if (itemSlug) {
    const item = Store.getMenuItem(itemSlug);
    if (item) {
      openCustomizationModal(item.id);
    }
  }
}

// Render Menu Cards
function renderMenuCatalog(category = "Semua", query = "") {
  const container = document.getElementById("menu-catalog-grid");
  const countSpan = document.getElementById("menu-count-badge");
  if (!container) return;

  let menu = Store.getMenu();

  if (category !== "Semua") {
    menu = menu.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  if (query.trim() !== "") {
    const q = query.toLowerCase();
    menu = menu.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.origin.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.tastingNotes && item.tastingNotes.some((n) => n.toLowerCase().includes(q)))
    );
  }

  if (countSpan) {
    countSpan.textContent = `${menu.length} Menu Tersedia`;
  }

  if (menu.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background-color: #ffffff; border-radius: var(--radius-lg); border: 1px solid var(--coffee-border);">
        <div style="font-size: 40px; margin-bottom: 12px;">☕</div>
        <h3 style="font-size: 18px; font-weight: 800; color: var(--coffee-dark); margin-bottom: 6px;">Menu Seduhan Tidak Ditemukan</h3>
        <p style="font-size: 13px; color: var(--text-muted);">Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = menu
    .map((item) => `
      <div class="menu-card" style="${!item.isAvailable ? "opacity: 0.6;" : ""}">
        <div class="card-img-wrap">
          <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy">
          ${item.popular ? `<span class="card-badge-popular">★ Favorit</span>` : ""}
          <span class="card-badge-roast">${escapeHtml(item.roastLevel || "Artisan")}</span>
        </div>
        <div class="card-body">
          <div class="card-category">${escapeHtml(item.category)}</div>
          <h3 class="card-title">${escapeHtml(item.name)}</h3>
          <div class="card-origin">📍 ${escapeHtml(item.origin)}</div>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px; flex: 1;">
            ${escapeHtml(item.description)}
          </p>
          <div class="card-notes">
            ${(item.tastingNotes || []).map((n) => `<span class="note-tag">${escapeHtml(n)}</span>`).join("")}
          </div>
          <div class="card-footer">
            <div>
              <span class="card-price">${Store.formatRupiah(item.price)}</span>
              ${!item.isAvailable ? `<div style="font-size: 10px; color: #dc2626; font-weight: 800;">Habis Hari Ini</div>` : ""}
            </div>
            <button 
              onclick="openCustomizationModal('${item.id}')" 
              class="btn btn-primary btn-sm" 
              ${!item.isAvailable ? "disabled style='cursor: not-allowed; opacity: 0.6;'" : ""}
            >
              ${item.isAvailable ? "Pesan Seduhan" : "Stok Habis"}
            </button>
          </div>
        </div>
      </div>
    `)
    .join("");
}

// Setup Event Pencarian dan Kategori
function setupSearchAndFilters() {
  const searchInput = document.getElementById("search-input");
  const categoryButtons = document.querySelectorAll(".cat-btn");

  let activeCategory = "Semua";

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderMenuCatalog(activeCategory, e.target.value);
    });
  }

  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-category") || "Semua";
      renderMenuCatalog(activeCategory, searchInput ? searchInput.value : "");
    });
  });
}

// Buka Modal Kustomisasi
function openCustomizationModal(itemId) {
  const item = Store.getMenuItem(itemId);
  if (!item || !item.isAvailable) return;

  currentSelectedItem = item;
  currentCustomization = {
    temperature: item.category === "Pastry" ? "Normal" : "Hot",
    sugar: "Normal",
    quantity: 1,
    notes: "",
  };

  const modalBackdrop = document.getElementById("customization-modal");
  const modalContent = document.getElementById("customization-modal-content");
  if (!modalBackdrop || !modalContent) return;

  const isPastry = item.category === "Pastry";

  modalContent.innerHTML = `
    <div style="display: flex; gap: 16px; margin-bottom: 20px; align-items: center;">
      <img src="${escapeHtml(item.imageUrl)}" style="width: 80px; height: 80px; border-radius: var(--radius-md); object-fit: cover; border: 1px solid var(--coffee-border);">
      <div>
        <span class="user-role-tag">${escapeHtml(item.category)}</span>
        <h3 style="font-size: 18px; font-weight: 900; color: var(--coffee-dark); margin: 4px 0 2px;">${escapeHtml(item.name)}</h3>
        <div style="font-size: 12px; color: var(--text-light);">📍 ${escapeHtml(item.origin)} • ${escapeHtml(item.roastLevel)}</div>
        <div style="font-size: 16px; font-weight: 900; color: var(--coffee-amber); margin-top: 4px;">${Store.formatRupiah(item.price)}</div>
      </div>
    </div>

    ${
      !isPastry
        ? `
      <div class="form-group">
        <label class="form-label">Suhu Penyajian:</label>
        <div class="radio-tabs">
          <label>
            <input type="radio" name="modal_temp" value="Hot" checked onchange="currentCustomization.temperature = 'Hot'" style="display: none;">
            <span class="radio-tab-label">🔥 Panas (Hot)</span>
          </label>
          <label>
            <input type="radio" name="modal_temp" value="Iced" onchange="currentCustomization.temperature = 'Iced'" style="display: none;">
            <span class="radio-tab-label">❄️ Dingin (Iced)</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Tingkat Gula / Pemanis Aren:</label>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <label>
            <input type="radio" name="modal_sugar" value="Normal" checked onchange="currentCustomization.sugar = 'Normal'" style="display: none;">
            <span class="radio-tab-label" style="font-size: 11px;">Normal (100%)</span>
          </label>
          <label>
            <input type="radio" name="modal_sugar" value="Less Sugar" onchange="currentCustomization.sugar = 'Less Sugar (50%)'" style="display: none;">
            <span class="radio-tab-label" style="font-size: 11px;">Sedikit (50%)</span>
          </label>
          <label>
            <input type="radio" name="modal_sugar" value="No Sugar" onchange="currentCustomization.sugar = 'Tanpa Gula (0%)'" style="display: none;">
            <span class="radio-tab-label" style="font-size: 11px;">Nol Gula (0%)</span>
          </label>
        </div>
      </div>
    `
        : ""
    }

    <div class="form-group">
      <label class="form-label">Jumlah Cangkir / Porsi:</label>
      <div style="display: flex; align-items: center; gap: 14px;">
        <button type="button" onclick="updateQty(-1)" class="btn btn-outline" style="width: 40px; height: 40px; padding: 0; font-size: 18px;">-</button>
        <span id="custom-qty-display" style="font-size: 16px; font-weight: 800; width: 30px; text-align: center;">1</span>
        <button type="button" onclick="updateQty(1)" class="btn btn-outline" style="width: 40px; height: 40px; padding: 0; font-size: 18px;">+</button>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Catatan Tambahan untuk Barista:</label>
      <textarea id="custom-notes-input" class="form-textarea" rows="2" placeholder="Contoh: gilingan pour over kasar, sedikit es batu, dipanaskan sebentar..."></textarea>
    </div>

    <div style="display: flex; gap: 12px; margin-top: 24px;">
      <button onclick="closeModal('customization-modal')" class="btn btn-outline" style="flex: 1;">
        Batal
      </button>
      <button onclick="proceedToCheckout()" class="btn btn-primary" style="flex: 2;">
        Lanjut ke Meja & QRIS &rarr;
      </button>
    </div>
  `;

  modalBackdrop.classList.add("open");
}

function updateQty(delta) {
  currentCustomization.quantity = Math.max(1, currentCustomization.quantity + delta);
  const display = document.getElementById("custom-qty-display");
  if (display) display.textContent = currentCustomization.quantity;
}

// Beralih dari Modal Kustomisasi ke Modal Checkout QRIS
function proceedToCheckout() {
  const notesInput = document.getElementById("custom-notes-input");
  if (notesInput) {
    currentCustomization.notes = notesInput.value.trim();
  }

  closeModal("customization-modal");
  openCheckoutModal();
}

// Buka Modal Checkout QRIS
function openCheckoutModal() {
  if (!currentSelectedItem) return;

  const modalBackdrop = document.getElementById("checkout-modal");
  const modalContent = document.getElementById("checkout-modal-content");
  if (!modalBackdrop || !modalContent) return;

  renderCheckoutModalBody();
  modalBackdrop.classList.add("open");
  startQrisTimer();
}

function renderCheckoutModalBody() {
  const modalContent = document.getElementById("checkout-modal-content");
  if (!modalContent || !currentSelectedItem) return;

  const session = Store.getSession();
  const subtotal = currentSelectedItem.price * currentCustomization.quantity;

  let authSectionHtml = "";
  if (session) {
    authSectionHtml = `
      <div style="background-color: var(--coffee-amber-light); border: 1px solid rgba(184,116,49,0.3); padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 11px; font-weight: 800; color: var(--coffee-amber-hover); text-transform: uppercase;">✓ Member Terverifikasi</div>
          <div style="font-size: 14px; font-weight: 800; color: var(--coffee-dark);">${escapeHtml(session.name)} (${escapeHtml(session.username)})</div>
        </div>
        <span class="user-role-tag">${session.role === "ADMIN" ? "BARISTA" : "MEMBER"}</span>
      </div>
    `;
  } else {
    authSectionHtml = `
      <div style="background-color: var(--coffee-foam); border: 1px solid var(--coffee-border); padding: 14px; border-radius: var(--radius-md); margin-bottom: 18px;">
        <div style="font-size: 12px; font-weight: 800; color: var(--coffee-dark); margin-bottom: 6px;">🔐 Verifikasi Akun Pembeli (Login / Daftar Cepat)</div>
        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px;">
          Simpan riwayat pesanan cangkir kopi dan pantau status seduhan meja langsung di akun Anda.
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
          <input type="text" id="inline-login-user" class="form-input" placeholder="Username/Email" style="font-size: 12px; padding: 8px 10px;">
          <input type="password" id="inline-login-pass" class="form-input" placeholder="Password" style="font-size: 12px; padding: 8px 10px;">
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" onclick="handleInlineLogin()" class="btn btn-dark btn-sm" style="flex: 1;">
            Masuk Sekarang
          </button>
          <button type="button" onclick="handleDemoLoginCustomer()" class="btn btn-outline btn-sm" style="flex: 1;">
            1-Klik Demo Member
          </button>
        </div>
      </div>
    `;
  }

  modalContent.innerHTML = `
    ${authSectionHtml}

    <div class="form-group">
      <label class="form-label">Jenis Pemesanan:</label>
      <div class="radio-tabs">
        <label>
          <input type="radio" name="order_type" value="DINE_IN" checked onchange="toggleTableSelection(true)" style="display: none;">
          <span class="radio-tab-label">🪑 Dine-In (Minum di Meja Kafe)</span>
        </label>
        <label>
          <input type="radio" name="order_type" value="TAKEAWAY" onchange="toggleTableSelection(false)" style="display: none;">
          <span class="radio-tab-label">🛍️ Takeaway (Bawa Pulang)</span>
        </label>
      </div>
    </div>

    <div class="form-group" id="table-select-group">
      <label class="form-label">Pilih Nomor Meja Anda:</label>
      <select id="table-number-select" class="form-select">
        <option value="Meja 01">Meja 01 (Dekat Jendela Depan)</option>
        <option value="Meja 02">Meja 02 (Area Sofa Santai)</option>
        <option value="Meja 03">Meja 03 (Dekat Barista Brew Bar)</option>
        <option value="Meja 04" selected>Meja 04 (Tengah Ruangan)</option>
        <option value="Meja 05">Meja 05 (Area Kerja / Colokan)</option>
        <option value="Meja 06">Meja 06 (Area Outdoor Taman)</option>
        <option value="Bar Counter">Bar Counter (Depan Mesin Espresso)</option>
      </select>
    </div>

    <!-- Ringkasan Pesanan -->
    <div style="background-color: var(--coffee-cream); border: 1px solid var(--coffee-border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 13px; margin-bottom: 4px;">
        <span>${escapeHtml(currentSelectedItem.name)} (${currentCustomization.quantity}x)</span>
        <span>${Store.formatRupiah(subtotal)}</span>
      </div>
      <div style="font-size: 11px; color: var(--text-muted);">
        Varian: ${escapeHtml(currentCustomization.temperature)} • Gula: ${escapeHtml(currentCustomization.sugar)}
        ${currentCustomization.notes ? ` • Catatan: "${escapeHtml(currentCustomization.notes)}"` : ""}
      </div>
    </div>

    <!-- QRIS Card -->
    <div class="qris-card">
      <div style="font-weight: 900; font-size: 14px; color: var(--coffee-dark); margin-bottom: 2px;">QRIS KAFE DINAMIS NASIONAL</div>
      <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">Pindai melalui GoPay, OVO, Dana, BCA, Mandiri, atau m-Banking apa pun</div>
      
      <div class="qris-code-wrap">
        <!-- SVG Simulasi QR Code QRIS Otentik -->
        <svg viewBox="0 0 100 100" width="160" height="160" style="display: block;">
          <rect width="100" height="100" fill="#ffffff" />
          <!-- Pojok Kiri Atas -->
          <rect x="5" y="5" width="26" height="26" fill="#1c130d" />
          <rect x="9" y="9" width="18" height="18" fill="#ffffff" />
          <rect x="13" y="13" width="10" height="10" fill="#1c130d" />
          <!-- Pojok Kanan Atas -->
          <rect x="69" y="5" width="26" height="26" fill="#1c130d" />
          <rect x="73" y="9" width="18" height="18" fill="#ffffff" />
          <rect x="77" y="13" width="10" height="10" fill="#1c130d" />
          <!-- Pojok Kiri Bawah -->
          <rect x="5" y="69" width="26" height="26" fill="#1c130d" />
          <rect x="9" y="73" width="18" height="18" fill="#ffffff" />
          <rect x="13" y="77" width="10" height="10" fill="#1c130d" />
          <!-- Pola Titik Acak Terstruktur -->
          <rect x="36" y="8" width="8" height="8" fill="#1c130d" />
          <rect x="48" y="8" width="6" height="16" fill="#1c130d" />
          <rect x="36" y="22" width="6" height="6" fill="#1c130d" />
          <rect x="8" y="38" width="12" height="6" fill="#1c130d" />
          <rect x="24" y="38" width="6" height="12" fill="#1c130d" />
          <rect x="36" y="36" width="28" height="28" fill="#b87431" rx="4" />
          <text x="50" y="54" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="bold">☕</text>
          <rect x="70" y="38" width="12" height="8" fill="#1c130d" />
          <rect x="86" y="38" width="6" height="14" fill="#1c130d" />
          <rect x="8" y="56" width="18" height="6" fill="#1c130d" />
          <rect x="38" y="72" width="10" height="8" fill="#1c130d" />
          <rect x="54" y="72" width="14" height="14" fill="#1c130d" />
          <rect x="74" y="72" width="8" height="6" fill="#1c130d" />
          <rect x="86" y="72" width="8" height="18" fill="#1c130d" />
        </svg>
      </div>

      <div style="font-size: 11px; color: var(--text-muted);">Batas Waktu Pembayaran:</div>
      <div id="qris-countdown-timer" class="countdown-timer">04:59</div>
    </div>

    <div style="display: flex; gap: 10px;">
      <button onclick="closeModal('checkout-modal')" class="btn btn-outline" style="flex: 1;">
        Batal
      </button>
      <button onclick="simulatePaymentSuccess()" class="btn btn-success" style="flex: 2;">
        ✓ Simulasikan Bayar QRIS Selesai
      </button>
    </div>
  `;
}

function toggleTableSelection(isDineIn) {
  const group = document.getElementById("table-select-group");
  if (group) {
    group.style.display = isDineIn ? "block" : "none";
  }
}

function startQrisTimer() {
  if (qrisCountdownInterval) clearInterval(qrisCountdownInterval);

  let secondsLeft = 299; // 4 menit 59 detik
  const timerElement = document.getElementById("qris-countdown-timer");

  qrisCountdownInterval = setInterval(() => {
    secondsLeft--;
    if (secondsLeft <= 0) {
      clearInterval(qrisCountdownInterval);
      if (timerElement) timerElement.textContent = "00:00 (Kadaluarsa)";
      return;
    }

    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    if (timerElement) {
      timerElement.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
  }, 1000);
}

// Inline Auth di dalam modal
function handleInlineLogin() {
  const userInput = document.getElementById("inline-login-user");
  const passInput = document.getElementById("inline-login-pass");
  if (!userInput || !passInput) return;

  const res = Store.login(userInput.value, passInput.value);
  if (res.success) {
    renderNavbar();
    renderCheckoutModalBody();
  } else {
    alert(res.message);
  }
}

function handleDemoLoginCustomer() {
  Store.login("pelanggan", "kopienak");
  renderNavbar();
  renderCheckoutModalBody();
}

// Simulasi Pembayaran Sukses
function simulatePaymentSuccess() {
  if (!currentSelectedItem) return;

  if (qrisCountdownInterval) clearInterval(qrisCountdownInterval);

  let session = Store.getSession();
  if (!session) {
    // Buat akun guest instan jika belum login
    session = Store.createUser({
      name: "Tamu Meja Kafe",
      username: "tamu_" + Date.now().toString().slice(-4),
      email: "tamu@titiktemu.cafe",
      password: "tamu",
      role: "USER",
    });
    localStorage.setItem(CAFE_STORAGE.SESSION_KEY, JSON.stringify(session));
    renderNavbar();
  }

  const orderTypeRadio = document.querySelector('input[name="order_type"]:checked');
  const isDineIn = orderTypeRadio ? orderTypeRadio.value === "DINE_IN" : true;
  const tableSelect = document.getElementById("table-number-select");
  const tableNumber = isDineIn ? (tableSelect ? tableSelect.value : "Meja 04") : "Bawa Pulang";

  const totalAmount = currentSelectedItem.price * currentCustomization.quantity;

  const order = Store.addOrder({
    userId: session.id,
    customerName: session.name,
    orderType: isDineIn ? "DINE_IN" : "TAKEAWAY",
    tableNumber: tableNumber,
    status: "PAID",
    paymentMethod: "QRIS Kafe (Dinamis)",
    totalAmount: totalAmount,
    items: [
      {
        menuId: currentSelectedItem.id,
        name: currentSelectedItem.name,
        price: currentSelectedItem.price,
        quantity: currentCustomization.quantity,
        temperature: currentCustomization.temperature,
        sugar: currentCustomization.sugar,
        notes: currentCustomization.notes,
      },
    ],
  });

  closeModal("checkout-modal");

  // Tampilkan modal struk konfirmasi
  showSuccessReceiptModal(order);
}

// Modal Konfirmasi Pembayaran & Struk
function showSuccessReceiptModal(order) {
  const modalBackdrop = document.getElementById("receipt-modal");
  const modalContent = document.getElementById("receipt-modal-content");
  if (!modalBackdrop || !modalContent) return;

  modalContent.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="width: 54px; height: 54px; background-color: #d1fae5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 12px;">
        ✓
      </div>
      <h3 style="font-size: 20px; font-weight: 900; color: var(--coffee-dark); margin-bottom: 4px;">Pembayaran QRIS Berhasil!</h3>
      <p style="font-size: 13px; color: var(--text-muted);">
        Pesanan Anda sedang diteruskan ke meja barista untuk diseduh.
      </p>
    </div>

    <!-- STRUK THERMAL -->
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
        <span>Tanggal:</span>
        <span>${new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>
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
        <div class="receipt-row" style="margin-bottom: 2px;">
          <span>${escapeHtml(item.name)} (${item.quantity}x)</span>
          <span>${Store.formatRupiah(item.price * item.quantity)}</span>
        </div>
        <div style="font-size: 10px; color: #666; margin-bottom: 6px;">
          ${escapeHtml(item.temperature || "Hot")} | ${escapeHtml(item.sugar || "Normal")}
          ${item.notes ? `| "${escapeHtml(item.notes)}"` : ""}
        </div>
      `
        )
        .join("")}

      <div class="receipt-divider"></div>

      <div class="receipt-row" style="font-weight: bold; font-size: 14px;">
        <span>TOTAL BAYAR</span>
        <span>${Store.formatRupiah(order.totalAmount)}</span>
      </div>
      <div class="receipt-row" style="color: #666;">
        <span>Metode:</span>
        <span>QRIS Kafe (Lunas)</span>
      </div>

      <div class="receipt-stamp">LUNAS • SUDAH BAYAR</div>

      <div style="text-align: center; margin-top: 14px; font-size: 10px; color: #777;">
        Terima kasih telah berkunjung.<br>Barista kami segera mengantar ke meja Anda.
      </div>
    </div>

    <div style="display: flex; gap: 10px; margin-top: 24px;">
      <button onclick="closeModal('receipt-modal')" class="btn btn-outline" style="flex: 1;">
        Tutup
      </button>
      <a href="profile.html" class="btn btn-primary" style="flex: 2; text-align: center;">
        Pantau Status Antrean Meja &rarr;
      </a>
    </div>
  `;

  modalBackdrop.classList.add("open");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("open");
  }
  if (modalId === "checkout-modal" && qrisCountdownInterval) {
    clearInterval(qrisCountdownInterval);
  }
}
