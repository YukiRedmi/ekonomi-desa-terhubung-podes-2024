# Final QA Checklist — Fase Visualisasi Lokal

## Data
- [x] 514 kabupaten/kota, 38 provinsi, 84.276 desa/kelurahan.
- [x] 8 indikator utama.
- [x] 509 observasi lengkap untuk PCA/clustering.
- [x] Missing value dipertahankan sebagai NA.
- [x] 25 pencilan multivariat pada ambang 99%.

## Multivariat
- [x] PCA PC1–PC2.
- [x] PC1 53,87%; PC2 15,78%; kumulatif 69,65%.
- [x] KMeans k=3; silhouette 0,2945 dicantumkan sebagai separasi moderat.
- [x] Parallel coordinates.
- [x] Heatmap terklaster.
- [x] Lasso brushing & linking.
- [x] Interpretasi dinamis per grafik.

## Geospasial
- [x] 514 polygon kabupaten/kota.
- [x] Choropleth menggunakan persentase.
- [x] Proportional symbol menggunakan jumlah.
- [x] Jenks / Quantile / Equal Interval.
- [x] Tooltip, zoom, pan, layer, fit, reset.
- [x] Sumber boundary dan join audit didokumentasikan.
- [x] Boundary code tidak diklaim sebagai kode BPS.

## Hierarki
- [x] Indonesia → Provinsi → Kabupaten/Kota.
- [x] Treemap + Sunburst.
- [x] Size dan color menggunakan variabel berbeda.
- [x] Drill-down, breadcrumb, satu level, reset.

## Penyajian
- [x] Sumber BPS pada setiap visual.
- [x] URL resmi dan tanggal akses.
- [x] Sumber batas wilayah.
- [x] Terminologi konsisten.
- [x] Cluster tidak disebut klasifikasi resmi pembangunan.
- [x] Interpretasi tidak kausal.
- [x] Palet ramah buta warna.
- [x] Layout responsif.

## Status
Fase visualisasi lokal: FINAL / FROZEN.
Tahap berikutnya: repository publik, deployment, dan paper IEEE.

## Revisi peta final
- [x] Peta ditempatkan pada card/frame khusus.
- [x] Legend warna/simbol dipisahkan dari area peta.
- [x] Basemap Plain / Light / Satellite tersedia.
- [x] Light menggunakan canvas biru muda tanpa watermark/tile eksternal.
- [x] Satellite merupakan opsi dan memerlukan koneksi internet.
