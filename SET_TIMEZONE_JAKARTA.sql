-- =====================================================
-- SET DATABASE TIMEZONE TO ASIA/JAKARTA (WIB/UTC+7)
-- =====================================================

-- Cara 1: Set timezone untuk session saat ini
SET timezone = 'Asia/Jakarta';

-- Cara 2: Set timezone default untuk database (PERMANENT)
-- Jalankan sebagai superuser/admin
ALTER DATABASE postgres SET timezone TO 'Asia/Jakarta';

-- Cara 3: Set timezone untuk role/user tertentu
-- ALTER ROLE postgres SET timezone TO 'Asia/Jakarta';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test 1: Check current timezone setting
SHOW timezone;

-- Test 2: Compare dates
SELECT 
  'Before timezone change' as note,
  now() as current_timestamp,
  CURRENT_DATE as current_date,
  CURRENT_TIME as current_time;

-- Set timezone untuk session ini
SET timezone = 'Asia/Jakarta';

SELECT 
  'After timezone change' as note,
  now() as current_timestamp,
  CURRENT_DATE as current_date,
  CURRENT_TIME as current_time;

-- Test 3: Verify CURRENT_DATE now shows correct date
DO $$
DECLARE
  current_date_str TEXT;
BEGIN
  current_date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  RAISE NOTICE '=== TIMEZONE VERIFICATION ===';
  RAISE NOTICE 'Current timezone: %', current_setting('timezone');
  RAISE NOTICE 'Current date: %', CURRENT_DATE;
  RAISE NOTICE 'Date format: %', current_date_str;
  RAISE NOTICE 'Current time: %', CURRENT_TIME;
  RAISE NOTICE 'Current timestamp: %', now();
END $$;

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================

/*
CATATAN PENTING:

1. SET timezone = 'Asia/Jakarta'
   - Hanya berlaku untuk session saat ini
   - Akan reset setiap kali reconnect
   
2. ALTER DATABASE postgres SET timezone TO 'Asia/Jakarta'
   - PERMANENT untuk semua connection baru
   - Perlu reconnect untuk apply
   - Ini yang RECOMMENDED!
   
3. Setelah set timezone, CURRENT_DATE akan otomatis menggunakan WIB
   - Tidak perlu lagi pakai timezone('Asia/Jakarta', now())
   - Lebih simple dan konsisten
   
4. Untuk Supabase:
   - Jalankan ALTER DATABASE di SQL Editor
   - Atau set di Dashboard > Settings > Database
   - Semua function akan otomatis pakai timezone baru

NEXT STEPS:
1. Jalankan: ALTER DATABASE postgres SET timezone TO 'Asia/Jakarta';
2. Reconnect ke database
3. Verify dengan: SHOW timezone;
4. Test dengan: SELECT CURRENT_DATE;
5. Seharusnya sudah menampilkan tanggal WIB yang benar
*/
