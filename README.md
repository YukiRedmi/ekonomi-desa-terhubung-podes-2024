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
| Infrastruktur ekonomi | KUR | Persentase desa/kelurahan yang memiliki penerima/akses Kredit Usaha Rakyat |
| Aktivitas ekonomi | Produk unggulan | Persentase desa/kelurahan yang memiliki produk unggulan |

Secara umum, indikator dihitung sebagai:

```text
persentase = jumlah desa/kelurahan dengan karakteristik tertentu
             --------------------------------------------------- × 100
                       total desa/kelurahan
