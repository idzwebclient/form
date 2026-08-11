# Menambah borang baharu

Setiap borang diletakkan dalam folder sendiri di bawah `forms/` supaya logik,
konfigurasi, jenis data, format nombor dan gaya tidak bercampur dengan borang
lain.

Struktur yang disyorkan:

```text
forms/
  advance-form/
    AdvanceForm.tsx
    config.ts
    types.ts
    formatters.ts
    styles.css
  claim-form/
    ClaimForm.tsx
    config.ts
    types.ts
    formatters.ts
    styles.css
  nama-borang/
    NamaBorang.tsx
    config.ts
    types.ts
    formatters.ts
    styles.css
public/
  forms/nama-borang/
```

Untuk menambah borang:

1. Salin struktur `branch-purchase/` dan ubah `config.ts`.
2. Letakkan aset tetap dalam `public/forms/nama-borang/`.
3. Buat route baharu seperti `app/nama-borang/page.tsx` yang mengimport komponen
   utama borang tersebut.
4. Import `styles.css` borang baharu melalui `app/globals.css`.
5. Tambah nama dan route sekali sahaja dalam `forms/registry.ts` supaya borang
   muncul dalam menu borang pada semua halaman.

Had row, istilah paparan, kunci localStorage dan path aset setiap borang dikawal
melalui fail `config.ts` dalam folder borang masing-masing. Borang sedia ada:

- `/` - Branch Purchase Form
- `/claim-form` - Reimbursement Claim Form
- `/advance-form` - Salary / Commission Advance Form
