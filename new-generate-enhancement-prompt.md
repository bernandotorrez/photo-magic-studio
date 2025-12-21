# Prompt: Membuat Menu Generate Enhancement Baru

## Konteks
Saya ingin menambahkan menu/fitur generate enhancement baru ke dalam aplikasi. Fitur ini harus terintegrasi penuh dengan sistem yang sudah ada, termasuk API, database, frontend, dan dokumentasi.

## Nama Fitur Baru
**[NAMA_FITUR]** - contoh: "Hair Style", "Makeup Artist", "Tattoo Design", dll.

## Kategori Enhancement
**[KATEGORI]** - contoh: "beauty", "fashion", "interior", "food", dll.

## Deskripsi Fitur
[Jelaskan secara detail apa yang dilakukan fitur ini, misalnya: "Fitur untuk mengubah gaya rambut pada foto dengan berbagai pilihan model rambut modern"]

---

## Checklist Implementasi Lengkap

### 1. DATABASE SETUP

#### A. Tambahkan Enhancement Options ke Database
Buat file SQL: `RUN_THIS_SQL_[NAMA_FITUR]_ENHANCEMENTS.sql`

```sql
-- Tambahkan kategori enhancement baru
INSERT INTO enhancement_categories (name, description, icon, sort_order, is_active)
VALUES (
  '[kategori]',
  '[Deskripsi kategori]',
  '[icon-name]',
  [urutan],
  true
);

-- Tambahkan enhancement options
INSERT INTO enhancement_options (
  category_id,
  name,
  description,
  preview_image_url,
  is_active,
  sort_order,
  is_featured
)
SELECT 
  id,
  '[Nama Enhancement 1]',
  '[Deskripsi enhancement 1]',
  '[URL preview image 1]',
  true,
  1,
  false
FROM enhancement_categories WHERE name = '[kategori]'
UNION ALL
SELECT 
  id,
  '[Nama Enhancement 2]',
  '[Deskripsi enhancement 2]',
  '[URL preview image 2]',
  true,
  2,
  true
FROM enhancement_categories WHERE name = '[kategori]';
-- Tambahkan lebih banyak enhancement sesuai kebutuhan
```

#### B. Tambahkan System Prompts
```sql
-- Tambahkan system prompts untuk setiap enhancement
INSERT INTO enhancement_prompts (enhancement_option_id, prompt_text, is_active)
SELECT 
  eo.id,
  '[Prompt AI untuk enhancement ini - jelaskan detail apa yang harus dilakukan AI]',
  true
FROM enhancement_options eo
JOIN enhancement_categories ec ON eo.category_id = ec.id
WHERE ec.name = '[kategori]' AND eo.name = '[Nama Enhancement 1]';

-- Ulangi untuk setiap enhancement option
```

---

### 2. API CLASSIFY FUNCTION

Buat file baru: `supabase/functions/classify-[nama-fitur]/index.ts`

