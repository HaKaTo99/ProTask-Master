# BluePrint: Membangun Gantt Chart Profesional di React

Dokumen ini berfungsi sebagai panduan teknis untuk membuat komponen Gantt Chart yang interaktif, modern, dan profesional menggunakan React, Next.js, TypeScript, dan Tailwind CSS.

## 1. Tujuan & Fitur Utama

- **Visualisasi Timeline Proyek:** Menampilkan tugas-tugas dalam sebuah timeline berdasarkan tanggal mulai dan selesai.
- **Tampilan Grid Terstruktur:** Membagi antarmuka menjadi dua bagian: daftar detail tugas di sisi kiri dan representasi visual (bilah tugas) di sisi kanan.
- **Visualisasi Dependensi:** Menggambarkan hubungan antar tugas menggunakan garis penghubung.
- **Indikator Progres:** Menampilkan kemajuan setiap tugas langsung pada bilah tugasnya.
- **Desain Responsif & Profesional:** Memastikan tampilan tetap fungsional dan menarik di berbagai ukuran layar.

## 2. Struktur Komponen (`GanttChart.tsx`)

Komponen utama akan dibagi menjadi beberapa bagian logis untuk kemudahan pengelolaan.

### A. Layout Utama

Layout dasar menggunakan **CSS Grid** untuk menciptakan dua kolom yang dapat di-scroll secara independen namun tetap sinkron secara vertikal.

```jsx
<div className="grid" style={{ gridTemplateColumns: "minmax(350px, 1.2fr) 2fr" }}>
  {/* Kolom Kiri: Detail Tugas */}
  <div>...</div>

  {/* Kolom Kanan: Timeline */}
  <div>...</div>
</div>
```

- **Kolom Kiri:** Memiliki lebar minimum `350px` dan dapat membesar (`1.2fr`).
- **Kolom Kanan:** Mengambil sisa ruang yang tersedia (`2fr`).

### B. State & Data Handling

- **Manajemen Waktu:** Gunakan library `date-fns` untuk semua operasi tanggal.
  - `startOfMonth`, `endOfMonth`: Menentukan rentang bulan yang ditampilkan.
  - `eachDayOfInterval`: Membuat array tanggal untuk header timeline.
  - `differenceInDays`: Menghitung durasi dan posisi tugas.
  - `parseISO`: Mengonversi string tanggal dari data menjadi objek `Date`.

- **Kalkulasi Posisi & Lebar Bilah Tugas:**
  Buat fungsi `getTaskPosition` untuk menghitung posisi (`left`) dan lebar (`width`) setiap bilah tugas dalam persentase.

  ```typescript
  const getTaskPosition = (taskStartDate: string, taskEndDate: string) => {
    // 1. Hitung selisih hari dari awal bulan ke tanggal mulai tugas.
    const startOffset = differenceInDays(parseISO(taskStartDate), monthStart);

    // 2. Hitung durasi tugas dalam hari.
    const duration = differenceInDays(parseISO(taskEndDate), parseISO(taskStartDate)) + 1;

    // 3. Konversi offset dan durasi menjadi persentase.
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return { left, width };
  };
  ```

## 3. Implementasi Detail Komponen

### A. Kolom Kiri: Tabel Tugas

Gunakan komponen `<Table>` dari ShadCN untuk menampilkan daftar tugas.

- **Struktur:** `Table`, `TableHeader`, `TableHead`, `TableBody`, `TableRow`, `TableCell`.
- **Header Tabel:** Buat header yang *sticky* (tetap terlihat saat di-scroll) dengan latar belakang blur untuk efek modern.
- **Isi Tabel:** Ulangi (map) data `tasks` untuk membuat baris tabel. Tampilkan `task.title`, `task.startDate`, dan `task.endDate`. Format tanggal menggunakan `format` dari `date-fns`.
- **Sinkronisasi Tinggi Baris:** Pastikan setiap `TableRow` memiliki tinggi yang sama dengan baris pada timeline (misalnya, `h-14` atau `56px`) agar tetap sejajar.

