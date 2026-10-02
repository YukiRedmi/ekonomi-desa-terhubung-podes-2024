# Ekonomi Desa yang Terhubung

### Konektivitas Digital, Mobilitas, dan Infrastruktur Ekonomi Kabupaten/Kota Indonesia — Podes 2024

[![Data](https://img.shields.io/badge/Data-BPS%20Podes%202024-2563EB)](https://www.bps.go.id/id/publication/2024/12/10/2f5217e2d6a695a0830290a7/statistik-potensi-desa-indonesia-2024.html)
![Wilayah](https://img.shields.io/badge/Cakupan-514%20Kabupaten%2FKota-0F766E)
![Provinsi](https://img.shields.io/badge/Provinsi-38-D97706)
![Visualization](https://img.shields.io/badge/Visualization-Multivariate%20%7C%20Geospatial%20%7C%20Hierarchy-7C3AED)

**Live Dashboard:**  
https://yukiredmi.github.io/ekonomi-desa-terhubung-podes-2024/

**Repository:**  
https://github.com/YukiRedmi/ekonomi-desa-terhubung-podes-2024

---

## Ringkasan

**Ekonomi Desa yang Terhubung** adalah dashboard visualisasi data interaktif untuk mengeksplorasi variasi **konektivitas digital, mobilitas, dan infrastruktur ekonomi** pada 514 kabupaten/kota di Indonesia menggunakan **Statistik Potensi Desa Indonesia 2024 (Podes 2024)** dari Badan Pusat Statistik (BPS).

Dashboard tidak dimaksudkan untuk menghasilkan indeks pembangunan baru ataupun klasifikasi resmi daerah. Analisis dilakukan secara **deskriptif dan eksploratif** untuk membantu melihat:

1. pola multivariat antarindikator pada tingkat kabupaten/kota;
2. persebaran geografis indikator dan kelompok wilayah;
3. struktur perbedaan indikator dalam hirarki Indonesia → Provinsi → Kabupaten/Kota;
4. wilayah dengan profil multivariat yang relatif tidak biasa dibandingkan wilayah lainnya.

Proyek dikembangkan sebagai Ujian Akhir Semester mata kuliah **Visualisasi Data dan Informasi**, Program Studi Komputasi Statistik, Politeknik Statistika STIS.

---

## Pertanyaan Analisis

Dashboard dirancang untuk menjawab tiga pertanyaan utama:

1. **Bagaimana profil multivariat kabupaten/kota terbentuk dari indikator konektivitas digital, mobilitas, dan infrastruktur ekonomi?**
2. **Bagaimana pola tersebut tersebar secara geografis di Indonesia?**
3. **Bagaimana indikator tersebut bervariasi dalam struktur wilayah Indonesia → Provinsi → Kabupaten/Kota?**

---

## Cakupan Data

Dataset analisis terdiri atas:

| Komponen | Cakupan |
|---|---:|
| Kabupaten/kota | 514 |
| Provinsi | 38 |
| Unit administrasi desa/kelurahan Podes 2024 | 84.276 |
| Indikator utama | 8 |
| Observasi lengkap untuk PCA dan clustering | 509 |
| Wilayah teridentifikasi sebagai pencilan multivariat 99% | 25 |

Lima kabupaten/kota di DI Yogyakarta tidak memiliki nilai indikator transportasi yang diperlukan untuk analisis PCA delapan variabel karena tabel terkait tidak dipublikasikan pada sumber yang digunakan. Nilai yang tidak tersedia dipertahankan sebagai **missing value** dan tidak diimputasi menjadi nol.

---

## Indikator Utama

Semua indikator utama dinyatakan sebagai **persentase desa/kelurahan dalam suatu kabupaten/kota**.

| Domain | Indikator | Definisi ringkas |
|---|---|---|
| Digital | BTS | Persentase desa/kelurahan yang memiliki BTS |
| Digital | 4G/5G | Persentase desa/kelurahan dengan jaringan 4G/5G |
| Mobilitas | Angkutan umum | Persentase desa/kelurahan yang memiliki angkutan umum |
| Infrastruktur ekonomi | Akses pertokoan/pasar | Persentase desa/kelurahan yang memiliki akses pertokoan atau pasar |
| Infrastruktur ekonomi | Pasar permanen | Persentase desa/kelurahan yang memiliki pasar dengan bangunan permanen |
| Infrastruktur ekonomi | Akses bank | Persentase desa/kelurahan yang memiliki akses layanan bank |
| Infrastruktur ekonomi | KUR | Persentase desa/kelurahan yang memiliki akses/penerima Kredit Usaha Rakyat |
| Aktivitas ekonomi | Produk unggulan | Persentase desa/kelurahan yang memiliki produk unggulan |

Secara umum, indikator dihitung sebagai:

```text
persentase =
jumlah desa/kelurahan dengan karakteristik tertentu
--------------------------------------------------- × 100
             total desa/kelurahan
```

Untuk indikator yang pada publikasi disajikan dalam kategori *tidak ada*, digunakan komplemen terhadap total desa/kelurahan.

Definisi variabel lebih rinci tersedia pada:

`data/DATA_DICTIONARY.csv`

---

## Topik Visualisasi

Proyek mengimplementasikan tiga topik utama.

### 1. Visualisasi Data Berdimensi Tinggi / Multivariat

Analisis menggunakan **8 variabel numerik** pada tingkat kabupaten/kota.

Teknik yang digunakan:

- **Principal Component Analysis (PCA)** untuk reduksi dimensi;
- **parallel coordinates** untuk membandingkan profil indikator;
- **clustered heatmap** untuk melihat pola antarwilayah dan antarvariabel;
- **K-Means clustering** sebagai alat eksplorasi kelompok;
- **Mahalanobis distance** untuk mendeteksi profil multivariat yang tidak biasa;
- brushing, selection, dan linking antarvisual.

PCA dilakukan setelah standardisasi variabel menggunakan **z-score**.

Dua komponen pertama menjelaskan sekitar:

- **PC1: 53,87%**
- **PC2: 15,78%**
- **Kumulatif: 69,65%**

PC1 memiliki loading positif pada seluruh indikator utama dan secara umum dapat dibaca sebagai dimensi bersama dari konektivitas dan infrastruktur ekonomi. Interpretasi PCA tetap bersifat eksploratif dan tidak diperlakukan sebagai indeks pembangunan resmi.

---

### 2. Visualisasi Data Geospasial

Peta menggunakan unit analisis **kabupaten/kota**.

Dua representasi utama disediakan:

- **Choropleth map** untuk persentase desa/kelurahan;
- **Proportional symbol map** untuk jumlah desa/kelurahan.

Fitur interaktif meliputi:

- tooltip;
- pemilihan indikator;
- Natural Breaks (Jenks), Quantile, dan Equal Interval;
- zoom dan pan;
- layer cluster;
- layer pencilan;
- pemilihan wilayah;
- basemap Plain, Light, dan Satellite;
- legenda terpisah dari area peta.

Choropleth hanya menggunakan **nilai persentase**, bukan jumlah absolut, sehingga luas wilayah tidak disalahartikan sebagai besarnya fenomena.

---

### 3. Visualisasi Data Berhierarki

Struktur wilayah dibentuk dalam tiga tingkat:

```text
Indonesia
└── Provinsi
    └── Kabupaten/Kota
```

Dua teknik visualisasi digunakan:

- **Treemap**
- **Sunburst**

Encoding:

- **ukuran area** → jumlah desa/kelurahan;
- **warna** → nilai indikator aktif.

Interaksi meliputi:

- drill-down;
- breadcrumb;
- kembali satu level;
- reset ke Indonesia;
- linking dengan filter wilayah.

Dengan demikian, ukuran dan warna mewakili dua atribut yang berbeda.

---

## Analisis Multivariat

### Standardisasi

Delapan indikator memiliki rentang dan distribusi yang berbeda sehingga distandardisasi menggunakan:

```text
z = (x - mean) / standard deviation
```

Standardisasi dilakukan sebelum PCA, clustering, parallel coordinates, heatmap, dan penghitungan jarak multivariat.

### PCA

PCA digunakan untuk mereduksi delapan indikator ke dalam ruang dua dimensi sehingga kemiripan profil kabupaten/kota dapat dieksplorasi secara visual.

Arah tanda komponen PCA bersifat arbitrer. Untuk konsistensi interpretasi, orientasi PC1 disesuaikan sehingga loading mayoritas indikator bernilai positif.

### Clustering

K-Means dievaluasi untuk:

```text
k = 2, 3, ..., 8
```

Pemilihan `k = 3` didasarkan pada kombinasi evaluasi:

- silhouette score;
- Davies–Bouldin index;
- Calinski–Harabasz index;
- keterbacaan pola pada ruang PCA;
- interpretabilitas profil indikator.

Silhouette score untuk `k = 3` adalah sekitar **0,2945**, sehingga pemisahan kelompok diperlakukan sebagai **struktur eksploratif dengan separasi moderat**, bukan kelompok yang sepenuhnya terpisah.

Label interpretatif yang digunakan:

- **C1 — Relatif rendah lintas indikator**
- **C2 — Menengah / transisi**
- **C3 — Relatif tinggi lintas indikator**

Label tersebut merupakan ringkasan pola internal dataset dan **bukan klasifikasi resmi BPS**.

### Pencilan Multivariat

Pencilan dihitung menggunakan **Mahalanobis squared distance** pada delapan variabel terstandardisasi.

Ambang yang digunakan:

```text
Chi-square 99%
df = 8
D² ≈ 20,09
```

Sebanyak **25 kabupaten/kota** melewati ambang tersebut.

Pencilan tidak berarti data salah ataupun wilayah berkinerja buruk. Istilah tersebut hanya menunjukkan bahwa kombinasi delapan indikator suatu wilayah relatif tidak biasa dibandingkan distribusi multivariat keseluruhan.

---

## Interaktivitas dan Linking

Dashboard menyediakan:

- filter provinsi;
- filter kabupaten/kota;
- pemilihan indikator;
- filter cluster;
- filter pencilan;
- hover tooltip;
- PCA selection;
- brushing dan linking;
- zoom dan pan peta;
- pilihan layer;
- drill-down hierarchy;
- breadcrumb navigation;
- detail wilayah;
- perbandingan wilayah dengan provinsi dan nasional;
- perbandingan hingga tiga wilayah.

Interpretasi di bawah setiap visual diperbarui mengikuti filter atau wilayah yang sedang dipilih.

---

## Rancangan Visual

### Warna cluster

| Cluster | Warna |
|---|---|
| C1 | Biru `#0072B2` |
| C2 | Oranye `#E69F00` |
| C3 | Hijau `#009E73` |
| Pencilan | Magenta `#CC79A7` |

Palet dipilih untuk mempertahankan kontras antarkategori dan mengurangi ketergantungan pada kombinasi merah–hijau.

### Encoding

- **position** digunakan pada PCA dan grafik kuantitatif;
- **color** digunakan untuk kelompok dan intensitas indikator;
- **area** digunakan pada proportional symbol dan hierarchy;
- **outline/symbol** digunakan untuk pencilan agar informasi tidak hanya bergantung pada warna.

---

## Sumber Data

### Sumber utama

**Badan Pusat Statistik (BPS)**  
*Statistik Potensi Desa Indonesia 2024*

- Katalog: **1105014**
- Nomor publikasi: **04300.24002**
- Tahun data: **2024**
- Tanggal rilis: **10 Desember 2024**
- Tanggal akses: **2 Oktober 2026**

URL:

https://www.bps.go.id/id/publication/2024/12/10/2f5217e2d6a695a0830290a7/statistik-potensi-desa-indonesia-2024.html

Data utama proyek bersumber dari BPS.

---

## Batas Wilayah Digital

Batas administrasi kabupaten/kota digunakan sebagai data pendukung non-BPS.

Sumber:

**Indonesia-GeoJSON / Peta Nusa / Laravel Nusa**

https://github.com/AlfianAliM/Indonesia-GeoJSON

Referensi administratif:

**Kepmendagri No. 300.2.2-2138 Tahun 2025**

Penggabungan data Podes dengan polygon dilakukan melalui normalisasi nama wilayah dan telah diaudit menghasilkan:

```text
514 record Podes
514 polygon kabupaten/kota
514 wilayah berhasil dipasangkan
0 wilayah tidak terpasangkan
```

Kode yang berasal dari dataset boundary disimpan sebagai:

```text
boundary_code_prov
boundary_code_kab
```

Kode tersebut diperlakukan sebagai metadata boundary dan **tidak diklaim sebagai kode wilayah BPS**.

---

## Penanganan Missing Data

Missing value tidak secara otomatis dianggap sebagai nol.

Beberapa ketidaktersediaan data berasal dari perbedaan tabel atau kategori yang dipublikasikan pada publikasi provinsi, antara lain:

- DI Yogyakarta: komponen transportasi tertentu tidak tersedia untuk lima kabupaten/kota;
- Jawa Tengah: kategori tertentu terkait ketiadaan angkutan umum tidak dipublikasikan secara terpisah;
- Sulawesi Tengah: beberapa moda transportasi disajikan dalam kategori gabungan;
- Papua Barat: satu nilai pasar tanpa bangunan tidak tersedia;
- Papua Barat Daya: terdapat perbedaan cakupan kategori jaringan internet pada sumber.

Analisis PCA dan clustering hanya menggunakan observasi dengan delapan indikator utama lengkap.

---

## Struktur Repository

```text
ekonomi-desa-terhubung-podes-2024/
│
├── index.html
├── dashboard.js
├── styles.css
├── plotly.min.js
├── PODES_2024_DASHBOARD_FINAL.html
├── README.md
│
├── data/
│   ├── PODES_2024_DASHBOARD_DATA.csv
│   ├── PODES_2024_DASHBOARD_ANALYSIS.geojson
│   ├── PODES_2024_HIERARCHY_READY.json
│   ├── DATA_DICTIONARY.csv
│   ├── dashboard_records.json
│   ├── dashboard_geo.geojson
│   ├── dashboard_meta.json
│   └── analysis_podes_2024.py
│
└── docs/
    ├── DATA_PROVENANCE.md
    ├── UAS_COMPLIANCE.md
    ├── FINAL_QA_CHECKLIST.md
    ├── BROWSER_QA_FINAL.md
    └── FILE_MANIFEST_SHA256.txt
```

---

## Menjalankan Secara Lokal

### Python HTTP Server

Clone atau download repository, kemudian jalankan:

```bash
python run_local.py
```

Buka:

```text
http://127.0.0.1:8000/
```

Pada Windows:

```text
start_dashboard.bat
```

Pada Linux/macOS:

```bash
./start_dashboard.sh
```

### Single-file

File:

```text
PODES_2024_DASHBOARD_FINAL.html
```

dapat dibuka langsung menggunakan browser modern.

Mode **Satellite** membutuhkan koneksi internet karena menggunakan raster tile eksternal.

---

## Deployment

Dashboard dideploy sebagai static website menggunakan **GitHub Pages**.

URL:

https://yukiredmi.github.io/ekonomi-desa-terhubung-podes-2024/

Entry point aplikasi:

```text
index.html
```

Tidak diperlukan login maupun instalasi untuk mengakses dashboard yang telah dideploy.

---

## Reproducibility

Kode pengolahan dan data terolah disediakan dalam repository.

Script analisis:

```text
data/analysis_podes_2024.py
```

Data analisis:

```text
data/PODES_2024_DASHBOARD_DATA.csv
data/PODES_2024_DASHBOARD_ANALYSIS.geojson
data/PODES_2024_HIERARCHY_READY.json
```

Metadata dan definisi variabel:

```text
data/DATA_DICTIONARY.csv
data/dashboard_meta.json
```

Dokumentasi provenance:

```text
docs/DATA_PROVENANCE.md
```

Manifest checksum:

```text
docs/FILE_MANIFEST_SHA256.txt
```

---

## Kesesuaian dengan Ketentuan UAS

| Ketentuan | Implementasi |
|---|---|
| Minimal 3 topik visualisasi | Multivariat, Geospasial, Hierarki |
| Data utama dari BPS | Statistik Potensi Desa Indonesia 2024 |
| ≥8 variabel numerik | 8 indikator utama |
| ≥34 unit observasi | 514 kabupaten/kota |
| Reduksi dimensi | PCA |
| ≥2 teknik multivariat tambahan | Parallel coordinates dan clustered heatmap |
| Brushing & linking | Selection PCA dan linked views |
| Interpretasi kelompok/pencilan | K-Means + Mahalanobis distance |
| ≥3 level hierarchy | Indonesia → Provinsi → Kabupaten/Kota |
| ≥2 representasi hierarchy | Treemap dan Sunburst |
| Size & color berbeda | Desa/kelurahan sebagai size, indikator sebagai color |
| Drill-down + breadcrumb | Tersedia |
| Geospasial tingkat kab/kota | 514 kabupaten/kota |
| ≥2 jenis peta | Choropleth dan proportional symbol |
| Choropleth memakai rasio | Persentase desa/kelurahan |
| Klasifikasi peta | Jenks, Quantile, Equal Interval |
| Tooltip & legend | Tersedia |
| Zoom/pan | Tersedia |
| Kontrol layer | Cluster dan pencilan |
| Responsive | Desktop dan mobile |
| Public deployment | GitHub Pages |
| Public repository | GitHub |

---

## Batas Interpretasi

Beberapa batasan penting:

1. Analisis bersifat **deskriptif dan eksploratif**, bukan inferensial maupun kausal.
2. Persentase desa/kelurahan menggambarkan **cakupan unit wilayah**, bukan proporsi penduduk.
3. PCA merupakan transformasi matematis dan tidak secara otomatis memiliki interpretasi substantif tunggal.
4. Cluster K-Means bukan klasifikasi resmi dan sensitif terhadap pemilihan variabel, standardisasi, serta jumlah cluster.
5. Silhouette score menunjukkan separasi cluster yang moderat sehingga kelompok tidak boleh dianggap sebagai kelas yang terpisah secara absolut.
6. Pencilan Mahalanobis menunjukkan profil multivariat yang tidak biasa, bukan kesalahan data atau penilaian kualitas suatu daerah.
7. Beberapa variabel transportasi memiliki ketidaktersediaan data struktural pada wilayah tertentu.
8. Penggabungan polygon menggunakan normalisasi nama kabupaten/kota dan bukan kode BPS resmi.
9. Data menggambarkan kondisi yang tersedia pada **Podes 2024** dan tidak digunakan untuk menyimpulkan hubungan sebab-akibat.

---

## Integritas Akademik

Proyek ini dikembangkan untuk keperluan akademik pada mata kuliah **Visualisasi Data dan Informasi**.

Sumber data, referensi, serta sumber batas wilayah dicantumkan secara eksplisit. Penggunaan alat bantu berbasis AI dilakukan sebagai alat bantu dalam proses pengembangan dan tetap berada di bawah verifikasi serta tanggung jawab penyusun.

Deklarasi penggunaan AI secara formal juga dicantumkan pada bagian **Metodologi** makalah proyek.

---

## Teknologi

- HTML5
- CSS3
- JavaScript
- Plotly.js
- Python
- pandas
- NumPy
- scikit-learn
- SciPy
- GeoJSON
- GitHub Pages

---

## Dokumentasi Tambahan

- [`docs/DATA_PROVENANCE.md`](docs/DATA_PROVENANCE.md) — provenance dan alur data;
- [`docs/UAS_COMPLIANCE.md`](docs/UAS_COMPLIANCE.md) — pemetaan implementasi terhadap ketentuan UAS;
- [`docs/FINAL_QA_CHECKLIST.md`](docs/FINAL_QA_CHECKLIST.md) — pemeriksaan kualitas final;
- [`docs/BROWSER_QA_FINAL.md`](docs/BROWSER_QA_FINAL.md) — catatan pengujian browser;
- [`data/DATA_DICTIONARY.csv`](data/DATA_DICTIONARY.csv) — kamus data.

---

## Catatan

Dashboard ini bukan produk resmi Badan Pusat Statistik.

BPS digunakan sebagai **sumber utama data**, sedangkan analisis, pengolahan, interpretasi, dan rancangan visualisasi merupakan bagian dari proyek akademik.
