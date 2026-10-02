# Ekonomi Desa yang Terhubung — FINAL FROZEN

**Konektivitas digital, mobilitas, dan infrastruktur ekonomi kabupaten/kota Indonesia — Podes 2024**

Status: **dashboard lokal final / frozen**. Folder ini adalah satu-satunya baseline yang digunakan untuk tahap repository, deployment, dan paper IEEE.

## Menjalankan dashboard
### Windows
Double-click `start_dashboard.bat`, atau jalankan:

```bat
cd /d C:\Users\yudha\Downloads\PODES_2024_DASHBOARD_FINAL
py run_local.py
```

Lalu buka:

`http://127.0.0.1:8000/index.html`

### Single-file
`PODES_2024_DASHBOARD_FINAL.html` dapat dibuka langsung di Chrome/Edge modern. Mode **Satellite** memerlukan koneksi internet karena menggunakan tile citra eksternal; mode **Plain** dan **Light** tidak memerlukan tile eksternal.

## Visualisasi final
- Ringkasan nasional/provinsi dan delapan indikator.
- PCA, KMeans cluster, parallel coordinates, clustered heatmap, brushing/linking.
- Choropleth dan proportional symbol map.
- Basemap **Plain / Light / Satellite** dengan legenda terpisah dari area peta.
- Treemap dan sunburst Indonesia → Provinsi → Kabupaten/Kota.
- Detail wilayah dan perbandingan wilayah–provinsi–nasional.
- Interpretasi interaktif tepat di bawah setiap visual.
- Filter provinsi, kabupaten/kota, indikator, cluster, dan pencilan.

## Sumber utama
**BPS — Statistik Potensi Desa Indonesia 2024**  
Katalog 1105014 · Nomor Publikasi 04300.24002 · Rilis 10 Desember 2024  
https://www.bps.go.id/id/publication/2024/12/10/2f5217e2d6a695a0830290a7/statistik-potensi-desa-indonesia-2024.html

## Batas wilayah
**Indonesia-GeoJSON / Laravel Nusa / Peta Nusa**  
Referensi: Kepmendagri No 300.2.2-2138 Tahun 2025  
https://github.com/AlfianAliM/Indonesia-GeoJSON

Join polygon dan data Podes telah diaudit 514/514 berdasarkan normalisasi nama kabupaten/kota. Kode boundary dipertahankan sebagai metadata boundary dan tidak diklaim sebagai kode BPS.

## Data final
- `data/PODES_2024_DASHBOARD_DATA.csv`
- `data/PODES_2024_DASHBOARD_ANALYSIS.geojson`
- `data/PODES_2024_HIERARCHY_READY.json`
- `data/DATA_DICTIONARY.csv`
- `data/dashboard_records.json`
- `data/dashboard_geo.geojson`
- `data/dashboard_meta.json`
- `data/analysis_podes_2024.py`

## Dokumentasi
- `docs/DATA_PROVENANCE.md`
- `docs/UAS_COMPLIANCE.md`
- `docs/FINAL_QA_CHECKLIST.md`
- `docs/BROWSER_QA_FINAL.md`
- `docs/FILE_MANIFEST_SHA256.txt`

## Batas interpretasi
Analisis bersifat deskriptif dan eksploratif. PCA/clustering bukan indeks atau klasifikasi resmi pembangunan. Pencilan menunjukkan profil multivariat yang tidak biasa, bukan kesalahan data atau penilaian kualitas wilayah.
