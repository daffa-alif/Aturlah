/**
 * TITIK TEMU COFFEEHOUSE - STORAGE & CACHE ENGINE
 * Menggunakan localStorage sebagai persistent cache murni
 */

const CAFE_STORAGE = {
  MENU_KEY: "cafe_menu_cache",
  USERS_KEY: "cafe_users_cache",
  ORDERS_KEY: "cafe_orders_cache",
  SESSION_KEY: "cafe_active_session",
};

// Data Dummy Awal Kopi Nusantara
const INITIAL_MENU = [
  {
    id: "kopi-1",
    name: "Aceh Gayo Natural V60",
    slug: "aceh-gayo-natural-v60",
    category: "Manual Brew",
    description: "Biji kopi single origin Arabika dari dataran tinggi Takengon dengan proses natural anaerobik. Menyajikan sensasi buah beri segar, aroma melati, dan aftertaste manis madu liar.",
    tastingNotes: ["Blueberry", "Jasmine Floral", "Wild Honey", "Bergamot"],
    roastLevel: "Light to Medium",
    origin: "Takengon, Aceh Gayo (1.550 mdpl)",
    price: 32000,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    popular: true,
  },
  {
    id: "kopi-2",
    name: "Toraja Sapan Japanese Drip",
    slug: "toraja-sapan-japanese-drip",
    category: "Manual Brew",
    description: "Arabika legendaris pegunungan Sapan Toraja yang diseduh dengan metode Japanese Iced Drip langsung di atas es batu kristal. Body tegas beraroma cokelat pahit dan rempah hangat.",
    tastingNotes: ["Dark Chocolate", "Warm Spices", "Ripe Citrus", "Caramel"],
    roastLevel: "Medium",
    origin: "Sapan, Tana Toraja (1.700 mdpl)",
    price: 35000,
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    popular: true,
  },
  {
    id: "kopi-3",
    name: "Kopi Susu Gula Aren Senja",
    slug: "kopi-susu-gula-aren-senja",
    category: "Milk Based",
    description: "Signature house blend espresso (70% Arabika Flores + 30% Robusta Temanggung) berpadu susu segar murni pasteurisasi dan lelehan gula aren organik dari perbukitan Kulon Progo.",
    tastingNotes: ["Smoky Arenga Sugar", "Creamy Vanilla", "Nutty Hazelnut", "Velvety Crema"],
    roastLevel: "Medium Dark",
    origin: "Flores Bajawa & Temanggung",
    price: 24000,
    imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    popular: true,
  },
  {
    id: "kopi-4",
    name: "Espresso Doppio (Double Shot)",
    slug: "espresso-doppio",
    category: "Espresso & Black",
    description: "Ekstraksi presisi ganda 36ml dalam 27 detik dengan crema keemasan yang padat. Khusus pecinta kopi sejati yang mendambakan tendangan kafein bersih tanpa gula.",
    tastingNotes: ["Cocoa Nibs", "Almond Bark", "Rich Crema", "Molasses"],
    roastLevel: "Medium Dark",
    origin: "Artisan House Blend 100% Arabika",
    price: 20000,
    imageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    popular: false,
  },
  {
    id: "kopi-5",
    name: "Flores Bajawa Cold Brew Cascara",
    slug: "flores-bajawa-cold-brew",
    category: "Manual Brew",
    description: "Penyeduhan dingin selama 16 jam dengan sentuhan seduhan kulit buah kopi (cascara) Flores Bajawa. Menghasilkan rasa ringan, segar menyerupai teh buah dengan kafein halus.",
    tastingNotes: ["Peach", "Dried Plum", "Floral Tea", "Cane Sugar"],
    roastLevel: "Light",
    origin: "Bajawa, Flores (1.400 mdpl)",
    price: 30000,
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    popular: true,
  },
  {
    id: "kopi-6",
    name: "Caramel Sea Salt Macchiato",
    slug: "caramel-sea-salt-macchiato",
    category: "Milk Based",
    description: "Lapisan espresso bold yang dituang perlahan di atas susu vanila dingin, dimahkotai saus karamel mentega buatan sendiri dan taburan garam laut Kusamba Bali.",
    tastingNotes: ["Butterscotch", "Sea Salt Crunch", "Warm Toffee", "Sweet Cream"],
    roastLevel: "Medium",
    origin: "Java Preanger & Bali Kintamani",
    price: 28000,
    imageUrl: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    popular: false,
  },
  {
    id: "kopi-7",
    name: "Kyoto Ceremonial Matcha Oat",
    slug: "kyoto-ceremonial-matcha-oat",
    category: "Non-Coffee",
    description: "Bubuk teh hijau matcha murni kelas seremonial dari Uji, Kyoto, dikocok secara tradisional dengan chasen dan dipadukan dengan susu oat creamy bebas laktosa.",
    tastingNotes: ["Grassy Green", "Umami Sweet", "Creamy Oat", "Roasted Rice"],
    roastLevel: "Shade Grown Green",
    origin: "Uji, Kyoto, Japan",
    price: 29000,
    imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    popular: false,
  },
  {
    id: "kopi-8",
    name: "Signature Dark Chocolate Hazelnut",
    slug: "signature-dark-chocolate-hazelnut",
    category: "Non-Coffee",
    description: "Cokelat hitam 72% single estate Kakao Tabanan Bali berpadu pasta kacang hazelnut panggang dan susu hangat berbusa sutra. Sangat pas untuk teman bersantai.",
    tastingNotes: ["72% Cocoa", "Roasted Hazelnut", "Fudge", "Malted Milk"],
    roastLevel: "Artisan Chocolate",
    origin: "Tabanan, Bali",
    price: 26000,
    imageUrl: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    popular: false,
  },
  {
    id: "kopi-9",
    name: "Butter Croissant Artisan",
    slug: "butter-croissant-artisan",
    category: "Pastry",
    description: "Pastry khas Prancis berlapis-lapis dengan mentega Prancis murni. Tekstur luar garing renyah dan bagian dalam lembut berlapis sarang lebah sempurna.",
    tastingNotes: ["Golden Butter", "Flaky Crust", "Honey Note", "Yeasty Warmth"],
    roastLevel: "Fresh Baked Daily",
    origin: "In-House Bakery",
    price: 22000,
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    popular: true,
  },
  {
    id: "kopi-10",
    name: "Fudgy Espresso Brownies",
    slug: "fudgy-espresso-brownies",
    category: "Pastry",
    description: "Brownies cokelat panggang dengan lelehan cokelat Belgia pekat yang diresapi satu shot espresso house blend kami. Padat, lumer di mulut, dan kaya rasa.",
    tastingNotes: ["Dark Chocolate Ganache", "Espresso Kick", "Chewy Crust"],
    roastLevel: "Fresh Baked Daily",
    origin: "In-House Bakery",
    price: 20000,
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    popular: false,
  },
];

