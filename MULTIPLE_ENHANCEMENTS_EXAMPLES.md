# Multiple Enhancements - Usage Examples

## 🎨 Real-World Examples

### Example 1: Interior Design - Modern Scandinavian with Plants

**User Selects:**
- Modern Minimalist
- Scandinavian
- Add Plants

**Combined Prompt:**
```
Apply the following enhancements to this image:

1. Transform this interior into a modern minimalist space with clean lines, 
   neutral colors (whites, grays, beiges), minimal furniture, and uncluttered 
   surfaces. Focus on functionality and simplicity.

2. Redesign this interior in Scandinavian style with light wood tones, white 
   walls, cozy textiles, natural materials, and plenty of natural light. 
   Include hygge elements and functional furniture.

3. Add indoor plants and greenery to this interior. Place plants strategically 
   to enhance the space and create a fresh, natural atmosphere. Professional 
   interior plant styling.

Ensure all enhancements work together harmoniously and create a cohesive final result.
```

**Result:** A modern minimalist Scandinavian interior with strategically placed indoor plants.

---

### Example 2: Fashion - Business Casual with Color Correction

**User Selects:**
- Business Formal
- Casual Chic
- Color Correction

**Combined Prompt:**
```
Apply the following enhancements to this image:

1. Redesign this outfit as business formal attire with tailored suit, crisp 
   dress shirt, conservative tie, polished dress shoes, and professional 
   accessories. Maintain a sharp, authoritative look.

2. Transform this outfit into casual chic style with relaxed yet polished 
   pieces, neutral colors with pops of color, quality basics, minimal 
   accessories, and effortless elegance.

3. Apply professional color correction and grading. Balance colors, enhance 
   vibrancy, and create a cohesive color palette.

Ensure all enhancements work together harmoniously and create a cohesive final result.
```

**Result:** A business casual outfit (blend of formal and casual) with professional color grading.

---

### Example 3: Product Photography - Quality + Lighting + Background

**User Selects:**
- Enhance Quality
- Improve Lighting
- Remove Background

**Combined Prompt:**
```
Apply the following enhancements to this image:

1. Enhance the overall quality of this image. Improve sharpness, clarity, 
   color accuracy, and lighting. Make it look professional and high-quality.

2. Apply professional lighting. Add soft fill lights to eliminate shadows, 
   enhance details, and create a polished commercial look.

3. Remove the background completely and replace with pure white (#FFFFFF). 
   Ensure clean edges around the subject with no artifacts.

Ensure all enhancements work together harmoniously and create a cohesive final result.
```

**Result:** High-quality product photo with professional lighting on pure white background.

---

## 💻 Code Examples

### Example 1: Basic Implementation

```typescript
import { supabase } from '@/lib/supabase';

async function generateWithMultipleEnhancements() {
  const selectedEnhancements = [
    'modern_minimalist',
    'scandinavian',
    'add_plants'
  ];

  const { data, error } = await supabase.functions.invoke('generate-enhanced-image', {
    body: {
      imageUrl: 'https://example.com/image.jpg',
      enhancements: selectedEnhancements,
      classification: 'interior'
    }
  });

  if (error) {
    console.error('Generation failed:', error);
    return;
  }

  console.log('Generated image:', data.generatedImageUrl);
  console.log('Combined prompt used:', data.prompt);
}
```

---

### Example 2: With React Component

```typescript
import { useState } from 'react';
import EnhancementMultiSelector from '@/components/EnhancementMultiSelector';
import { supabase } from '@/lib/supabase';

function ImageEnhancer() {
  const [imageUrl, setImageUrl] = useState('');
  const [classification, setClassification] = useState('interior');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async (selectedEnhancements: string[]) => {
    setGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-enhanced-image', {
        body: {
          imageUrl,
          enhancements: selectedEnhancements,
          classification
        }
      });

      if (error) throw error;
      
      setResult(data);
      toast.success(`Generated with ${selectedEnhancements.length} enhancements!`);
    } catch (error) {
      toast.error('Generation failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <EnhancementMultiSelector
        categoryCode={classification}
        onGenerate={handleGenerate}
        maxSelections={4}
        disabled={generating}
      />
      
      {result && (
        <div>
          <img src={result.generatedImageUrl} alt="Generated" />
          <p className="text-sm text-muted-foreground mt-2">
            Prompt used: {result.prompt}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

### Example 3: With Preview

```typescript
import { useState, useEffect } from 'react';
import { getMultipleEnhancementPrompts, combinePrompts } from '@/lib/enhancementPrompts';

