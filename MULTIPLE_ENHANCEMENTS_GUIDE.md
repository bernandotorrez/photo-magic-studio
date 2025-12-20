# Multiple Enhancements Guide

## 📋 Overview

User dapat memilih **multiple enhancements** sekaligus, dan sistem akan menggabungkan semua prompt menjadi satu prompt yang kohesif untuk AI.

## 🎯 Use Cases

### Single Enhancement
```
User selects: "Modern Minimalist"
Result: Clean, minimalist interior design
```

### Multiple Enhancements
```
User selects: 
- "Modern Minimalist" 
- "Scandinavian"
- "Add Plants"

Result: Modern minimalist Scandinavian interior with indoor plants
```

## 🔄 How It Works

### 1. User Selects Multiple Enhancements

```typescript
// Frontend
const selectedEnhancements = [
  'modern_minimalist',
  'scandinavian',
  'add_plants'
];
```

### 2. Backend Queries All Prompts

```typescript
// Backend automatically queries each prompt
for (const enhancementType of selectedEnhancements) {
  const { data } = await supabase
    .from('enhancement_prompts')
    .select('prompt_template')
    .eq('enhancement_type', enhancementType)
    .eq('is_active', true)
    .maybeSingle();
  
  prompts.push(data.prompt_template);
}
```

### 3. Prompts Are Combined

```typescript
// Single prompt
"Transform this interior into a modern minimalist space..."

// Multiple prompts combined
"Apply the following enhancements to this image:

1. Transform this interior into a modern minimalist space with clean lines, 
   neutral colors (whites, grays, beiges), minimal furniture, and uncluttered 
   surfaces. Focus on functionality and simplicity.

2. Redesign this interior in Scandinavian style with light wood tones, white 
   walls, cozy textiles, natural materials, and plenty of natural light. 
   Include hygge elements and functional furniture.

3. Add indoor plants and greenery to this interior. Place plants strategically 
   to enhance the space and create a fresh, natural atmosphere. Professional 
   interior plant styling.

Ensure all enhancements work together harmoniously and create a cohesive final result."
```

### 4. AI Generates Image

AI receives the combined prompt and generates an image that incorporates all enhancements.

## 📡 API Usage

### Request Format

**Single Enhancement (Backward Compatible):**
```json
{
  "imageUrl": "https://...",
  "enhancement": "modern_minimalist",
  "classification": "interior"
}
```

**Multiple Enhancements (New):**
```json
{
  "imageUrl": "https://...",
  "enhancements": [
    "modern_minimalist",
    "scandinavian",
    "add_plants"
  ],
  "classification": "interior"
}
```

**Both formats are supported!**

### Response Format

```json
{
  "generatedImageUrl": "https://...",
  "prompt": "Apply the following enhancements to this image:\n\n1. Transform...\n\n2. Redesign...\n\n3. Add...\n\nEnsure all enhancements work together harmoniously..."
}
```

## 💻 Frontend Implementation

### Example 1: Using Helper Functions

```typescript
import { 
  getMultipleEnhancementPrompts, 
  combinePrompts 
} from '@/lib/enhancementPrompts';

// Get prompts for selected enhancements
const selectedTypes = ['modern_minimalist', 'scandinavian', 'add_plants'];
const prompts = await getMultipleEnhancementPrompts(selectedTypes);

// Combine prompts
const combinedPrompt = combinePrompts(prompts);

console.log(combinedPrompt);
// "Apply the following enhancements to this image:\n\n1. Transform..."
```

### Example 2: Direct API Call

```typescript
// Call generate function with multiple enhancements
const { data, error } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    imageUrl: uploadedImageUrl,
    enhancements: [
      'modern_minimalist',
      'scandinavian',
      'add_plants'
    ],
    classification: 'interior'
  }
});

if (data?.generatedImageUrl) {
  console.log('Generated:', data.generatedImageUrl);
}
```

### Example 3: UI with Checkboxes

```typescript
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

function EnhancementSelector() {
  const [selected, setSelected] = useState<string[]>([]);
  
  const enhancements = [
    { type: 'modern_minimalist', title: 'Modern Minimalist' },
    { type: 'scandinavian', title: 'Scandinavian' },
    { type: 'add_plants', title: 'Add Plants' },
  ];
  
  const toggleEnhancement = (type: string) => {
    setSelected(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  const handleGenerate = async () => {
    const { data } = await supabase.functions.invoke('generate-enhanced-image', {
      body: {
        imageUrl: imageUrl,
        enhancements: selected, // Multiple enhancements
        classification: 'interior'
      }
    });
  };
  
  return (
    <div>
      <h3>Select Enhancements (Multiple)</h3>
      {enhancements.map(enh => (
        <div key={enh.type}>
          <Checkbox 
            checked={selected.includes(enh.type)}
            onCheckedChange={() => toggleEnhancement(enh.type)}
          />
          <label>{enh.title}</label>
        </div>
      ))}
      
      <Button 
        onClick={handleGenerate}
        disabled={selected.length === 0}
      >
        Generate ({selected.length} enhancements)
      </Button>
    </div>
  );
}
```