// Akun Demo Bawaan
const INITIAL_USERS = [
  {
    id: "user-admin-1",
    name: "Barista Budi & Kasir",
    username: "admin",
    email: "barista@titiktemu.cafe",
    password: "kopiadmin",
    role: "ADMIN",
    createdAt: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "user-cust-1",
    name: "Daffa Alif (Member)",
    username: "pelanggan",
    email: "daffa@titiktemu.cafe",
    password: "kopienak",
    role: "USER",
    // Dibuat 35 hari yang lalu agar terlihat durasi akunnya
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Pesanan Dummy Awal
const INITIAL_ORDERS = [
  {
    id: "order-101",
    orderNumber: "TT-0821",
    userId: "user-cust-1",
    customerName: "Daffa Alif (Member)",
    orderType: "DINE_IN",
    tableNumber: "Meja 04",
    status: "BREWING",
    paymentMethod: "QRIS Kafe (Dinamis)",
    totalAmount: 56000,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    items: [
      {
        menuId: "kopi-1",
        name: "Aceh Gayo Natural V60",
        price: 32000,
        quantity: 1,
        temperature: "Hot",
        sugar: "Tanpa Gula (0%)",
        notes: "Giling medium-fine, pour over santai",
      },
      {
        menuId: "kopi-3",
        name: "Kopi Susu Gula Aren Senja",
        price: 24000,
        quantity: 1,
        temperature: "Iced",
        sugar: "Normal",
        notes: "Es batu standar",
      },
    ],
  },
  {
    id: "order-102",
    orderNumber: "TT-0819",
    userId: "user-cust-1",
    customerName: "Daffa Alif (Member)",
    orderType: "TAKEAWAY",
    tableNumber: "Bawa Pulang",
    status: "COMPLETED",
    paymentMethod: "QRIS Kafe (Dinamis)",
    totalAmount: 35000,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        menuId: "kopi-2",
        name: "Toraja Sapan Japanese Drip",
        price: 35000,
        quantity: 1,
        temperature: "Iced",
        sugar: "Tanpa Gula (0%)",
      },
    ],
  },
];

