# Modul Master Event & Silabus (Individu A)
### Sistem Pengelolaan Event dan Workshop (Seminar, Pelatihan Teknis, & Konferensi Akademik)

Antarmuka Front-End (HTML5, CSS3, & Vanilla JS) yang dirancang untuk **Individu A** dalam memenuhi tugas implementasi modul otonom sistem informasi event. Modul ini fokus pada pengelolaan master data kegiatan, klasifikasi bidang, durasi sesi, serta kurikulum/silabus pembelajaran.

---

## 1. Fitur Utama Front-End

1. **Pengelolaan Judul Event**:
   - Input judul terstandar dengan validasi format.
   - Live preview judul pada kartu konfigurasi ringkasan.
2. **Deskripsi Event**:
   - Area teks deskripsi mendalam mengenai latar belakang, sasaran peserta, dan tujuan seminar/workshop.
3. **Kategori Event (Teknologi vs Bisnis)**:
   - Pemilihan kategori visual interaktif (*Radio Card* dengan styling khusus).
   - Badge penanda kategori dengan kode warna (*Cyan/Blue* untuk Teknologi, *Emerald Green* untuk Bisnis).
   - Tab filter pada tabel data master untuk memisahkan kegiatan secara instan.
4. **Pengelolaan Silabus Dinamis (*Dynamic Syllabus Builder*)**:
   - Kemampuan menambah (*Add Module*) dan menghapus (*Remove Module*) baris materi pembelajaran secara fleksibel.
   - Setiap modul silabus mencakup: Judul Materi, Alokasi Durasi Sesi (Menit), dan Pokok-pokok Pembahasan.
   - Penomoran otomatis (*Modul Sesi 1, Modul Sesi 2, dst.*).
5. **Durasi Sesi & Kalkulator Waktu**:
   - Konfigurasi alokasi menit per sesi.
   - Rekalkulasi total durasi seluruh silabus materi secara otomatis dalam menit dan jam.
6. **Modal Detail Silabus Interaktif**:
   - Tampilan alur kurikulum berformat *timeline node* tanpa memuat ulang halaman.
7. **Simulasi State Data (*LocalStorage*)**:
   - CRUD data tersimpan di browser untuk pengujian antarmuka sebelum dihubungkan ke backend database.

---

## 2. Struktur Berkas Front-End

```
master-event-frontend/
├── index.html          # Dashboard utama, kartu metrik statistik, dan tabel master event
├── event-form.html     # Formulir tambah & edit event dengan Dynamic Syllabus Builder
├── css/
│   └── style.css       # Custom stylesheet terstruktur (CSS Variables, Flexbox, Grid, Modal, Badges)
├── js/
│   └── app.js          # Controller interaktif DOM, filter/search, kalkulator durasi, & modal
└── README.md           # Panduan integrasi Laravel MVC & arsitektur database relasional
```

---

## 3. Panduan Integrasi ke Backend Laravel MVC

Modul ini dirancang agar siap dipecah menjadi komponen Blade dan dihubungkan ke controller serta database relasional Laravel.

### A. Skema Database Relasional (Migrations)

Hubungan antar tabel menggunakan relasi **One-to-Many (`1 : N`)**: satu event memiliki banyak silabus sesi.

#### Migration 1: `create_events_table.php`
```php
Schema::create('events', function (Blueprint $table) {
    $table->id();
    $table->string('event_code')->unique(); // Contoh: EVT-001
    $table->string('title');
    $table->enum('category', ['Teknologi', 'Bisnis']);
    $table->text('description');
    $table->integer('session_duration')->default(90); // Durasi per sesi dalam menit
    $table->integer('total_sessions')->default(1);
    $table->enum('status', ['Draft', 'Published'])->default('Published');
    $table->timestamps();
});
```

#### Migration 2: `create_event_syllabuses_table.php`
```php
Schema::create('event_syllabuses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
    $table->integer('module_number'); // Urutan modul (1, 2, 3...)
    $table->string('title');          // Judul materi sesi
    $table->integer('duration');       // Alokasi menit sesi materi
    $table->text('description')->nullable(); // Pokok bahasan
    $table->timestamps();
});
```

