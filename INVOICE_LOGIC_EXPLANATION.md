# Invoice Generation Logic - Penjelasan Detail

## Format Invoice
```
INV/DDMMYYYY/XXXX

INV        = Prefix tetap
DDMMYYYY   = Tanggal (22122025 = 22 Dec 2025)
XXXX       = Sequence number (0001, 0002, 0003, ...)
```

## Logic Flow

### Step 1: Build Prefix Hari Ini
```sql
today_prefix := 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/';
```

**Contoh:**
- Hari ini (22 Dec 2025): `INV/22122025/`
- Besok (23 Dec 2025): `INV/23122025/`
- Lusa (24 Dec 2025): `INV/24122025/`

### Step 2: Cek Max Sequence untuk Hari Ini
```sql
SELECT MAX(sequence_number) 
FROM payments
WHERE invoice_no LIKE 'INV/22122025/%';
```

**Contoh:**
- Jika belum ada invoice hari ini → return `NULL`
- Jika ada `INV/22122025/0001` → return `1`
- Jika ada `INV/22122025/0005` → return `5`

### Step 3: Hitung Next Sequence
```sql
next_seq := COALESCE(max_seq, 0) + 1;
```

**Contoh:**
- `max_seq = NULL` → `next_seq = 0 + 1 = 1`
- `max_seq = 5` → `next_seq = 5 + 1 = 6`

### Step 4: Format dengan Padding
```sql
new_invoice := today_prefix || LPAD(next_seq::TEXT, 4, '0');
```

**Contoh:**
- `next_seq = 1` → `LPAD('1', 4, '0')` → `'0001'` → `INV/22122025/0001`
- `next_seq = 6` → `LPAD('6', 4, '0')` → `'0006'` → `INV/22122025/0006`
- `next_seq = 123` → `LPAD('123', 4, '0')` → `'0123'` → `INV/22122025/0123`

## Skenario Reset Harian

### Hari 1: 22 December 2025

**Prefix:** `INV/22122025/`

| Payment | Query Max | Max Result | Next Seq | Invoice Number |
|---------|-----------|------------|----------|----------------|
| 1       | `LIKE 'INV/22122025/%'` | NULL | 1 | `INV/22122025/0001` |
| 2       | `LIKE 'INV/22122025/%'` | 1 | 2 | `INV/22122025/0002` |
| 3       | `LIKE 'INV/22122025/%'` | 2 | 3 | `INV/22122025/0003` |
| 4       | `LIKE 'INV/22122025/%'` | 3 | 4 | `INV/22122025/0004` |

**Hasil akhir hari 1:**
```
INV/22122025/0001
INV/22122025/0002
INV/22122025/0003
INV/22122025/0004
```

---

### Hari 2: 23 December 2025 (RESET!)

**Prefix:** `INV/23122025/` ← **Prefix berubah!**

| Payment | Query Max | Max Result | Next Seq | Invoice Number |
|---------|-----------|------------|----------|----------------|
| 1       | `LIKE 'INV/23122025/%'` | NULL ← **Tidak ada invoice dengan prefix ini!** | 1 | `INV/23122025/0001` ← **Reset ke 0001** |
| 2       | `LIKE 'INV/23122025/%'` | 1 | 2 | `INV/23122025/0002` |
| 3       | `LIKE 'INV/23122025/%'` | 2 | 3 | `INV/23122025/0003` |

**Hasil akhir hari 2:**
```
INV/23122025/0001  ← Reset ke 0001
INV/23122025/0002
INV/23122025/0003
```

**Invoice hari 1 masih ada di database:**
```
INV/22122025/0001  ← Masih ada
INV/22122025/0002  ← Masih ada
INV/22122025/0003  ← Masih ada
INV/22122025/0004  ← Masih ada
```

---

### Hari 3: 24 December 2025 (RESET lagi!)

**Prefix:** `INV/24122025/` ← **Prefix berubah lagi!**

| Payment | Query Max | Max Result | Next Seq | Invoice Number |
|---------|-----------|------------|----------|----------------|
| 1       | `LIKE 'INV/24122025/%'` | NULL | 1 | `INV/24122025/0001` ← **Reset ke 0001 lagi** |
| 2       | `LIKE 'INV/24122025/%'` | 1 | 2 | `INV/24122025/0002` |

**Hasil akhir hari 3:**
```
INV/24122025/0001  ← Reset ke 0001 lagi
INV/24122025/0002
```

## Kenapa Reset Otomatis?

**Karena query `WHERE invoice_no LIKE 'INV/23122025/%'` hanya mencari invoice dengan prefix hari itu!**

```sql
-- Hari 1 (22 Dec): Cari invoice dengan prefix INV/22122025/
WHERE invoice_no LIKE 'INV/22122025/%'
-- Hasil: INV/22122025/0001, INV/22122025/0002, ...

-- Hari 2 (23 Dec): Cari invoice dengan prefix INV/23122025/
WHERE invoice_no LIKE 'INV/23122025/%'
-- Hasil: NULL (tidak ada invoice dengan prefix ini)
-- Maka mulai dari 0001 lagi!
```

## Advisory Lock (Mencegah Duplicate)

```sql
lock_key := ('x' || md5(CURRENT_DATE::TEXT))::bit(64)::bigint;
PERFORM pg_advisory_xact_lock(lock_key);
```

**Fungsi:**
- Mencegah 2 payment submit bersamaan mendapat invoice number yang sama
- Lock berdasarkan tanggal (1 lock per hari)
- Lock otomatis release setelah transaction selesai

**Contoh tanpa lock:**
```
Payment A: Query max → 5 → next = 6 → INV/22122025/0006
Payment B: Query max → 5 → next = 6 → INV/22122025/0006  ← DUPLICATE!
```

**Dengan lock:**
```
Payment A: Lock → Query max → 5 → next = 6 → INV/22122025/0006 → Unlock
Payment B: Wait lock → Lock → Query max → 6 → next = 7 → INV/22122025/0007 ✓
```

## Summary

✅ **Reset otomatis setiap hari** karena prefix berubah (DDMMYYYY)
✅ **Tidak perlu cron job** atau scheduled task
✅ **Tidak perlu manual reset** sequence
✅ **Advisory lock** mencegah duplicate saat concurrent insert
✅ **Format konsisten**: INV/DDMMYYYY/XXXX

## Testing

```sql
-- Test hari ini
SELECT generate_invoice_no();  -- INV/22122025/0001
SELECT generate_invoice_no();  -- INV/22122025/0002
SELECT generate_invoice_no();  -- INV/22122025/0003

-- Besok (manual test dengan mengubah CURRENT_DATE)
-- Akan otomatis reset ke INV/23122025/0001
```

## Kesimpulan

Logic ini **persis seperti requirement Anda**:
1. ✅ Cek `max(invoice_no) WHERE LIKE 'INV/22122025/%'`
2. ✅ Jika tidak ditemukan → return 0001
3. ✅ Jika ditemukan → return max + 1
4. ✅ Reset otomatis setiap hari karena prefix berubah
5. ✅ Advisory lock mencegah duplicate
