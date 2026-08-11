# Qudani Branch Purchase Form

Dashboard lokal untuk mengisi halaman pertama borang belian cawangan dan mencetak dokumen PDF dua halaman. Halaman kedua disertakan secara automatik dan tidak boleh diedit.

## Keperluan

- Node.js 22.13 atau lebih baharu
- npm 10 atau lebih baharu

Projek ini tidak menggunakan login, Supabase, pangkalan data, fail `.env`, atau servis luar.

## Buka projek

Arahan yang sama digunakan pada macOS, Windows dan Linux:

```bash
npm install
npm run dev
```

Buka alamat `Local` yang dipaparkan dalam terminal.

## Hasilkan PDF

1. Isi maklumat cawangan, runner dan item emas.
2. Tekan **Cetak / Simpan PDF**.
3. Pilih **Save as PDF** atau pencetak fizikal.
4. Gunakan orientasi **Landscape** dan skala **100%** jika dialog cetakan tidak memilihnya secara automatik.

Data draf disimpan hanya dalam browser pada komputer yang sedang digunakan. Untuk memindahkan projek ke komputer lain, pindahkan folder projek tanpa `node_modules`, kemudian jalankan `npm install` pada komputer tersebut.

## Struktur projek

```text
app/                         # Route dan layout aplikasi
forms/
  branch-purchase/           # Semua kod borang pembelian cawangan
    BranchPurchaseForm.tsx
    config.ts                # Istilah, had dan path aset
    formatters.ts            # Format RM, berat dan nombor
    types.ts                 # Bentuk data borang
    styles.css               # UI dashboard serta cetakan
public/
  brand/                     # Logo aktif
  forms/branch-purchase/     # Aset tetap borang
```

Panduan ringkas untuk menambah borang lain tersedia dalam `forms/README.md`.

## Semakan produksi

```bash
npm run build
npm run lint
```
# form
# form
