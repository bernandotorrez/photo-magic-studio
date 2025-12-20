# System Prompts Guide

## 🎯 Overview

System prompts adalah "role" atau "expertise" yang diberikan ke AI sebelum enhancement prompts. Ini membuat AI lebih fokus dan hasil lebih maksimal.

## 💡 Konsep

### Tanpa System Prompt:
```
Prompt: "Add professional model wearing this shirt"
Result: Generic, kurang fokus
```

### Dengan System Prompt:
```
System: "You are an expert fashion photographer..."
Prompt: "Add professional model wearing this shirt"
Result: Professional, fashion-focused, high quality
```

## 📊 System Prompts per Category

### 1. Fashion & E-commerce Products
```
You are an expert fashion photographer and e-commerce product specialist. 
Your expertise includes professional product photography, styling, lighting, 
and creating compelling product images that drive sales. You understand 
color theory, composition, and how to showcase products in their best light 
for maximum appeal and conversion.
```

**Fokus:**
- Product photography excellence
- E-commerce optimization
- Sales-driven imagery
- Professional styling

### 2. AI Photographer (Portraits)
```
You are a professional portrait photographer with expertise in studio lighting, 
posing, retouching, and creating stunning portraits. You understand facial 
features, skin tones, lighting techniques, and how to capture the best version 
of every subject. Your work combines technical excellence with artistic vision 
to create magazine-quality portraits.
```

**Fokus:**
- Portrait photography
- Studio lighting
- Professional retouching
- Magazine-quality results

### 3. Interior Design
```
You are an expert interior designer with deep knowledge of spatial design, 
color schemes, furniture placement, lighting design, and creating harmonious 
living spaces. You understand design principles, architectural styles, and 
how to transform spaces to be both beautiful and functional. Your designs 
balance aesthetics with practicality.
```

**Fokus:**
- Spatial design
- Color harmony
- Functional beauty
- Design principles

### 4. Exterior Design & Architecture
```
You are a professional architect and exterior designer specializing in 
building facades, landscaping, outdoor spaces, and architectural visualization. 
You understand structural design, materials, environmental factors, and how 
to create stunning exterior transformations that enhance property value and 
curb appeal.
```

**Fokus:**
- Architectural design
- Landscaping
- Property value enhancement
- Environmental integration

## 🔧 Technical Implementation

### Database Structure

```sql
ALTER TABLE image_categories 
ADD COLUMN system_prompt TEXT;

ALTER TABLE image_categories 
ADD COLUMN is_active BOOLEAN DEFAULT true;
```

### How It Works

1. **User selects category** (Fashion, AI Photographer, etc.)
2. **System fetches system_prompt** from `image_categories` table
3. **User selects enhancements** (Add Model, Change Background, etc.)
4. **System fetches enhancement prompts** from `enhancement_prompts` table
5. **Final prompt is constructed**:
   ```
   {system_prompt}
   
   {enhancement_prompt_1}
   {enhancement_prompt_2}
   ...
   ```
6. **AI generates image** with full context

### Code Flow

```typescript
// 1. Get system prompt
const { data: categoryData } = await supabase
  .from('image_categories')
  .select('system_prompt')
  .eq('category_name', classification)
  .maybeSingle();

const systemPrompt = categoryData?.system_prompt || '';

// 2. Get enhancement prompts
const prompts = [];
for (const enhancement of enhancements) {
  const { data: promptData } = await supabase
    .from('enhancement_prompts')
    .select('prompt_template')
    .eq('enhancement_type', enhancement)
    .maybeSingle();
  
  prompts.push(promptData?.prompt_template);
}

// 3. Combine
const finalPrompt = `${systemPrompt}\n\n${prompts.join('\n\n')}`;

// 4. Send to AI
const result = await generateImage(finalPrompt, imageUrl);
```

## 📈 Benefits

### For Users:
- ✅ **Better Results**: AI understands context better
- ✅ **More Consistent**: Results match category expectations
- ✅ **Professional Quality**: AI acts as expert in field
- ✅ **Faster**: Less trial and error

### For Business:
- ✅ **Higher Satisfaction**: Better results = happier users
- ✅ **More Conversions**: Professional results drive sales
- ✅ **Competitive Edge**: Superior AI output quality
- ✅ **Scalable**: Easy to add new categories

### For Development:
- ✅ **Flexible**: Change prompts without code deploy
- ✅ **Testable**: A/B test different system prompts
- ✅ **Maintainable**: Centralized in database
- ✅ **Trackable**: Version history in database

## 🎨 Best Practices

### Writing System Prompts:

1. **Define Expertise**
   ```
   ✅ "You are an expert fashion photographer..."
   ❌ "You can take photos..."
   ```

2. **Be Specific**
   ```
   ✅ "...with expertise in studio lighting, posing, retouching..."
   ❌ "...who knows about photography..."
   ```

3. **Set Expectations**
   ```
   ✅ "...create magazine-quality portraits"
   ❌ "...make nice pictures"
   ```

4. **Include Context**
   ```
   ✅ "...for e-commerce that drives sales"
   ❌ "...for websites"
   ```

### Testing System Prompts:

1. **A/B Testing**: Try different prompts, measure results
2. **User Feedback**: Ask users which results are better
3. **Quality Metrics**: Track generation success rate
4. **Iteration**: Continuously improve based on data

## 🚀 Deployment

### Step 1: Apply Migration
```bash
# Via Supabase Dashboard
# Copy-paste RUN_THIS_SQL_SYSTEM_PROMPTS.sql to SQL Editor

# Or via CLI
supabase db push
```

### Step 2: Verify
```sql
SELECT category_name, system_prompt 
FROM image_categories 
WHERE is_active = true;
```

### Step 3: Test
1. Generate image in each category
2. Compare results before/after
3. Adjust prompts if needed

## 📊 Monitoring

### Track Performance:
```sql
-- Generation success rate by category
SELECT 
  classification,
  COUNT(*) as total_generations,
  COUNT(CASE WHEN result_url IS NOT NULL THEN 1 END) as successful,
  ROUND(COUNT(CASE WHEN result_url IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as success_rate
FROM generation_history
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY classification
ORDER BY total_generations DESC;
```

## 🔄 Updating Prompts

### Via SQL:
```sql
UPDATE image_categories 
SET system_prompt = 'Your new improved prompt...'
WHERE category_name = 'fashion';
```

### Via Admin Panel (Future):
- Add UI for admin to edit system prompts
- Preview changes before applying
- Version history tracking

## 📁 Files

1. ✅ `supabase/migrations/20231225_add_system_prompts.sql` - Migration
2. ✅ `RUN_THIS_SQL_SYSTEM_PROMPTS.sql` - Quick SQL
3. ✅ `SYSTEM_PROMPTS_GUIDE.md` - This documentation
4. ✅ `supabase/functions/generate-enhanced-image/index.ts` - Already implemented

## ✅ Status

**Ready to Deploy!** System prompts sudah terintegrasi di code, tinggal jalankan migration.

---

**Last Updated**: December 22, 2023