**Template:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { image } = await req.json();

    if (!image) {
      throw new Error("Image is required");
    }

    // Fetch enhancement options untuk kategori ini
    const { data: enhancements, error: enhancementsError } = await supabaseClient
      .from("enhancement_options")
      .select(`
        id,
        name,
        description,
        preview_image_url,
        enhancement_categories!inner(name)
      `)
      .eq("enhancement_categories.name", "[kategori]")
      .eq("is_active", true)
      .order("sort_order");

    if (enhancementsError) {
      throw enhancementsError;
    }

    // TODO: Implementasi logika klasifikasi AI jika diperlukan
    // Untuk sementara, return semua enhancement options yang tersedia

    return new Response(
      JSON.stringify({
        success: true,
        enhancements: enhancements || [],
        message: "Classification successful"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in classify-[nama-fitur]:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

**Deploy command:**
```bash
supabase functions deploy classify-[nama-fitur]
```

---

### 3. UPDATE API GENERATE

Edit file: `supabase/functions/api-generate/index.ts`

**Tambahkan case baru di switch statement:**

```typescript
case "[kategori]":
  // Validasi enhancement_id
  if (!enhancement_id) {
    throw new Error("enhancement_id is required for [kategori] generation");
  }

  // Fetch enhancement details dan prompt
  const { data: [kategori]Enhancement, error: [kategori]Error } = await supabaseClient
    .from("enhancement_options")
    .select(`
      id,
      name,
      description,
      enhancement_prompts(prompt_text, is_active),
      enhancement_categories!inner(name)
    `)
    .eq("id", enhancement_id)
    .eq("enhancement_categories.name", "[kategori]")
    .eq("is_active", true)
    .single();

  if ([kategori]Error || ![kategori]Enhancement) {
    throw new Error("Invalid enhancement option for [kategori]");
  }

  // Get active prompt
  const activePrompt = [kategori]Enhancement.enhancement_prompts?.find(
    (p: any) => p.is_active
  );

  if (!activePrompt) {
    throw new Error("No active prompt found for this enhancement");
  }

  // Set prompt untuk KIE AI
  systemPrompt = activePrompt.prompt_text;
  userPrompt = `Apply ${[kategori]Enhancement.name} enhancement to this image. ${[kategori]Enhancement.description}`;
  
  break;
```

---

### 4. FRONTEND - HALAMAN BARU

Buat file: `src/pages/[NamaFitur].tsx`

**Template:**
```typescript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import EnhancementSelector from "@/components/EnhancementSelector";
import GenerationResult from "@/components/GenerationResult";
import { Loader2 } from "lucide-react";

interface Enhancement {
  id: string;
  name: string;
  description: string;
  preview_image_url: string;
}

const [NamaFitur] = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [selectedEnhancement, setSelectedEnhancement] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication dan fetch user tokens
  useEffect(() => {
    checkAuth();
    fetchUserTokens();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchUserTokens = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("tokens")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserTokens(profile.tokens || 0);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
  };

  const handleImageUpload = async (imageData: string) => {
    setUploadedImage(imageData);
    setEnhancements([]);
    setSelectedEnhancement(null);
    setGeneratedImage(null);
    
    // Auto-classify untuk mendapatkan enhancement options
    await classifyImage(imageData);
  };

  const classifyImage = async (imageData: string) => {
    setIsClassifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("classify-[nama-fitur]", {
        body: { image: imageData },
      });

      if (response.error) throw response.error;

      if (response.data?.enhancements) {
        setEnhancements(response.data.enhancements);
      }
    } catch (error: any) {
      toast({
        title: "Classification Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedEnhancement) {
      toast({
        title: "Missing Information",
        description: "Please upload an image and select an enhancement",
        variant: "destructive",
      });
      return;
    }

    if (userTokens < 1) {
      toast({
        title: "Insufficient Tokens",
        description: "You need at least 1 token to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("api-generate", {
        body: {
          image: uploadedImage,
          category: "[kategori]",
          enhancement_id: selectedEnhancement,
        },
      });

      if (response.error) throw response.error;

      if (response.data?.generated_image) {
        setGeneratedImage(response.data.generated_image);
        await fetchUserTokens(); // Refresh token count
        
        toast({
          title: "Success!",
          description: "Image generated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Generation Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">[Nama Fitur]</h1>
          <p className="text-muted-foreground">
            [Deskripsi singkat fitur ini]
          </p>
          <div className="mt-4 text-sm">
            <span className="font-semibold">Your Tokens:</span> {userTokens}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <ImageUpload
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
            />
          </div>

          {/* Enhancement Selection */}
          <div>
            {isClassifying ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : enhancements.length > 0 ? (
              <EnhancementSelector
                enhancements={enhancements}
                selectedEnhancement={selectedEnhancement}
                onSelect={setSelectedEnhancement}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            ) : uploadedImage ? (
              <div className="text-center text-muted-foreground">
                No enhancements available
              </div>
            ) : null}
          </div>
        </div>

        {/* Result Section */}
        {generatedImage && (
          <div className="mt-8">
            <GenerationResult
              originalImage={uploadedImage}
              generatedImage={generatedImage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default [NamaFitur];
```

---

### 5. ROUTING

Edit file: `src/App.tsx` atau routing file

**Tambahkan route:**
```typescript
import [NamaFitur] from "@/pages/[NamaFitur]";

// Di dalam Routes
<Route path="/[nama-fitur]" element={<[NamaFitur] />} />
```

---

### 6. NAVIGATION MENU

Edit file: `src/components/Navbar.tsx` atau navigation component

**Tambahkan menu item:**
```typescript
{
  name: "[Nama Fitur]",
  path: "/[nama-fitur]",
  icon: [IconComponent],
  description: "[Deskripsi singkat]"
}
```

---

### 7. DOKUMENTASI API

Buat file: `API_[NAMA_FITUR]_DOCUMENTATION.md`

**Template:**
```markdown
# [Nama Fitur] API Documentation

## Overview
[Deskripsi fitur dan use case]

## Endpoints

### 1. Classify [Nama Fitur]
**Endpoint:** `/functions/v1/classify-[nama-fitur]`
**Method:** POST
**Auth:** Required (Bearer token)

**Request Body:**
\`\`\`json
{
  "image": "base64_encoded_image_string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "enhancements": [
    {
      "id": "uuid",
      "name": "Enhancement Name",
      "description": "Description",
      "preview_image_url": "url"
    }
  ]
}
\`\`\`

### 2. Generate [Nama Fitur]
**Endpoint:** `/functions/v1/api-generate`
**Method:** POST
**Auth:** Required (Bearer token)

**Request Body:**
\`\`\`json
{
  "image": "base64_encoded_image_string",
  "category": "[kategori]",
  "enhancement_id": "uuid"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "generated_image": "base64_encoded_result",
  "tokens_used": 1,
  "remaining_tokens": 99
}
\`\`\`

## Error Handling
[Dokumentasi error codes dan handling]

## Rate Limits
[Informasi rate limiting jika ada]

## Examples
[Contoh penggunaan dengan curl atau JavaScript]
\`\`\`

---

### 8. ADMIN PANEL UPDATE

Edit file: `src/components/admin/EnhancementPromptsManager.tsx`

**Pastikan admin bisa manage enhancement baru:**
- Filter berdasarkan kategori baru
- Edit prompts untuk enhancement baru
- Toggle active/inactive status

---

### 9. TESTING CHECKLIST

#### Manual Testing:
- [ ] Upload image berhasil
- [ ] Classify API mengembalikan enhancement options
- [ ] Enhancement selection berfungsi
- [ ] Generate API menghasilkan image
- [ ] Token terdeduct dengan benar
- [ ] Error handling berfungsi (insufficient tokens, invalid image, dll)
- [ ] Responsive design di mobile
- [ ] Navigation menu menampilkan fitur baru
- [ ] Admin panel bisa manage enhancement baru

#### Database Testing:
```sql
-- Test query enhancement options
SELECT 
  ec.name as category,
  eo.name as enhancement,
  eo.is_active,
  ep.prompt_text
FROM enhancement_options eo
JOIN enhancement_categories ec ON eo.category_id = ec.id
LEFT JOIN enhancement_prompts ep ON ep.enhancement_option_id = eo.id
WHERE ec.name = '[kategori]';
```

---

### 10. DEPLOYMENT CHECKLIST

- [ ] Run SQL migration di production database
- [ ] Deploy classify function: `supabase functions deploy classify-[nama-fitur]`
- [ ] Deploy updated api-generate function
- [ ] Test di staging environment
- [ ] Update environment variables jika diperlukan
- [ ] Deploy frontend ke production
- [ ] Update API documentation
- [ ] Announce new feature ke users

---

## Contoh Implementasi Lengkap

### Contoh: Hair Style Enhancement

**Kategori:** beauty
**Nama Fitur:** Hair Style
**Deskripsi:** Transform your hairstyle with AI-powered hair styling options

**Enhancement Options:**
1. Long Wavy Hair - Elegant long wavy hairstyle
2. Short Bob Cut - Modern short bob haircut
3. Curly Afro - Natural curly afro style
4. Sleek Straight - Smooth straight hair
5. Messy Bun - Casual messy bun style

**System Prompts:**
- "Transform the person's hairstyle to long wavy hair while maintaining facial features and natural look"
- "Apply a modern short bob haircut while preserving the person's face and natural appearance"
- etc.

---

## Notes & Best Practices

1. **Token Management:** Pastikan setiap generate mendeduct 1 token
2. **Image Validation:** Validate image size dan format sebelum processing
3. **Error Messages:** Berikan error messages yang jelas dan helpful
4. **Loading States:** Tampilkan loading indicators saat processing
5. **Caching:** Consider caching enhancement options untuk performa
6. **Analytics:** Track usage untuk monitoring dan improvement
7. **Security:** Validate user authentication di setiap API call
8. **Rate Limiting:** Implement rate limiting untuk prevent abuse

---

## Troubleshooting Common Issues

### Issue: Enhancement options tidak muncul
**Solution:** Check database query dan pastikan is_active = true

### Issue: Generate gagal dengan error "Invalid enhancement"
**Solution:** Verify enhancement_id valid dan sesuai kategori

### Issue: Token tidak terdeduct
**Solution:** Check api-generate function dan database trigger

### Issue: Image upload stuck
**Solution:** Check file size limit dan network connection

---

## Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Enhancement System Guide](./ENHANCEMENT_PROMPTS_SYSTEM.md)
- [Token System](./DUAL_TOKEN_SYSTEM.md)
- [Admin Guide](./ADMIN_BEAUTY_UPDATE.md)

---

**Created:** [Date]
**Last Updated:** [Date]
**Version:** 1.0.0
