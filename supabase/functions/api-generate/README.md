# API Generate - Edge Function

Edge function untuk generate gambar produk menggunakan API key authentication.

## Deployment

Deploy function ini ke Supabase:

```bash
supabase functions deploy api-generate
```

## Environment Variables

Pastikan environment variables berikut sudah di-set:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
KIE_AI_API_KEY=your_kie_ai_api_key
```

Set environment variables:

```bash
supabase secrets set KIE_AI_API_KEY=your_key_here
```

## Testing

Test function secara lokal:

```bash
supabase functions serve api-generate
```

Test dengan curl:

```bash
curl -X POST http://localhost:54321/functions/v1/api-generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: eak_your_test_key" \
  -d '{
    "imageUrl": "https://example.com/product.jpg",
    "enhancement": "add_female_model",
    "classification": "clothing"
  }'
```

## Authentication

Function ini menggunakan API key authentication melalui header `x-api-key`.

API key di-hash menggunakan SHA-256 dan diverifikasi dengan database.

## Rate Limiting

Rate limiting diterapkan berdasarkan subscription plan:
- Free: Tidak ada akses API
- Pro: 5 requests/menit, 100 generations/bulan
- Enterprise: 10 requests/menit, unlimited generations

## Error Handling

Function mengembalikan error codes berikut:
- 400: Bad request (missing parameters)
- 401: Unauthorized (invalid API key)
- 403: Forbidden (quota exceeded atau API key inactive)
- 429: Rate limit exceeded
- 500: Server error

## Monitoring

Monitor function logs:

```bash
supabase functions logs api-generate
```

## Security

- API keys di-hash sebelum disimpan di database
- Hanya service role key yang bisa akses database
- CORS headers dikonfigurasi untuk keamanan
- Rate limiting untuk mencegah abuse
