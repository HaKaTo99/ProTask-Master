# Blueprint: Membangun Gantt Chart Interaktif dari Nol di Next.js

Dokumen ini adalah panduan teknis komprehensif yang menguraikan arsitektur dan proses implementasi komponen Gantt Chart canggih. Tujuannya adalah untuk memberikan pemahaman yang jelas, langkah demi langkah, tentang bagaimana setiap fitur dibangun, dari struktur dasar hingga fungsionalitas paling interaktif.

## Visi & Fitur Utama

Tujuan akhirnya adalah menciptakan komponen Gantt Chart yang setara dengan *tool* manajemen proyek modern, dengan fokus pada:

- **Visualisasi Intuitif:** Menampilkan data proyek dalam format timeline yang mudah dibaca.
- **Interaktivitas Penuh:** Memungkinkan pengguna untuk memanipulasi jadwal secara langsung (klik, drag, edit).
- **Analisis Proyek:** Menyediakan fitur untuk analisis, seperti jalur kritis dan perbandingan rencana awal.
- **Performa Tinggi:** Memastikan aplikasi tetap responsif bahkan dengan banyak data tugas.
- **Desain Profesional:** Antarmuka yang bersih, modern, dan fungsional menggunakan `shadcn/ui` dan Tailwind CSS.

---

## Tahap 1: Fondasi & Struktur Dasar

Langkah pertama adalah membangun kerangka visual aplikasi kita.

1.  **Layout Utama:** Kita membagi antarmuka menjadi dua bagian utama:
    *   **Sidebar Kiri:** Berisi tabel yang menampilkan detail tugas seperti nama, tanggal mulai, dan tanggal selesai. Kita menggunakan komponen `<Table>` dari `shadcn/ui`.
    *   **Timeline Kanan:** Area utama tempat bar tugas akan digambar.

2.  **Manajemen Data Statis:** Awalnya, data tugas (tasks) dan anggota tim (team members) disimpan dalam file `data.ts`. Komponen `GanttChart` hanya membaca dan menampilkan data ini tanpa bisa mengubahnya. Ini adalah titik awal yang baik untuk memastikan tampilan data sudah benar.

3.  **Pengelolaan State Awal:** Kita memindahkan data tugas ke dalam *state* React menggunakan `useState`.
    *   **`const [allTasks, setAllTasks] = useState(initialTasksData);`**
    *   **Mengapa?** Ini adalah langkah **paling krusial** untuk semua interaktivitas. Dengan data berada di dalam *state*, kita bisa memodifikasinya sebagai respons terhadap aksi pengguna (seperti mengedit atau menyeret tugas), dan React akan secara otomatis me-render ulang tampilan untuk mencerminkan perubahan tersebut.

---

## Tahap 2: Membangun Timeline Dinamis

Setelah struktur dasar ada, kita fokus membuat timeline menjadi dinamis dan dapat dikontrol.

1.  **State untuk Skala Waktu:** Kita membuat *state* untuk mengontrol skala waktu.
    *   **`const [timeScale, setTimeScale] = useState("Month");`**
    *   Ini memungkinkan pengguna beralih antara tampilan "Day", "Week", "Month", dan "Year".

2.  **Kalkulasi Header Timeline:** Logika ini berada di dalam `useMemo` untuk efisiensi.
    *   Berdasarkan `timeScale` yang dipilih, kita menghitung rentang waktu total proyek (`interval`), lalu menghasilkan label untuk header primer (misal: "Januari 2025", "Februari 2025") dan header sekunder (misal: "Sen", "Sel", "Rab" atau "W1", "W2").
    *   `date-fns` adalah pustaka kunci di sini, digunakan untuk semua kalkulasi tanggal seperti `eachDayOfInterval`, `eachMonthOfInterval`, dll.

3.  **State untuk Zoom (Lebar Sel):**
    *   **`const [cellWidth, setCellWidth] = useState(40);`**
    *   Pengguna bisa mengubah nilai ini melalui komponen `<Slider>`. Mengubah `cellWidth` secara efektif memperbesar atau memperkecil tampilan timeline tanpa mengubah skala waktu.

4.  **Merender Bar Tugas:**
    *   Kita membuat dua fungsi penting: `getPositionFromDate` (mengubah tanggal menjadi posisi piksel) dan `getTaskPosition` (menggunakan fungsi sebelumnya untuk menghitung posisi `left` dan `width` dari setiap bar tugas).
    *   Setiap tugas kemudian di-loop dan dirender sebagai `<div>` yang diposisikan secara absolut di dalam area timeline.

---

## Tahap 3: Menambahkan Interaktivitas

Ini adalah tahap di mana Gantt Chart mulai terasa "hidup".

### A. Penyuntingan Langsung di Tabel (Inline Editing)

1.  **Komponen `EditableCell`:** Kita membuat komponen khusus ini.
    *   Komponen ini memiliki *state* internal `isEditing`.
    *   Saat pengguna mengklik dua kali (`onDoubleClick`), `isEditing` menjadi `true`, dan tampilan teks berubah menjadi elemen `<input>`.
    *   Input bisa berupa tipe `text` atau `date` untuk penanganan yang berbeda.
    *   Saat input kehilangan fokus (`onBlur`) atau pengguna menekan "Enter", callback `onSave` dipanggil untuk memperbarui *state* `allTasks`.

### B. Drag-and-Drop pada Timeline

1.  **State untuk Melacak Aksi:**
    *   **`const [draggingInfo, setDraggingInfo] = useState(null);`**
    *   *State* ini menyimpan objek yang berisi: tugas yang sedang di-drag, tipe aksi (`move`, `resize-start`, `resize-end`), dan posisi awal mouse.

