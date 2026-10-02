# Browser QA Final

## Cakupan pengujian
Dashboard final diuji menggunakan Chromium headless dengan viewport:
- 1440 × 900 (desktop Chrome-compatible)
- 1920 × 1080 (desktop Edge-compatible user agent)
- 390 × 844 (mobile)
- 430 × 932 (mobile)

## Hasil
- Tidak ditemukan horizontal overflow pada seluruh viewport yang diuji.
- Overview berhasil dirender.
- PCA, parallel coordinates, dan heatmap berhasil dibuat.
- Struktur wilayah (treemap/sunburst) berhasil dibuat.
- Halaman Metodologi memuat 11 bagian.
- Kontrol peta, legend terpisah, selector basemap, serta tombol zoom terdeteksi dan merespons state.
- Mode Light menggunakan canvas biru muda lokal dan tidak membutuhkan tile eksternal.
- Mode Satellite tetap membutuhkan koneksi internet karena menggunakan tile citra eksternal.

## Catatan lingkungan pengujian
Renderer Mapbox/Plotly Mapbox membutuhkan WebGL. Chromium headless pada environment pengujian ini tidak menyediakan konteks WebGL, sehingga renderer peta memunculkan `Failed to initialize WebGL` pada mode headless. Ini merupakan keterbatasan environment pengujian, bukan error sintaks JavaScript atau data. Struktur trace, state, selector basemap, legend, dan kontrol zoom tetap berhasil dibuat.

Microsoft Edge binary tidak tersedia pada environment pengujian. Compatibility check Edge dilakukan memakai user-agent Edge pada Chromium engine.

## Status
**PASS WITH HEADLESS-WEBGL LIMITATION**

Untuk pemeriksaan visual akhir peta, paket final tetap perlu dibuka sekali pada Chrome/Edge desktop nyata yang menyediakan WebGL.
