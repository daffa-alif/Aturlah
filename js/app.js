/**
 * MASTER EVENT MODULE - JAVASCRIPT CONTROLLER
 * Sistem Pengelolaan Event dan Workshop (Individu A)
 */

// Key untuk localStorage
const STORAGE_KEY = 'master_events_data';

// Data Awal (Sample Data untuk Seminar, Pelatihan Teknis, & Konferensi Akademik)
const initialEvents = [
  {
    id: 'EVT-001',
    title: 'Workshop RESTful API Architecture dengan Laravel 11 & Clean Architecture',
    category: 'Teknologi',
    description: 'Pelatihan intensif bagi mahasiswa dan pengembang software untuk merancang endpoint RESTful API terstandar, relasi database kompleks, serta validasi request.',
    sessionDuration: 90, // menit per sesi
    totalSessions: 4,
    status: 'Published',
    syllabuses: [
      {
        moduleNumber: 1,
        title: 'Arsitektur Database Relasional & Migrasi Laravel',
        duration: 90,
        description: 'Perancangan ERD, skema tabel master, relasi one-to-many, indexing database, dan seeder data.'
      },
      {
        moduleNumber: 2,
        title: 'Implementasi Laravel MVC, Form Request & Validasi',
        duration: 90,
        description: 'Pemisahan business logic, pembuatan custom request validation, dan penanganan exception error.'
      },
      {
        moduleNumber: 3,
        title: 'RESTful API Resources & Endpoint Standardization',
        duration: 90,
        description: 'Standarisasi JSON response, HTTP status code (200, 201, 400, 422, 500), pagination API, dan rate limiting.'
      },
      {
        moduleNumber: 4,
        title: 'Autentikasi Token Sanctum & Dokumentasi Postman',
        duration: 90,
        description: 'Pengamanan endpoint dengan Bearer Token, middleware role-based access, dan integrasi OpenAPI/Postman.'
      }
    ]
  },
  {
    id: 'EVT-002',
    title: 'Seminar Strategi Valuasi & Inovasi Model Bisnis Startup Digital',
    category: 'Bisnis',
    description: 'Seminar eksklusif mengupas cara memvalidasi product-market fit, merancang unit economics yang sehat, dan teknik pitching di hadapan venture capital.',
    sessionDuration: 120,
    totalSessions: 3,
    status: 'Published',
    syllabuses: [
      {
        moduleNumber: 1,
        title: 'Validasi Pasar & Metrik Product-Market Fit (PMF)',
        duration: 120,
        description: 'Identifikasi customer pain-points, segmentasi pasar B2B vs B2C, dan validasi traction awal.'
      },
      {
        moduleNumber: 2,
        title: 'Unit Economics: CAC, LTV, dan Financial Runway',
        duration: 120,
        description: 'Kalkulasi Customer Acquisition Cost, Lifetime Value, burn rate, dan proyeksi arus kas operasional.'
      },
      {
        moduleNumber: 3,
        title: 'Pitching Masterclass & Term Sheet Negotiation',
        duration: 120,
        description: 'Struktur pitch deck 10 slide, teknik negosiasi valuasi equity, dan klausul penting dalam term sheet.'
      }
    ]
  },
  {
    id: 'EVT-003',
    title: 'Pelatihan Cloud Infrastructure & Kubernetes Container Orchestration',
    category: 'Teknologi',
    description: 'Workshop teknis implementasi containerization aplikasi backend, deployment microservices, dan continuous delivery di environment cloud.',
    sessionDuration: 100,
    totalSessions: 3,
    status: 'Draft',
    syllabuses: [
      {
        moduleNumber: 1,
        title: 'Dockerizing Multi-service Application',
        duration: 100,
        description: 'Optimasi multi-stage Dockerfile, docker-compose untuk database dan backend service.'
      },
      {
        moduleNumber: 2,
        title: 'Kubernetes Pods, Services, and Ingress Controller',
        duration: 100,
        description: 'Manajemen deployment manifest YAML, load balancer, dan routing ingress.'
      },
      {
        moduleNumber: 3,
        title: 'CI/CD Pipeline Automation & Monitoring',
        duration: 100,
        description: 'Integrasi GitHub Actions, auto deployment, dan log tracking dengan Prometheus/Grafana.'
      }
    ]
  },
  {
    id: 'EVT-004',
    title: 'Executive Workshop: B2B Enterprise Sales & Strategic Partnership',
    category: 'Bisnis',
    description: 'Strategi negosiasi dan akuisisi klien korporat berskala besar, penyusunan kontrak kerjasama, dan penutupan kesepakatan bernilai tinggi.',
    sessionDuration: 60,
    totalSessions: 2,
    status: 'Published',
    syllabuses: [
      {
        moduleNumber: 1,
        title: 'Pipeline Management & Stakeholder Mapping',
        duration: 60,
        description: 'Mengidentifikasi decision makers di perusahaan enterprise dan teknik cold outreach.'
      },
      {
        moduleNumber: 2,
        title: 'Contract Negotiation & SLA Agreement',
        duration: 60,
        description: 'Penyusunan Service Level Agreement (SLA), klausul penalti, dan penutupan kontrak tahunan.'
      }
    ]
  }
];

