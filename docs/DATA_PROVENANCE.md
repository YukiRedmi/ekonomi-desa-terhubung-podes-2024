# Data Provenance

## Data utama
- Institusi: Badan Pusat Statistik (BPS)
- Publikasi: Statistik Potensi Desa Indonesia 2024
- Katalog: 1105014
- Nomor Publikasi: 04300.24002
- Rilis: 10 Desember 2024
- URL: https://www.bps.go.id/id/publication/2024/12/10/2f5217e2d6a695a0830290a7/statistik-potensi-desa-indonesia-2024.html
- Diakses: 2 Oktober 2026

## Batas wilayah
- Dataset: Indonesia-GeoJSON — kabupaten/kota
- Sumber yang didokumentasikan: Laravel Nusa / Peta Nusa
- Referensi: Kepmendagri No 300.2.2-2138 Tahun 2025
- URL: https://github.com/AlfianAliM/Indonesia-GeoJSON
- Dokumentasi: https://nusa.creasi.dev/en/api/regencies.html
- Diakses: 2 Oktober 2026

## Audit join
- 514 baris Podes
- 514 polygon kabupaten/kota
- 514 pasangan unik
- 0 wilayah Podes tidak cocok
- 0 polygon terpakai ganda

Join dilakukan melalui normalisasi nama kabupaten/kota. Kode pada dataset batas disimpan sebagai `boundary_code_prov` / `boundary_code_kab` dan tidak diklaim sebagai kode BPS tanpa verifikasi resmi untuk seluruh wilayah.

## Missing data
Nilai yang tidak tersedia tidak diubah menjadi nol. Lima kabupaten/kota DI Yogyakarta tidak masuk PCA/clustering karena indikator angkutan umum tidak tersedia/dapat dibandingkan pada struktur sumber yang digunakan.
