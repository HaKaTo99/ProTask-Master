# BluePrint: Membangun Gantt Chart Interaktif & Profesional di React

Dokumen ini berfungsi sebagai panduan teknis komprehensif untuk arsitektur dan implementasi komponen Gantt Chart yang canggih. Komponen ini dibangun menggunakan React, Next.js, TypeScript, `date-fns`, dan Tailwind CSS.

## 1. Visi & Fitur Utama

Tujuannya adalah menciptakan komponen Gantt Chart yang tidak hanya menampilkan data, tetapi juga berfungsi sebagai alat manajemen proyek yang dinamis dan interaktif.

- **Visualisasi Timeline & Hirarki:** Menampilkan tugas dalam struktur hirarkis (EPS, WBS, Activity) yang dapat diciutkan (`collapsible`).
- **Skala Waktu Dinamis:** Mendukung berbagai skala waktu (Hari, Minggu, Bulan, Tahun) dengan kemampuan zoom.
- **Kalkulasi Jalur Kritis:** Mengidentifikasi dan menyorot secara visual tugas-tugas yang krusial bagi penyelesaian proyek.
- **Interaktivitas Penuh:**
    - **Inline Editing:** Mengedit judul dan tanggal tugas langsung di tabel.
    - **Drag-and-Drop:** Menggeser (move) dan mengubah durasi (resize) bar tugas di timeline.
    - **Pembuatan Dependensi Visual:** Membuat hubungan antar tugas dengan menarik garis dari satu bar ke bar lainnya.
- **Visualisasi Baseline:** Membandingkan jadwal aktual dengan rencana awal (baseline) untuk analisis kinerja.
- **UI/UX Modern:** Desain yang bersih, responsif, dan profesional dengan `shadcn/ui`.
- **Dialog Editor Tugas:** Menyediakan antarmuka modal untuk pengeditan detail tugas yang komprehensif.

## 2. Arsitektur & State Management

### A. State Utama (`gantt/page.tsx`)

Komponen utama mengelola beberapa state krusial menggunakan hook `useState`:

- `allTasks`: `Task[]` - Menjadi satu-satunya sumber kebenaran (Single Source of Truth) untuk semua data tugas. Data ini dimuat ke dalam state agar bisa dimodifikasi secara dinamis.
- `collapsed`: `Set<string>` - Menyimpan ID dari tugas induk (WBS/EPS) yang sedang diciutkan untuk mengontrol visibilitas tugas anak.
- `timeScale`: `"Day" | "Week" | "Month" | "Year"` - Mengontrol unit waktu yang ditampilkan di header timeline.
- `cellWidth`: `number` - Mengatur lebar setiap sel di timeline, berfungsi sebagai mekanisme zoom.
- `draggingInfo`: `object | null` - Melacak state saat operasi drag-and-drop berlangsung (tugas yang di-drag, tipe aksi, posisi awal).
- `newDependency`: `object | null` - Melacak state saat pengguna sedang membuat garis dependensi baru.
- `editingTask`: `Task | null` - Mengontrol visibilitas dialog editor tugas dan menyimpan data tugas yang sedang diedit.

### B. Memoization untuk Performa (`useMemo`)

Kalkulasi yang berat dioptimalkan menggunakan `useMemo` untuk mencegah eksekusi ulang pada setiap render.

- `processedTasks`: Menggabungkan data tugas dengan data `assignee`, menghitung ulang tanggal mulai/selesai untuk tugas WBS/EPS berdasarkan anak-anaknya, dan **menghitung jalur kritis**.
- `tasks`: Memfilter `processedTasks` untuk hanya menampilkan tugas yang terlihat (tidak berada di bawah induk yang diciutkan).
- `interval`, `primaryHeader`, `secondaryHeader`: Menghitung rentang waktu dan label untuk header timeline berdasarkan `timeScale` dan `currentDate`.

## 3. Implementasi Fitur Kunci

### A. Kalkulasi Jalur Kritis (Critical Path Method)

- **Lokasi:** Di dalam `useMemo` untuk `processedTasks`.
- **Algoritma:**
    1.  **Inisialisasi:** Semua tugas di-filter untuk memastikan memiliki tanggal valid. Durasi setiap tugas dihitung.
    2.  **Forward Pass:** Iterasi dari awal proyek untuk menghitung **Earliest Start (ES)** dan **Earliest Finish (EF)** untuk setiap tugas. ES tugas ditentukan oleh EF maksimum dari semua tugas pendahulunya (dependencies).
    3.  **Backward Pass:** Iterasi dari akhir proyek (mundur) untuk menghitung **Latest Start (LS)** dan **Latest Finish (LF)**. LF tugas ditentukan oleh LS minimum dari semua tugas penerusnya.
    4.  **Kalkulasi Slack:** Dihitung dengan `slack = LS - ES`.
    5.  **Identifikasi Jalur Kritis:** Tugas dengan `slack <= 1` (toleransi kecil untuk pembulatan) dianggap sebagai bagian dari jalur kritis dan diberi properti `isCritical: true`.