## 🎨 Best Practices

### 1. Limit Number of Enhancements

```typescript
// Recommended: Max 3-4 enhancements
const MAX_SELECTIONS = 4;

if (selected.length >= MAX_SELECTIONS) {
  toast.error(`Maximum ${MAX_SELECTIONS} enhancements allowed`);
  return;
}
```

### 2. Group Compatible Enhancements

```typescript
// Good combinations
✅ Modern Minimalist + Scandinavian + Add Plants
✅ Luxury Modern + Improve Lighting + Color Correction
✅ Casual Chic + Streetwear + Color Variants

// Conflicting combinations (avoid)
❌ Modern Minimalist + Bohemian (conflicting styles)
❌ Remove Background + Enhance Background (contradictory)
```

### 3. Show Preview of Combined Prompt

```typescript
// Show user what will be generated
const prompts = await getMultipleEnhancementPrompts(selected);
const combined = combinePrompts(prompts);

// Display in UI
<div className="prompt-preview">
  <h4>Combined Prompt:</h4>
  <p>{combined}</p>
</div>
```

### 4. Provide Clear Feedback

```typescript
// Show selected count
<Badge>{selected.length} enhancements selected</Badge>

// Show individual selections
{selected.map(type => (
  <Chip key={type} onRemove={() => removeSelection(type)}>
    {getEnhancementTitle(type)}
  </Chip>
))}
```

## 🔍 Testing

### Test Case 1: Single Enhancement

```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-enhanced-image \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://...",
    "enhancement": "modern_minimalist"
  }'
```

### Test Case 2: Multiple Enhancements

```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-enhanced-image \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://...",
    "enhancements": ["modern_minimalist", "scandinavian", "add_plants"]
  }'
```

### Test Case 3: Verify Prompt Combination

```typescript
// Test prompt combination
const prompts = [
  { prompt_template: 'Make it modern' },
  { prompt_template: 'Add plants' },
  { prompt_template: 'Improve lighting' }
];

const combined = combinePrompts(prompts);

console.log(combined);
// Should output:
// "Apply the following enhancements to this image:
//
// 1. Make it modern
//
// 2. Add plants
//
// 3. Improve lighting
//
// Ensure all enhancements work together harmoniously..."
```

## 📊 Database Queries

### Get Multiple Prompts

```sql
-- Get prompts for multiple enhancement types
SELECT 
  enhancement_type,
  display_name,
  prompt_template
FROM enhancement_prompts
WHERE enhancement_type IN ('modern_minimalist', 'scandinavian', 'add_plants')
  AND is_active = true;
```

### Track Multiple Enhancement Usage

```sql
-- Save to generation_history with multiple enhancements
INSERT INTO generation_history (
  user_id,
  enhancement_type,
  prompt_used
) VALUES (
  'user-uuid',
  'modern_minimalist, scandinavian, add_plants', -- Comma-separated
  'Apply the following enhancements...' -- Combined prompt
);
```

## 🎯 Benefits

### For Users
- ✅ More creative control
- ✅ Combine multiple styles
- ✅ Achieve complex results in one generation
- ✅ Save time (no need for multiple generations)

### For System
- ✅ Flexible and powerful
- ✅ Backward compatible (single enhancement still works)
- ✅ Database-driven (easy to manage)
- ✅ Scalable (add more enhancements easily)

## 🚀 Migration

### Existing Code (Single Enhancement)

```typescript
// Old code still works!
const { data } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    imageUrl: url,
    enhancement: 'modern_minimalist' // Single
  }
});
```

### New Code (Multiple Enhancements)

```typescript
// New code with multiple enhancements
const { data } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    imageUrl: url,
    enhancements: ['modern_minimalist', 'scandinavian'] // Multiple
  }
});
```

**Both formats work! No breaking changes.**

## 📞 Support

For questions or issues:
- Read `CLASSIFICATION_TO_ENHANCEMENT_FLOW.md` for complete flow
- Read `ENHANCEMENT_PROMPTS_SYSTEM.md` for system documentation
- Contact development team

---

**Version:** 1.0.0  
**Date:** December 20, 2025  
**Status:** Production Ready 🚀