function EnhancementPreview() {
  const [selected, setSelected] = useState<string[]>([]);
  const [combinedPrompt, setCombinedPrompt] = useState('');

  useEffect(() => {
    updatePreview();
  }, [selected]);

  const updatePreview = async () => {
    if (selected.length === 0) {
      setCombinedPrompt('');
      return;
    }

    const prompts = await getMultipleEnhancementPrompts(selected);
    const combined = combinePrompts(prompts);
    setCombinedPrompt(combined);
  };

  return (
    <div>
      {/* Enhancement selector */}
      <EnhancementSelector 
        selected={selected}
        onChange={setSelected}
      />

      {/* Preview combined prompt */}
      {combinedPrompt && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Combined Prompt Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap">
              {combinedPrompt}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

### Example 4: With Validation

```typescript
function validateEnhancementCombination(enhancements: string[]): {
  valid: boolean;
  message?: string;
} {
  // Check max limit
  if (enhancements.length > 4) {
    return {
      valid: false,
      message: 'Maximum 4 enhancements allowed'
    };
  }

  // Check for conflicting styles
  const conflictingPairs = [
    ['modern_minimalist', 'bohemian'],
    ['remove_background', 'enhance_background'],
    ['business_formal', 'streetwear']
  ];

  for (const [style1, style2] of conflictingPairs) {
    if (enhancements.includes(style1) && enhancements.includes(style2)) {
      return {
        valid: false,
        message: `${style1} and ${style2} are conflicting styles`
      };
    }
  }

  return { valid: true };
}

// Usage
const validation = validateEnhancementCombination(selected);
if (!validation.valid) {
  toast.error(validation.message);
  return;
}
```

---

## 🎯 Best Combination Examples

### Interior Design

**✅ Good Combinations:**
```typescript
// Modern Scandinavian with Plants
['modern_minimalist', 'scandinavian', 'add_plants']

// Luxury Modern with Lighting
['luxury_modern', 'improve_lighting', 'color_correction']

// Coastal with Natural Elements
['coastal', 'add_plants', 'improve_lighting']
```

**❌ Bad Combinations:**
```typescript
// Conflicting styles
['modern_minimalist', 'bohemian', 'art_deco']

// Too many styles
['modern', 'scandinavian', 'industrial', 'bohemian', 'luxury']
```

---

### Fashion

**✅ Good Combinations:**
```typescript
// Business Casual
['business_formal', 'casual_chic', 'color_correction']

// Sporty Street Style
['streetwear', 'sporty_athletic', 'enhance_quality']

// Elegant Evening
['elegant_evening', 'improve_lighting', 'color_correction']
```

**❌ Bad Combinations:**
```typescript
// Conflicting styles
['business_formal', 'streetwear', 'bohemian']

// Contradictory
['casual_chic', 'elegant_evening', 'sporty_athletic']
```

---

### Product Photography

**✅ Good Combinations:**
```typescript
// Professional Product Shot
['enhance_quality', 'improve_lighting', 'remove_background']

// Lifestyle Product
['enhance_background', 'improve_lighting', 'color_correction']

// E-commerce Ready
['remove_background', 'enhance_quality', 'color_correction']
```

---

## 📊 Analytics Example

Track which combinations are most popular:

```typescript
// Track enhancement combinations
async function trackEnhancementUsage(
  userId: string,
  enhancements: string[],
  success: boolean
) {
  await supabase.from('enhancement_analytics').insert({
    user_id: userId,
    enhancement_combination: enhancements.join(','),
    enhancement_count: enhancements.length,
    success: success,
    created_at: new Date().toISOString()
  });
}

// Get popular combinations
async function getPopularCombinations() {
  const { data } = await supabase
    .from('enhancement_analytics')
    .select('enhancement_combination, count')
    .eq('success', true)
    .order('count', { ascending: false })
    .limit(10);

  return data;
}
```

---

## 🧪 Testing Examples

### Test 1: Single Enhancement (Backward Compatibility)

```typescript
test('should work with single enhancement', async () => {
  const result = await generateImage({
    imageUrl: 'test.jpg',
    enhancement: 'modern_minimalist'
  });

  expect(result.prompt).toContain('modern minimalist');
  expect(result.generatedImageUrl).toBeDefined();
});
```

### Test 2: Multiple Enhancements

```typescript
test('should combine multiple enhancements', async () => {
  const result = await generateImage({
    imageUrl: 'test.jpg',
    enhancements: ['modern_minimalist', 'scandinavian', 'add_plants']
  });

  expect(result.prompt).toContain('Apply the following enhancements');
  expect(result.prompt).toContain('1. Transform');
  expect(result.prompt).toContain('2. Redesign');
  expect(result.prompt).toContain('3. Add');
});
```

### Test 3: Prompt Combination

```typescript
test('should combine prompts correctly', () => {
  const prompts = [
    { prompt_template: 'Make it modern' },
    { prompt_template: 'Add plants' }
  ];

  const combined = combinePrompts(prompts);

  expect(combined).toContain('Apply the following enhancements');
  expect(combined).toContain('1. Make it modern');
  expect(combined).toContain('2. Add plants');
  expect(combined).toContain('harmoniously');
});
```

---

## 📞 Support

For more information:
- `MULTIPLE_ENHANCEMENTS_GUIDE.md` - Complete guide
- `CLASSIFICATION_TO_ENHANCEMENT_FLOW.md` - System flow
- `ENHANCEMENT_PROMPTS_SYSTEM.md` - System documentation

---

**Version:** 1.0.0  
**Date:** December 20, 2024  
**Status:** Production Ready 🚀