### B. Interaktivitas Drag-and-Drop

- **State Management:** Menggunakan state `draggingInfo`.
- **Mekanisme:**
    1.  **`onMouseDown`:** Diterapkan pada bar tugas (untuk `move`) dan pada *handle* di ujung bar (untuk `resize-start` dan `resize-end`). Event ini mengisi state `draggingInfo` dengan detail tugas, tipe aksi, dan posisi awal mouse.
    2.  **`mousemove` Listener (Global):** Ditambahkan ke `window` saat `draggingInfo` aktif. Event ini menghitung `deltaX` dari pergerakan mouse.
    3.  **Konversi Posisi ke Tanggal:** Fungsi `getDateFromPosition` digunakan untuk mengubah posisi piksel mouse menjadi objek `Date` baru.
    4.  **Pembaruan State:** State `allTasks` diperbarui secara *real-time* saat mouse bergerak, memberikan umpan balik visual instan.
    5.  **`mouseup` Listener (Global):** Mengosongkan state `draggingInfo` untuk mengakhiri operasi.

### C. Pembuatan Dependensi Visual

- **State Management:** Menggunakan state `newDependency`.
- **Mekanisme:**
    1.  **`onMouseDown` pada Dependency Handle:** Lingkaran kecil di ujung bar tugas memiliki event ini. Ini akan mengisi state `newDependency` dengan ID tugas sumber dan posisi awal.
    2.  **Garis Pratinjau:** Selama `newDependency` aktif, sebuah elemen `<line>` SVG digambar dari titik awal ke posisi kursor mouse saat ini.
    3.  **`onMouseUp` pada Handle Target:** Ketika mouse dilepaskan di atas *handle* tugas lain yang valid, fungsi `handleCreateDependency` dipanggil.
    4.  **Validasi:** Fungsi ini melakukan validasi untuk mencegah dependensi duplikat atau dependensi sirkular.
    5.  **Pembaruan State:** Jika valid, ID tugas sumber ditambahkan ke array `dependencies` milik tugas target. Komponen akan me-render ulang dan menampilkan garis dependensi permanen yang baru.

### D. Inline Editing (`EditableCell`)

- **Komponen:** Sebuah komponen internal yang menerima `value` dan callback `onSave`.
- **Mekanisme:**
    1.  **State Lokal:** Komponen ini memiliki state internal `isEditing`.
    2.  **`onDoubleClick`:** Mengubah `isEditing` menjadi `true`, yang secara kondisional me-render elemen `<input>`.
    3.  **Tipe Input:** Komponen dapat menangani tipe data berbeda (misalnya, `text` atau `date`) untuk me-render input yang sesuai.
    4.  **`onBlur` atau `onKeyDown` (Enter):** Menyimpan perubahan dengan memanggil `onSave` dan mengubah `isEditing` kembali menjadi `false`.

### E. Visualisasi Baseline

- **Tombol "Set Baseline":** Sebuah `Button` yang saat diklik, mengiterasi semua tugas dan menyalin `startDate` dan `endDate` ke properti baru: `baselineStartDate` dan `baselineEndDate`.
- **Rendering:**
    - Di dalam `map` tugas pada timeline, jika `baselineStartDate` ada, sebuah `div` tambahan dirender.
    - `div` ini diposisikan secara absolut di bawah bar tugas utama dengan warna abu-abu (`bg-muted-foreground/50`).
    - Posisinya (`left`, `width`) dihitung menggunakan fungsi `getTaskPosition` yang sama, tetapi dengan menggunakan tanggal *baseline*.
    - Indikator deviasi (segitiga) ditampilkan untuk menunjukkan keterlambatan atau percepatan dari rencana awal.

### F. Dialog Editor Tugas (`TaskEditorDialog.tsx`)

- **Trigger:** Dipicu oleh event `onDoubleClick` pada bar tugas, yang mengatur state `editingTask`.
- **Struktur:** Menggunakan komponen `Dialog` dari `shadcn/ui` yang berisi `Tabs` untuk mengorganisir informasi.
- **State Lokal:** Dialog ini memiliki state `editedTask` sendiri, yang diinisialisasi dengan data dari prop `task`. Ini memungkinkan pengguna untuk membuat perubahan tanpa secara langsung memengaruhi state global hingga tombol "Save" diklik.
- **Fungsi:** Menyediakan tombol `Save`, `Delete`, dan `Cancel` untuk manajemen tugas yang komprehensif.

Dengan menggabungkan semua elemen ini, kita telah berhasil membangun komponen Gantt Chart yang sangat dinamis, interaktif, dan kaya fitur, setara dengan banyak solusi komersial.