```jsx
<div className="border-r overflow-y-auto">
  <Table>
    <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
      <TableRow className="h-14">
        <TableHead>Task</TableHead>
        <TableHead>Start</TableHead>
        <TableHead>End</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {tasks.map((task) => (
        <TableRow key={task.id} className="h-14">
          {/* ... TableCell untuk setiap data ... */}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### B. Kolom Kanan: Timeline Visual

Ini adalah bagian paling kompleks, terdiri dari beberapa lapisan.

1.  **Container Timeline:**
    - Buat `div` yang memungkinkan scroll horizontal (`overflow-x-auto`).
    - Di dalamnya, buat `div` relatif dengan `minWidth` yang dihitung berdasarkan jumlah hari dikali lebar per hari (misal, `totalDays * 60px`).

2.  **Header Timeline (Tanggal):**
    - Gunakan CSS Grid untuk membuat kolom-kolom tanggal.
    - Buat header `sticky` agar tetap terlihat.
    - Ulangi (map) array `daysInMonth` untuk menampilkan nama hari (`E`) dan tanggal (`d`).

    ```jsx
    <div className="sticky top-0 z-20 grid bg-secondary/80 backdrop-blur-sm" style={{ gridTemplateColumns: `repeat(${totalDays}, 60px)` }}>
      {daysInMonth.map((day, i) => (
        <div key={i} className="h-14 flex flex-col items-center justify-center border-r border-b">
          <span className="text-xs">{format(day, 'E')}</span>
          <span className="font-bold text-lg">{format(day, 'd')}</span>
        </div>
      ))}
    </div>
    ```

3.  **Area Konten Timeline (Bilah Tugas & Dependensi):**
    - Buat `div` relatif dengan tinggi total yang dihitung dari jumlah tugas dikali tinggi baris (misal, `tasks.length * 56px`).
    - Lapisan ini akan menampung SVG untuk garis dependensi dan div untuk setiap bilah tugas.

4.  **Lapisan Garis Dependensi (SVG):**
    - Gunakan elemen `<svg>` yang absolut untuk menutupi seluruh area konten. Ini memastikan garis digambar di atas grid latar belakang tetapi di bawah bilah tugas.
    - Definisikan marker (`<marker>`) untuk ujung panah.
    - Ulangi (map) setiap tugas dan dependensinya. Untuk setiap dependensi, gambar elemen `<path>` dari tugas sumber ke tugas target.
    - Koordinat `d` pada path dihitung berdasarkan posisi X (waktu) dan Y (baris tugas) dari node sumber dan target.

5.  **Lapisan Bilah Tugas:**
    - Ulangi (map) data `tasks`.
    - Untuk setiap tugas, buat `div` yang diposisikan secara absolut berdasarkan `index` barisnya.
    - Di dalamnya, buat `div` lain yang mewakili bilah tugas. Gunakan `style={{ left, width }}` dari fungsi `getTaskPosition` untuk menempatkannya di timeline.
    - Terapkan warna berdasarkan prioritas tugas.
    - Tambahkan `div` di dalamnya untuk merepresentasikan progres tugas, dengan lebar yang dikontrol oleh `statusProgress`.

    ```jsx
    <div
      className="absolute h-8 top-1/2 -translate-y-1/2 flex items-center ..."
      style={{ left: `${left}%`, width: `${width}%`}}
    >
       <div className={`absolute inset-0 rounded-sm ${priorityColors[task.priority]}`}>
          {/* Indikator Progres */}
          <div
            className="absolute inset-y-0 left-0 bg-black/20"
            style={{ width: `${progress}%`}}
          ></div>
       </div>
       <span className="relative truncate text-white text-xs z-10 ml-2">{task.title}</span>
    </div>
    ```

## 4. Styling & Profesionalisme

- **Konsistensi Tinggi:** Pastikan tinggi baris (`ROW_HEIGHT_PX`) konsisten di seluruh komponen, baik di tabel kiri maupun di timeline kanan.
- **Warna Tematik:** Gunakan variabel warna dari `globals.css` (misalnya `hsl(var(--primary))`) agar konsisten dengan tema aplikasi.
- **Efek Hover:** Tambahkan transisi halus (`transition-all`, `duration-200`) untuk memberikan umpan balik visual saat berinteraksi dengan elemen.
- **Tipografi:** Gunakan ukuran dan ketebalan font yang sesuai untuk keterbacaan (misalnya, `font-bold` untuk judul, `text-muted-foreground` untuk teks sekunder).
- **Avatar:** Tampilkan avatar assignee di sebelah bilah tugas untuk memberikan konteks visual yang cepat.

Dengan mengikuti blueprint ini, Anda dapat membangun komponen Gantt Chart yang tidak hanya fungsional tetapi juga memiliki tampilan dan nuansa profesional seperti aplikasi-aplikasi modern.