---

### B. Eloquent Models & Relasi

#### Model `Event.php`
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'event_code', 'title', 'category', 'description', 
        'session_duration', 'total_sessions', 'status'
    ];

    public function syllabuses(): HasMany
    {
        return $this->hasMany(EventSyllabus::class)->orderBy('module_number', 'asc');
    }
}
```

#### Model `EventSyllabus.php`
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventSyllabus extends Model
{
    protected $fillable = [
        'event_id', 'module_number', 'title', 'duration', 'description'
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
```

---

### C. Resource Controller (`EventController.php`)

```php
namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with('syllabuses');
        
        if ($request->has('category') && $request->category !== 'Semua') {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $events = $query->latest()->paginate(10);
        return view('events.index', compact('events'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|in:Teknologi,Bisnis',
            'session_duration' => 'required|integer|min:15',
            'description' => 'required|string',
            'syllabuses' => 'required|array|min:1',
            'syllabuses.*.title' => 'required|string',
            'syllabuses.*.duration' => 'required|integer',
            'syllabuses.*.description' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $event = Event::create([
                'event_code' => 'EVT-' . strtoupper(uniqid()),
                'title' => $validated['title'],
                'category' => $validated['category'],
                'description' => $validated['description'],
                'session_duration' => $validated['session_duration'],
                'total_sessions' => count($validated['syllabuses']),
                'status' => $request->input('status', 'Published'),
            ]);

            foreach ($validated['syllabuses'] as $index => $item) {
                $event->syllabuses()->create([
                    'module_number' => $index + 1,
                    'title' => $item['title'],
                    'duration' => $item['duration'],
                    'description' => $item['description'] ?? null,
                ]);
            }
        });

        return redirect()->route('events.index')->with('success', 'Master Event berhasil disimpan!');
    }
}
```

---

### D. Standarisasi Endpoint RESTful API

Untuk penyediaan endpoint API otonom:

| Method | Endpoint | Deskripsi | Status Code |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/events` | Menampilkan seluruh daftar master event | `200 OK` |
| **POST** | `/api/v1/events` | Menyimpan event baru beserta relasi silabus | `201 Created` |
| **GET** | `/api/v1/events/{id}` | Mengambil detail 1 event beserta daftar silabus | `200 OK` |
| **PUT** | `/api/v1/events/{id}` | Memperbarui data event dan struktur silabus | `200 OK` |
| **DELETE** | `/api/v1/events/{id}` | Menghapus event (otomatis menghapus silabus) | `204 No Content` |

#### Contoh Payload JSON Request `POST /api/v1/events`:
```json
{
  "title": "Workshop Machine Learning untuk Fraud Detection",
  "category": "Teknologi",
  "session_duration": 90,
  "description": "Pelatihan pembuatan model klasifikasi anomali data transaksi keuangan.",
  "status": "Published",
  "syllabuses": [
    {
      "module_number": 1,
      "title": "Eksplorasi Data & Feature Engineering",
      "duration": 90,
      "description": "Handling missing data, scaling, dan one-hot encoding."
    },
    {
      "module_number": 2,
      "title": "Modeling dengan Random Forest & XGBoost",
      "duration": 90,
      "description": "Pelatihan model, hyperparameter tuning, dan evaluasi ROC-AUC."
    }
  ]
}
```

---

## 4. Cara Menjalankan Prototipe Front-End

1. Cukup buka berkas `index.html` pada browser favorit Anda (Chrome, Edge, Firefox).
2. Tidak memerlukan server PHP/NodeJS aktif untuk menguji antarmuka, karena seluruh interaksi data (simpan, edit, hapus, filter, timeline modal) telah dilengkapi *state controller* di berkas `js/app.js`.
3. Untuk menghubungkan ke project Laravel Anda nantinya:
   - Pindahkan berkas `css/style.css` ke direktori `public/css/style.css`.
   - Pindahkan berkas `js/app.js` ke direktori `public/js/app.js`.
   - Konversikan `index.html` dan `event-form.html` menjadi view blade `resources/views/events/index.blade.php` dan `create.blade.php`.
