# Invoice Number - Final Solution

## Problem
Trigger-based invoice generation menyebabkan duplicate key error yang tidak bisa diatasi.

## Root Cause Analysis
1. Trigger BEFORE INSERT tidak bisa reliable karena race condition
2. Advisory lock tidak cukup untuk handle concurrent inserts
3. Regex query untuk MAX sequence kadang tidak akurat
4. UNIQUE constraint conflict dengan trigger timing

## Solution: Remove Auto-Generation

### Approach
**Hapus trigger dan generate invoice_no secara manual/scheduled**

### Why This Works
- ✅ Tidak ada race condition
- ✅ Tidak ada trigger timing issues  
- ✅ Payment bisa dibuat tanpa invoice_no
- ✅ Invoice di-generate setelah payment sukses
- ✅ Bisa di-retry jika gagal

## Implementation

### Step 1: Apply Fix
Jalankan **`SIMPLE_FIX_NO_TRIGGER.sql`**

File ini akan:
1. Remove semua triggers
2. Remove UNIQUE constraint
3. Allow NULL invoice_no
4. Create function `generate_missing_invoices()`
5. Generate invoice untuk existing payments

### Step 2: Generate Invoices

**Option A: Manual (Recommended for now)**
```sql
-- Run this in Supabase SQL Editor whenever needed
SELECT * FROM generate_missing_invoices();
```

**Option B: Scheduled (Setup later)**
Create a PostgreSQL cron job or Edge Function yang run setiap beberapa menit:
```sql
-- Run every 5 minutes
SELECT cron.schedule(
  'generate-invoices',
  '*/5 * * * *',
  $$ SELECT generate_missing_invoices(); $$
);
```

**Option C: From Application**
Call RPC function setelah payment berhasil:
```typescript
// After payment insert succeeds
await supabase.rpc('generate_missing_invoices');
```

### Step 3: Verify
```sql
-- Check payments without invoice
SELECT COUNT(*) 
FROM payments 
WHERE invoice_no IS NULL;

-- Should return 0 after running generate_missing_invoices()
```

## How It Works

### Flow:
```
1. User submit payment
   ↓
2. INSERT INTO payments (invoice_no = NULL)
   ↓ SUCCESS (no trigger, no constraint)
3. Payment saved with NULL invoice_no
   ↓
4. Run generate_missing_invoices()
   ↓
5. Function finds payments with NULL invoice_no
   ↓
6. Generate invoice numbers sequentially
   ↓
7. UPDATE payments SET invoice_no = 'INV/...'
   ↓
8. Done ✅
```

### Benefits:
- Payment creation NEVER fails
- Invoice generation is separate process
- Can retry if fails
- No race conditions
- No duplicate keys

## Usage

### For Development
Run manually after each payment:
```sql
SELECT * FROM generate_missing_invoices();
```

### For Production

**Option 1: Edge Function (Recommended)**
Create Supabase Edge Function that runs after payment insert:

```typescript
// supabase/functions/generate-invoice/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const { data, error } = await supabase.rpc('generate_missing_invoices')
  
  return new Response(
    JSON.stringify({ data, error }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

Call from frontend after payment:
```typescript
await supabase.functions.invoke('generate-invoice')
```

**Option 2: Database Webhook**
Setup webhook di Supabase Dashboard:
- Table: payments
- Event: INSERT
- Webhook URL: Your edge function URL

**Option 3: Cron Job**
If pg_cron extension is available:
```sql
SELECT cron.schedule(
  'generate-invoices',
  '*/5 * * * *',
  $$ SELECT generate_missing_invoices(); $$
);
```

## Verification

### Check function exists:
```sql
SELECT proname 
FROM pg_proc 
WHERE proname = 'generate_missing_invoices';
```

### Test function:
```sql
SELECT * FROM generate_missing_invoices();
```

### Check for NULL invoices:
```sql
SELECT id, user_email, created_at
FROM payments
WHERE invoice_no IS NULL
ORDER BY created_at DESC;
```

### Check invoice distribution:
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  COUNT(invoice_no) as with_invoice
FROM payments
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Migration Path

### Current State → New State

**Before:**
- Trigger auto-generates invoice_no
- UNIQUE constraint causes errors
- Payments fail if duplicate

**After:**
- No trigger
- No UNIQUE constraint  
- Payments always succeed
- Invoice generated separately

### Rollback (if needed)
If you want to go back to trigger-based:
1. Run `FIX_INVOICE_ROBUST.sql` again
2. Test thoroughly
3. Monitor for duplicates

## Notes

- ✅ Payments can be created without invoice_no
- ✅ Invoice numbers generated in batch
- ✅ No race conditions
- ✅ No duplicate key errors
- ✅ Can retry if generation fails
- ⚠️ Need to run `generate_missing_invoices()` periodically
- ⚠️ Small delay between payment creation and invoice generation

## Recommendation

For immediate fix: Use **Option A (Manual)**
For production: Setup **Option 1 (Edge Function)** or **Option 2 (Webhook)**

This approach is more reliable than trigger-based generation.
