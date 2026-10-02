# UAS Compliance — Fase Visualisasi

## Tiga topik yang digunakan
1. Multivariat / high-dimensional data
2. Geospasial
3. Hierarki

## Multivariat
- 8 indikator numerik.
- 509 observasi lengkap (lebih dari minimum 34 unit).
- PCA sebagai reduksi dimensi.
- Parallel coordinates dan heatmap terklaster sebagai teknik tambahan.
- Brushing/linking melalui lasso PCA.
- Clustering KMeans k=3 dengan validasi dan catatan silhouette 0,2945.
- Pencilan multivariat menggunakan Mahalanobis D² pada ambang 99%.
- Interpretasi kelompok dan pencilan tersedia pada dashboard.

## Geospasial
- 514 kabupaten/kota.
- Choropleth berbasis rasio/persentase.
- Proportional symbol berbasis jumlah desa/kelurahan.
- Natural Breaks (Jenks), Quantile, dan Equal Interval.
- Tooltip, legenda, zoom, pan, layer, fit wilayah, dan reset nasional.
- Sumber batas wilayah dan audit join didokumentasikan.

## Hierarki
- Tiga tingkat: Indonesia → Provinsi → Kabupaten/Kota.
- Treemap dan sunburst.
- Size = jumlah desa/kelurahan.
- Color = indikator aktif.
- Drill-down, breadcrumb, kembali satu level, dan reset.

## Ketentuan visual umum
- Judul, unit, legenda, sumber, URL, dan tanggal akses dicantumkan.
- Palet dipilih agar mudah dibaca dan tidak bergantung pada merah–hijau.
- Nilai NA tidak dipaksakan menjadi nol.
- Interpretasi bersifat deskriptif/eksploratif dan tidak menyatakan kausalitas.
- Dashboard memiliki layout responsif.

## Belum termasuk fase ini
- Repository publik.
- Deployment publik.
- Paper IEEE.

Ketiga item tersebut merupakan tahap berikutnya setelah dashboard lokal final dibekukan.
