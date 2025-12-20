# Get Users List Edge Function

## Purpose
This edge function retrieves a list of all non-admin users with their email addresses for the admin panel.

## Features
- Fetches all users with `is_admin = false`
- Retrieves email addresses from auth.users using service role
- Requires admin authentication
- Returns user profiles with emails

## Authentication
- Requires valid JWT token in Authorization header
- Verifies user is admin before returning data

## Response Format
```json
{
  "users": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "subscription_plan": "free",
      "monthly_generate_limit": 3,
      "current_month_generates": 1,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "details": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: Admin access required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message",
  "stack": "Error stack trace"
}
```

## Deployment

### Deploy to Supabase
```bash
supabase functions deploy get-users-list
```

### Set Environment Variables
The function requires these environment variables (automatically available in Supabase):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Testing

### Using curl
```bash
curl -X POST https://your-project.supabase.co/functions/v1/get-users-list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Using JavaScript
```javascript
const { data, error } = await supabase.functions.invoke('get-users-list');

if (error) {
  console.error('Error:', error);
} else {
  console.log('Users:', data.users);
}
```

## Security
- Only accessible by admin users
- Uses service role key to access auth.users
- CORS enabled for web access
- Token validation on every request

## Fallback
If this function is not deployed or fails, the UserManagement component will:
1. Fetch profiles directly from the database
2. Display "Email not available" as placeholder
3. Show toast notification about the error

## Notes
- This function uses Supabase service role to access auth.users
- Email addresses are fetched individually for each user
- Performance: ~100ms per user (can be optimized with batch queries)
- Consider caching if user list is large (>100 users)