2.  **Mekanisme Drag:**
    *   **`onMouseDown`:** Diterapkan pada bar tugas (untuk `move`) dan pada *handle* di ujung bar (untuk `resize`). Event ini mengisi `draggingInfo`.
    *   **Listener Global `mousemove`:** Saat `draggingInfo` aktif, sebuah *listener* ditambahkan ke `window`. Listener ini menghitung pergerakan mouse (`deltaX`).
    *   **Konversi Posisi ke Tanggal:** Posisi mouse yang baru diubah kembali menjadi objek `Date` menggunakan fungsi `getDateFromPosition`.
    *   **Pembaruan State Real-time:** State `allTasks` diperbarui saat mouse bergerak, memberikan umpan balik visual instan kepada pengguna.
    *   **`mouseup`:** Listener `mouseup` global akan mengosongkan `draggingInfo` untuk mengakhiri operasi.

### C. Pembuatan Dependensi Visual

1.  **State untuk Dependensi Baru:**
    *   **`const [newDependency, setNewDependency] = useState(null);`**
    *   *State* ini aktif saat pengguna mulai menarik garis dari sebuah *handle* dependensi.

2.  **Mekanisme Pembuatan:**
    *   **`onMouseDown` pada Dependency Handle:** Lingkaran kecil di ujung bar tugas memulai proses ini, mengisi *state* `newDependency`.
    *   **Garis Pratinjau (Preview Line):** Selama `newDependency` aktif, sebuah elemen `<line>` SVG digambar dari titik awal ke posisi kursor saat ini, memberikan umpan balik visual.
    *   **`onMouseUp` pada Handle Target:** Ketika mouse dilepaskan di atas *handle* tugas lain, fungsi `handleCreateDependency` dipanggil.
    *   **Validasi & Pembaruan:** Fungsi ini memvalidasi (mencegah dependensi duplikat/sirkular) dan kemudian memperbarui array `dependencies` pada tugas target di dalam *state* `allTasks`.
    *   **Gaya Garis Siku-siku:** Path SVG digambar menggunakan segmen garis lurus (bukan kurva) untuk menciptakan tampilan yang bersih dan profesional.

---

## Tahap 4: Fitur Analisis Proyek

Fitur-fitur ini memberikan wawasan lebih dalam tentang jadwal proyek.

### A. Kalkulasi Jalur Kritis (Critical Path Method - CPM)

-   **Lokasi:** Di dalam `useMemo` untuk `processedTasks` agar hanya dihitung ulang saat data tugas berubah.
-   **Algoritma:**
    1.  **Inisialisasi:** Semua tugas divalidasi dan durasinya dihitung.
    2.  **Forward Pass:** Iterasi dari awal proyek untuk menghitung **Earliest Start (ES)** dan **Earliest Finish (EF)** untuk setiap tugas. ES sebuah tugas ditentukan oleh EF maksimum dari semua tugas pendahulunya.
    3.  **Backward Pass:** Iterasi mundur dari akhir proyek untuk menghitung **Latest Start (LS)** dan **Latest Finish (LF)**. LF sebuah tugas ditentukan oleh LS minimum dari semua tugas penerusnya.
    4.  **Kalkulasi Slack (Float):** Dihitung dengan rumus `slack = LS - ES`.
    5.  **Identifikasi Jalur Kritis:** Tugas dengan `slack` mendekati nol (misal, `slack <= 1`) dianggap kritis dan diberi properti `isCritical: true`, yang kemudian digunakan untuk memberikan warna aksen (oranye).

### B. Perbandingan Rencana Awal (Baselines)

-   **Tombol "Set Baseline":** Sebuah tombol yang saat diklik, akan menyalin `startDate` dan `endDate` saat ini ke properti baru: `baselineStartDate` dan `baselineEndDate` untuk setiap tugas.
-   **Rendering Visual:**
    *   Di dalam timeline, jika sebuah tugas memiliki data *baseline*, sebuah `<div>` tambahan dirender.
    *   `div` ini diposisikan di bawah bar tugas utama dengan warna abu-abu (`bg-muted-foreground/50`) dan tinggi yang lebih kecil. Posisinya dihitung menggunakan tanggal *baseline*.
    *   Indikator deviasi (segitiga) ditambahkan untuk menunjukkan apakah tugas selesai lebih cepat atau lebih lambat dari rencana awal.

---

## Tahap 5: Penyempurnaan & Pengalaman Pengguna

Langkah terakhir adalah menyempurnakan interaksi dan menyediakan antarmuka yang lebih lengkap.

### Dialog Editor Tugas (`TaskEditorDialog.tsx`)

-   **Pemicu:** Dipicu oleh event `onDoubleClick` pada bar tugas, yang mengatur *state* `editingTask`.
-   **Struktur:** Menggunakan komponen `Dialog` dari `shadcn/ui` yang berisi `Tabs` untuk mengorganisir informasi. Ini memungkinkan perluasan di masa depan (misal: tab untuk sumber daya, komentar, dll.).
-   **Manajemen State Lokal:** Dialog ini memiliki *state* `editedTask` sendiri. Perubahan hanya disimpan ke *state* global (`allTasks`) saat pengguna mengklik tombol "Save", memungkinkan aksi "Cancel" yang aman.
-   **Fungsi Lengkap:** Menyediakan fungsionalitas **Save**, **Delete**, dan **Cancel** untuk manajemen tugas yang komprehensif dalam satu antarmuka terpusat.

Dengan menggabungkan semua tahapan ini, kita telah berhasil membangun sebuah komponen Gantt Chart yang tidak hanya menampilkan data, tetapi juga menjadi alat manajemen proyek yang sangat dinamis, interaktif, dan kaya fitur.