// Object Store Cache
const Store = {
  // Inisialisasi Cache
  init() {
    if (!localStorage.getItem(CAFE_STORAGE.MENU_KEY)) {
      localStorage.setItem(CAFE_STORAGE.MENU_KEY, JSON.stringify(INITIAL_MENU));
    }
    if (!localStorage.getItem(CAFE_STORAGE.USERS_KEY)) {
      localStorage.setItem(CAFE_STORAGE.USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(CAFE_STORAGE.ORDERS_KEY)) {
      localStorage.setItem(CAFE_STORAGE.ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    }
  },

  // Format Rupiah
  formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  },

  // Menu Methods
  getMenu() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(CAFE_STORAGE.MENU_KEY)) || [];
    } catch {
      return INITIAL_MENU;
    }
  },

  getMenuItem(identifier) {
    const menu = this.getMenu();
    return menu.find((item) => item.id === identifier || item.slug === identifier) || null;
  },

  saveMenuItem(itemData) {
    const menu = this.getMenu();
    const existingIndex = menu.findIndex((m) => m.id === itemData.id);

    if (existingIndex >= 0) {
      menu[existingIndex] = { ...menu[existingIndex], ...itemData };
    } else {
      const slug = itemData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const newItem = {
        ...itemData,
        id: "kopi-" + Date.now(),
        slug: slug,
        isAvailable: true,
      };
      menu.unshift(newItem);
    }

    localStorage.setItem(CAFE_STORAGE.MENU_KEY, JSON.stringify(menu));
    return true;
  },

  deleteMenuItem(id) {
    let menu = this.getMenu();
    menu = menu.filter((item) => item.id !== id);
    localStorage.setItem(CAFE_STORAGE.MENU_KEY, JSON.stringify(menu));
    return true;
  },

  toggleAvailability(id) {
    const menu = this.getMenu();
    const item = menu.find((m) => m.id === id);
    if (item) {
      item.isAvailable = !item.isAvailable;
      localStorage.setItem(CAFE_STORAGE.MENU_KEY, JSON.stringify(menu));
      return item.isAvailable;
    }
    return false;
  },

  // Users & Auth Methods
  getUsers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(CAFE_STORAGE.USERS_KEY)) || [];
    } catch {
      return INITIAL_USERS;
    }
  },

  findUser(identifier) {
    const users = this.getUsers();
    const clean = identifier.trim().toLowerCase();
    return users.find((u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean) || null;
  },

  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: "user-" + Date.now(),
      name: userData.name,
      username: userData.username.trim().toLowerCase(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      role: userData.role || (userData.username.includes("admin") ? "ADMIN" : "USER"),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(CAFE_STORAGE.USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  // Active Session
  getSession() {
    try {
      const session = localStorage.getItem(CAFE_STORAGE.SESSION_KEY);
      if (!session) return null;
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  login(identifier, password) {
    const user = this.findUser(identifier);
    if (!user || user.password !== password) {
      return {
        success: false,
        message: "Username/Email atau password salah! Coba: admin/kopiadmin atau pelanggan/kopienak",
      };
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    localStorage.setItem(CAFE_STORAGE.SESSION_KEY, JSON.stringify(sessionUser));
    return {
      success: true,
      message: `Selamat datang, ${user.name}!`,
      user: sessionUser,
    };
  },

  register(name, username, email, password) {
    if (!name || !username || !password) {
      return { success: false, message: "Nama, username, dan password wajib diisi." };
    }

    const existing = this.findUser(username);
    if (existing) {
      return { success: false, message: "Username sudah digunakan, silakan pilih yang lain." };
    }

    const newUser = this.createUser({
      name,
      username,
      email: email || `${username}@titiktemu.cafe`,
      password,
    });

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    };

    localStorage.setItem(CAFE_STORAGE.SESSION_KEY, JSON.stringify(sessionUser));
    return {
      success: true,
      message: "Registrasi member berhasil!",
      user: sessionUser,
    };
  },

  // Instant Logout tanpa sisa cache sesi
  logout() {
    localStorage.removeItem(CAFE_STORAGE.SESSION_KEY);
    return true;
  },

  // Profile Details & Durasi Akun
  getUserProfile(userId) {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return null;

    const now = new Date();
    const created = new Date(user.createdAt);
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);

    let membershipDuration = "Baru bergabung hari ini";
    if (diffMonths >= 1) {
      membershipDuration = `${diffMonths} bulan yang lalu`;
    } else if (diffDays >= 1) {
      membershipDuration = `${diffDays} hari yang lalu`;
    }

    const joinedDateFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(created);

    return {
      ...user,
      membershipDuration,
      joinedDateFormatted,
    };
  },

  // Order Methods
  getOrders(userId = null) {
    this.init();
    try {
      const orders = JSON.parse(localStorage.getItem(CAFE_STORAGE.ORDERS_KEY)) || [];
      if (userId) {
        return orders.filter((o) => o.userId === userId);
      }
      return orders;
    } catch {
      return [];
    }
  },

  addOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      ...orderData,
      id: "order-" + Date.now(),
      orderNumber: "TT-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    localStorage.setItem(CAFE_STORAGE.ORDERS_KEY, JSON.stringify(orders));
    return newOrder;
  },

  updateOrderStatus(orderId, nextStatus) {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = nextStatus;
      localStorage.setItem(CAFE_STORAGE.ORDERS_KEY, JSON.stringify(orders));
      return true;
    }
    return false;
  },

  // Barista & Kasir Admin Stats
  getAdminStats() {
    const orders = this.getOrders();
    let totalRevenue = 0;
    let totalCups = 0;
    let activeQueue = 0;
    const itemCounts = {};

    for (const order of orders) {
      if (order.status !== "COMPLETED") {
        activeQueue++;
      }
      totalRevenue += order.totalAmount || 0;
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          totalCups += item.quantity || 1;
          itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
        }
      }
    }

    let topSeller = "Belum Ada";
    let maxCount = 0;
    for (const [name, count] of Object.entries(itemCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topSeller = name;
      }
    }

    return {
      totalRevenue,
      totalCups,
      activeQueue,
      topSeller,
    };
  },

  // Reset Cache ke default jika dibutuhkan
  resetToDefault() {
    localStorage.setItem(CAFE_STORAGE.MENU_KEY, JSON.stringify(INITIAL_MENU));
    localStorage.setItem(CAFE_STORAGE.USERS_KEY, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(CAFE_STORAGE.ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    localStorage.removeItem(CAFE_STORAGE.SESSION_KEY);
  },
};

// Inisialisasi otomatis
Store.init();