// Inisialisasi Database LocalStorage
function getEventsData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialEvents));
    return initialEvents;
  }
  return JSON.parse(data);
}

function saveEventsData(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// --------------------------------------------------------------------------
// Toast Notification
// --------------------------------------------------------------------------
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' 
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' 
        : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'}
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger anim
  setTimeout(() => toast.classList.add('show'), 20);

  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --------------------------------------------------------------------------
// Halaman Dashboard & Data Table (index.html)
// --------------------------------------------------------------------------
let currentCategoryFilter = 'Semua';
let searchQuery = '';

function renderDashboard() {
  const tableBody = document.getElementById('eventTableBody');
  if (!tableBody) return; // Bukan di index.html

  const events = getEventsData();

  // Hitung Statistik
  const totalEvents = events.length;
  const techEvents = events.filter(e => e.category === 'Teknologi').length;
  const bizEvents = events.filter(e => e.category === 'Bisnis').length;
  const totalDurationMinutes = events.reduce((sum, e) => {
    const syllabusMins = e.syllabuses ? e.syllabuses.reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0) : (e.sessionDuration * (e.totalSessions || 1));
    return sum + syllabusMins;
  }, 0);
  const totalHours = (totalDurationMinutes / 60).toFixed(1);

  // Update elemen kartu statistik
  const statTotal = document.getElementById('statTotalEvents');
  const statTech = document.getElementById('statTechEvents');
  const statBiz = document.getElementById('statBizEvents');
  const statHours = document.getElementById('statTotalHours');

  if (statTotal) statTotal.textContent = totalEvents;
  if (statTech) statTech.textContent = techEvents;
  if (statBiz) statBiz.textContent = bizEvents;
  if (statHours) statHours.textContent = `${totalHours} Jam`;

  // Filter Data
  const filteredEvents = events.filter(event => {
    const matchesCategory = currentCategoryFilter === 'Semua' || event.category === currentCategoryFilter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Render Baris Tabel
  if (filteredEvents.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="table-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 12px; display: block; opacity: 0.5;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <p style="font-weight: 500; font-size: 0.95rem;">Tidak ada event yang ditemukan</p>
          <span style="font-size: 0.8rem; color: var(--slate-400);">Coba ubah kata kunci pencarian atau kategori filter.</span>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredEvents.map(event => {
    const syllabusCount = event.syllabuses ? event.syllabuses.length : 0;
    const totalSyllabusMins = event.syllabuses ? event.syllabuses.reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0) : (event.sessionDuration * event.totalSessions);
    const categoryBadgeClass = event.category === 'Teknologi' ? 'badge-tech' : 'badge-business';

    return `
      <tr>
        <td style="font-family: monospace; font-size: 0.8rem; font-weight: 600; color: var(--slate-500);">${event.id}</td>
        <td>
          <div class="event-cell-info">
            <span class="event-cell-title">${escapeHTML(event.title)}</span>
            <span class="event-cell-desc" title="${escapeHTML(event.description)}">${escapeHTML(event.description)}</span>
          </div>
        </td>
        <td>
          <span class="badge ${categoryBadgeClass}">
            <span class="badge-dot"></span>
            ${event.category}
          </span>
        </td>
        <td>
          <div>
            <strong>${event.sessionDuration} Mnt</strong> / sesi
            <div style="font-size: 0.75rem; color: var(--slate-400);">${event.totalSessions || syllabusCount} sesi (${totalSyllabusMins} mnt total)</div>
          </div>
        </td>
        <td>
          <button class="badge badge-syllabus" onclick="viewSyllabusModal('${event.id}')" title="Klik untuk lihat rincian materi">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            ${syllabusCount} Modul Materi
          </button>
        </td>
        <td>
          <span class="badge" style="background: ${event.status === 'Published' ? '#ecfdf5' : '#fffbeb'}; color: ${event.status === 'Published' ? '#059669' : '#d97706'}; border: 1px solid ${event.status === 'Published' ? '#a7f3d0' : '#fde68a'};">
            ${event.status}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="action-btn" onclick="viewSyllabusModal('${event.id}')" title="Lihat Detail & Silabus">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <a href="event-form.html?id=${event.id}" class="action-btn" title="Edit Event">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </a>
            <button class="action-btn delete" onclick="confirmDeleteEvent('${event.id}')" title="Hapus Event">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// --------------------------------------------------------------------------
// Modal Detail Silabus Event
// --------------------------------------------------------------------------
function viewSyllabusModal(eventId) {
  const events = getEventsData();
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  const modal = document.getElementById('syllabusDetailModal');
  if (!modal) return;

  document.getElementById('modalEventTitle').textContent = event.title;
  document.getElementById('modalEventCategory').innerHTML = `
    <span class="badge ${event.category === 'Teknologi' ? 'badge-tech' : 'badge-business'}">
      ${event.category}
    </span>
  `;
  document.getElementById('modalEventDesc').textContent = event.description;
  document.getElementById('modalEventDuration').textContent = `${event.sessionDuration} Menit / Sesi`;

  const timelineContainer = document.getElementById('modalTimeline');
  if (event.syllabuses && event.syllabuses.length > 0) {
    timelineContainer.innerHTML = event.syllabuses.map((item, index) => `
      <div class="timeline-item">
        <div class="timeline-node">${index + 1}</div>
        <div class="timeline-content">
          <div class="timeline-title">
            <span>${escapeHTML(item.title)}</span>
            <span class="timeline-duration">${item.duration || event.sessionDuration} Menit</span>
          </div>
          <div class="timeline-desc">${escapeHTML(item.description)}</div>
        </div>
      </div>
    `).join('');
  } else {
    timelineContainer.innerHTML = `<p style="color: var(--slate-400); font-style: italic;">Belum ada materi silabus yang ditambahkan.</p>`;
  }

  modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function confirmDeleteEvent(eventId) {
  if (confirm(`Apakah Anda yakin ingin menghapus Event dengan ID [${eventId}]? Tindakan ini tidak dapat dibatalkan.`)) {
    let events = getEventsData();
    events = events.filter(e => e.id !== eventId);
    saveEventsData(events);
    renderDashboard();
    showToast(`Event ${eventId} berhasil dihapus dari sistem!`, 'success');
  }
}

// --------------------------------------------------------------------------
// Form Handler (event-form.html)
// --------------------------------------------------------------------------
let syllabusCounter = 0;

function initEventForm() {
  const form = document.getElementById('eventForm');
  if (!form) return; // Bukan di event-form.html

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');

  const container = document.getElementById('syllabusContainer');
  const btnAdd = document.getElementById('btnAddSyllabus');

  // Tombol tambah modul silabus
  if (btnAdd && container) {
    btnAdd.addEventListener('click', () => {
      addSyllabusRow(container);
      updateTotalSummary();
    });
  }

  // Jika mode edit, muat data existing
  if (editId) {
    const events = getEventsData();
    const event = events.find(e => e.id === editId);
    if (event) {
      document.getElementById('formPageTitle').textContent = 'Edit Data Master Event';
      document.getElementById('formPageSubtitle').textContent = `Perbarui rincian topik, kategori, dan silabus untuk ID: ${event.id}`;
      document.getElementById('eventId').value = event.id;
      document.getElementById('eventTitle').value = event.title;
      document.getElementById('eventDescription').value = event.description;
      document.getElementById('sessionDuration').value = event.sessionDuration;
      document.getElementById('totalSessions').value = event.totalSessions || (event.syllabuses ? event.syllabuses.length : 1);
      
      // Radio Kategori
      const categoryRadios = document.getElementsByName('category');
      categoryRadios.forEach(radio => {
        if (radio.value === event.category) {
          radio.checked = true;
          highlightSelectedCategory(radio.value);
        }
      });

      // Status
      if (document.getElementById('eventStatus')) {
        document.getElementById('eventStatus').value = event.status;
      }

      // Populate Silabus
      if (container) {
        container.innerHTML = '';
        if (event.syllabuses && event.syllabuses.length > 0) {
          event.syllabuses.forEach(s => {
            addSyllabusRow(container, s.title, s.duration, s.description);
          });
        } else {
          addSyllabusRow(container);
        }
      }

      updateTotalSummary();
    }
  } else {
    // Mode Create Baru: Berikan 2 baris silabus awal sebagai panduan
    if (container) {
      addSyllabusRow(container, 'Pengenalan & Teori Dasar', 60, 'Membahas konsep fundamental dan pengantar pokok bahasan.');
      addSyllabusRow(container, 'Praktik & Studi Kasus Penerapan', 90, 'Implementasi teknis langsung atau simulasi studi kasus industri.');
      updateTotalSummary();
    }
  }

  // Event listener submit form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEventForm();
  });

  // Event listener input durasi
  const sessionDurInput = document.getElementById('sessionDuration');
  if (sessionDurInput) {
    sessionDurInput.addEventListener('input', updateTotalSummary);
  }
}

// Fungsi Tambah Baris Silabus Dinamis
function addSyllabusRow(container, title = '', duration = '', description = '') {
  syllabusCounter++;
  const defaultDuration = duration || document.getElementById('sessionDuration')?.value || 90;

  const card = document.createElement('div');
  card.className = 'syllabus-item-card';
  card.dataset.index = syllabusCounter;

  card.innerHTML = `
    <div class="syllabus-item-header">
      <span class="syllabus-item-tag">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span class="module-title-label">Modul Sesi</span>
      </span>
      <button type="button" class="btn-remove-syllabus" onclick="removeSyllabusRow(this)" title="Hapus Modul Sesi Ini">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
    <div class="syllabus-row-fields">
      <div>
        <label class="form-label" style="font-size: 0.775rem;">Judul Materi / Topik <span class="required">*</span></label>
        <input type="text" class="form-control syllabus-title" placeholder="Contoh: Desain Arsitektur Database" value="${escapeHTML(title)}" required>
      </div>
      <div>
        <label class="form-label" style="font-size: 0.775rem;">Durasi Sesi (Menit) <span class="required">*</span></label>
        <div class="input-with-unit">
          <input type="number" class="form-control syllabus-duration" min="15" step="5" value="${defaultDuration}" oninput="updateTotalSummary()" required>
          <span class="unit-label">Menit</span>
        </div>
      </div>
    </div>
    <div>
      <label class="form-label" style="font-size: 0.775rem;">Pokok Pembahasan Silabus</label>
      <textarea class="form-control syllabus-desc" rows="2" placeholder="Rangkuman pokok materi yang dipelajari dalam sesi ini...">${escapeHTML(description)}</textarea>
    </div>
  `;

  container.appendChild(card);
  reindexSyllabusLabels();
}

function removeSyllabusRow(button) {
  const card = button.closest('.syllabus-item-card');
  const container = document.getElementById('syllabusContainer');
  if (container.querySelectorAll('.syllabus-item-card').length <= 1) {
    alert('Event harus memiliki setidaknya minimal satu modul materi silabus!');
    return;
  }
  card.remove();
  reindexSyllabusLabels();
  updateTotalSummary();
}

function reindexSyllabusLabels() {
  const container = document.getElementById('syllabusContainer');
  if (!container) return;
  const cards = container.querySelectorAll('.syllabus-item-card');
  cards.forEach((card, index) => {
    const label = card.querySelector('.module-title-label');
    if (label) {
      label.textContent = `Modul Sesi ${index + 1}`;
    }
  });

  const totalSessionsInput = document.getElementById('totalSessions');
  if (totalSessionsInput) {
    totalSessionsInput.value = cards.length;
  }
}

// Highlight Kartu Radio Kategori
function highlightSelectedCategory(selectedValue) {
  const techCard = document.getElementById('cardCategoryTech');
  const bizCard = document.getElementById('cardCategoryBiz');
  if (!techCard || !bizCard) return;

  if (selectedValue === 'Teknologi') {
    techCard.classList.add('active-tech');
    bizCard.classList.remove('active-biz');
  } else {
    bizCard.classList.add('active-biz');
    techCard.classList.remove('active-tech');
  }
}

// Update Perhitungan Ringkasan Samping Form
function updateTotalSummary() {
  const titleInput = document.getElementById('eventTitle');
  const sessionDurInput = document.getElementById('sessionDuration');
  const container = document.getElementById('syllabusContainer');

  const summaryTitle = document.getElementById('sumTitle');
  const summaryCategory = document.getElementById('sumCategory');
  const summaryTotalModules = document.getElementById('sumTotalModules');
  const summaryTotalDuration = document.getElementById('sumTotalDuration');

  if (summaryTitle && titleInput) {
    summaryTitle.textContent = titleInput.value.trim() ? titleInput.value.trim() : '(Belum diisi)';
  }

  const checkedCat = document.querySelector('input[name="category"]:checked');
  if (summaryCategory && checkedCat) {
    summaryCategory.textContent = checkedCat.value;
    highlightSelectedCategory(checkedCat.value);
  }

  if (container) {
    const cards = container.querySelectorAll('.syllabus-item-card');
    if (summaryTotalModules) {
      summaryTotalModules.textContent = `${cards.length} Modul`;
    }

    let totalMinutes = 0;
    cards.forEach(card => {
      const dur = parseInt(card.querySelector('.syllabus-duration')?.value) || 0;
      totalMinutes += dur;
    });

    const hours = (totalMinutes / 60).toFixed(1);
    if (summaryTotalDuration) {
      summaryTotalDuration.textContent = `${totalMinutes} Menit (~${hours} Jam)`;
    }
  }
}

// Simpan Data Form ke LocalStorage
function saveEventForm() {
  const idField = document.getElementById('eventId').value;
  const title = document.getElementById('eventTitle').value.trim();
  const category = document.querySelector('input[name="category"]:checked')?.value || 'Teknologi';
  const description = document.getElementById('eventDescription').value.trim();
  const sessionDuration = parseInt(document.getElementById('sessionDuration').value) || 90;
  const status = document.getElementById('eventStatus')?.value || 'Published';

  // Kumpulkan Data Silabus
  const container = document.getElementById('syllabusContainer');
  const cards = container.querySelectorAll('.syllabus-item-card');
  const syllabuses = [];

  cards.forEach((card, idx) => {
    const sTitle = card.querySelector('.syllabus-title').value.trim();
    const sDur = parseInt(card.querySelector('.syllabus-duration').value) || sessionDuration;
    const sDesc = card.querySelector('.syllabus-desc').value.trim();

    if (sTitle) {
      syllabuses.push({
        moduleNumber: idx + 1,
        title: sTitle,
        duration: sDur,
        description: sDesc
      });
    }
  });

  if (syllabuses.length === 0) {
    alert('Harap lengkapi setidaknya satu judul silabus modul!');
    return;
  }

  let events = getEventsData();

  if (idField) {
    // Mode Update
    const index = events.findIndex(e => e.id === idField);
    if (index !== -1) {
      events[index] = {
        ...events[index],
        title,
        category,
        description,
        sessionDuration,
        totalSessions: syllabuses.length,
        status,
        syllabuses
      };
      saveEventsData(events);
      showToast(`Event ${idField} berhasil diperbarui!`, 'success');
      setTimeout(() => window.location.href = 'index.html', 1000);
      return;
    }
  }

  // Mode Create Baru
  const nextNum = events.length + 1;
  const newId = `EVT-00${nextNum}`;
  const newEvent = {
    id: newId,
    title,
    category,
    description,
    sessionDuration,
    totalSessions: syllabuses.length,
    status,
    syllabuses
  };

  events.unshift(newEvent);
  saveEventsData(events);
  showToast(`Event baru [${newId}] berhasil disimpan!`, 'success');
  setTimeout(() => window.location.href = 'index.html', 1000);
}

// Helper XSS Escape
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// --------------------------------------------------------------------------
// Penanganan Spesifikasi Placeholder Modul Kelompok (B, C, D)
// --------------------------------------------------------------------------
const peerModuleSpecs = {
  'B': {
    code: 'Modul B',
    title: 'Pendaftaran Narasumber / Speaker',
    assignee: 'Individu B',
    roleTag: 'Speaker Management',
    description: 'Modul otonom yang bertanggung jawab mengorganisir kurasi profil narasumber, biodata profesional, keahlian teknis, afiliasi institusi, serta penugasan pembicara ke dalam sesi silabus Master Event.',
    dbRelations: [
      { key: 'Foreign Key Event', val: 'event_speakers.event_id -> events.id' },
      { key: 'Relasi Silabus', val: 'event_speakers.syllabus_id -> event_syllabuses.id' },
      { key: 'Tipe Kardinalitas', val: 'Many-to-Many (N : M) via Pivot Table' }
    ],
    endpoints: [
      { method: 'GET', url: '/api/v1/events/{event_id}/speakers', desc: 'Daftar pembicara pada event ini' },
      { method: 'POST', url: '/api/v1/events/{event_id}/assign-speaker', desc: 'Menugaskan speaker ke silabus sesi' },
      { method: 'DELETE', url: '/api/v1/events/{event_id}/speakers/{id}', desc: 'Membatalkan penugasan speaker' }
    ],
    migrationCode: `Schema::create('event_speakers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
    $table->foreignId('speaker_id')->constrained('speakers');
    $table->foreignId('syllabus_id')->nullable()->constrained('event_syllabuses');
    $table->string('role_topic')->default('Keynote Speaker');
    $table->timestamps();
});`
  },
  'C': {
    code: 'Modul C',
    title: 'Klasifikasi Kategori Tiket & Benefit',
    assignee: 'Individu C',
    roleTag: 'Ticketing & Pricing Tier',
    description: 'Modul otonom untuk merancang klasifikasi tingkatan tiket (Early Bird, Regular, VIP, Mahasiswa), kuota kursi yang dialokasikan per event, penentuan harga, dan paket benefit (E-Sertifikat, Merchandise, Rekaman Sesi).',
    dbRelations: [
      { key: 'Foreign Key Event', val: 'ticket_tiers.event_id -> events.id' },
      { key: 'Integritas Referensial', val: 'ON DELETE CASCADE (Event dihapus = Tiket terhapus)' },
      { key: 'Tipe Kardinalitas', val: 'One-to-Many (1 : N)' }
    ],
    endpoints: [
      { method: 'GET', url: '/api/v1/events/{event_id}/tickets', desc: 'Mengambil tier tiket aktif' },
      { method: 'POST', url: '/api/v1/events/{event_id}/tickets', desc: 'Menambah kategori tiket baru' },
      { method: 'PATCH', url: '/api/v1/tickets/{id}/adjust-quota', desc: 'Update sisa kuota tiket' }
    ],
    migrationCode: `Schema::create('ticket_tiers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
    $table->string('tier_name'); // VIP, Early Bird, Regular
    $table->decimal('price', 12, 2)->default(0);
    $table->integer('quota')->default(100);
    $table->json('benefits'); // ['Sertifikat', 'Recording', 'Lunch']
    $table->timestamps();
});`
  },
  'D': {
    code: 'Modul D',
    title: 'Direktori Profil Peserta & Presensi',
    assignee: 'Individu D',
    roleTag: 'Attendee Directory',
    description: 'Modul otonom yang mengelola biodata profil peserta terdaftar, penerbitan e-tiket berbasis QR Code, verifikasi kehadiran per sesi silabus, dan pencetakan sertifikat kelulusan workshop.',
    dbRelations: [
      { key: 'Foreign Key Event', val: 'event_registrations.event_id -> events.id' },
      { key: 'Foreign Key Tiket', val: 'event_registrations.ticket_id -> ticket_tiers.id' },
      { key: 'Tipe Kardinalitas', val: 'Many-to-Many (N : M) via Registrations' }
    ],
    endpoints: [
      { method: 'GET', url: '/api/v1/events/{event_id}/attendees', desc: 'Daftar peserta terverifikasi' },
      { method: 'POST', url: '/api/v1/events/{event_id}/verify-checkin', desc: 'Scan QR Code kehadiran sesi' },
      { method: 'GET', url: '/api/v1/attendees/{id}/certificate', desc: 'Generate PDF sertifikat peserta' }
    ],
    migrationCode: `Schema::create('event_registrations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
    $table->foreignId('attendee_id')->constrained('attendees');
    $table->foreignId('ticket_tier_id')->constrained('ticket_tiers');
    $table->string('registration_code')->unique();
    $table->enum('attendance_status', ['Hadir', 'Absen'])->default('Absen');
    $table->timestamps();
});`
  }
};

function openModuleInfoModal(moduleCode) {
  const spec = peerModuleSpecs[moduleCode];
  if (!spec) return;

  const modal = document.getElementById('peerModuleModal');
  if (!modal) return;

  document.getElementById('peerModuleBadge').textContent = spec.code;
  document.getElementById('peerModuleTitle').textContent = spec.title;
  document.getElementById('peerModuleAssignee').textContent = `Penanggung Jawab: ${spec.assignee} (${spec.roleTag})`;
  document.getElementById('peerModuleDesc').textContent = spec.description;

  // Render DB Relations
  const relationsContainer = document.getElementById('peerModuleRelations');
  if (relationsContainer) {
    relationsContainer.innerHTML = spec.dbRelations.map(rel => `
      <div class="relation-item">
        <span class="relation-key">${rel.key}:</span>
        <span class="relation-val">${rel.val}</span>
      </div>
    `).join('');
  }

  // Render Endpoints
  const endpointsContainer = document.getElementById('peerModuleEndpoints');
  if (endpointsContainer) {
    endpointsContainer.innerHTML = spec.endpoints.map(ep => `
      <div class="endpoint-pill">
        <span class="method-badge ${ep.method === 'GET' ? 'method-get' : 'method-post'}">${ep.method}</span>
        <strong style="color: var(--slate-800);">${ep.url}</strong>
        <span style="color: var(--slate-500); margin-left: auto; font-size: 0.775rem;">${ep.desc}</span>
      </div>
    `).join('');
  }

  // Render Migration
  const migrationBox = document.getElementById('peerModuleMigration');
  if (migrationBox) {
    migrationBox.textContent = spec.migrationCode;
  }

  modal.classList.add('active');
  showToast(`Menampilkan spesifikasi arsitektur ${spec.code}: ${spec.title}`, 'success');
}

// --------------------------------------------------------------------------
// Inisialisasi Saat Dokumen Dimuat
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Sidebar Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const sidebar = document.querySelector('.sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Setup Listener untuk Dashboard (index.html)
  const searchInput = document.getElementById('tableSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderDashboard();
    });
  }

  const catTabs = document.querySelectorAll('.cat-tab');
  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategoryFilter = tab.dataset.category;
      renderDashboard();
    });
  });

  // Modal Backdrop Click to Close
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Setup Form Listener (event-form.html)
  initEventForm();

  // Initial Table Render
  renderDashboard();
});
