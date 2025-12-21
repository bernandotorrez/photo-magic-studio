# Beauty Enhancement - Frontend Implementation Example 💄

## Complete React/TypeScript Implementation

### 1. Types & Interfaces

```typescript
// types/beauty.ts
export interface BeautyEnhancement {
  id: string;
  enhancement_type: string;
  display_name: string;
  description: string;
  supports_custom_prompt: boolean;
}

export interface BeautyClassificationResult {
  classification: 'beauty';
  gender: 'male' | 'female';
  detectedLabel: string;
  classificationSuccess: boolean;
  subcategories: {
    hair_style: BeautyEnhancement[];
    makeup: BeautyEnhancement[];
  };
  enhancementOptions: BeautyEnhancement[];
}

export interface GenerateBeautyRequest {
  imageUrl: string;
  enhancementIds: string[];
  classification: 'beauty';
  customPrompt?: string;
}

export interface GenerateBeautyResponse {
  generatedImageUrl: string;
  prompt: string;
}
```

### 2. API Service

```typescript
// services/beautyApi.ts
import { supabase } from '@/lib/supabase';
import type { 
  BeautyClassificationResult, 
  GenerateBeautyRequest, 
  GenerateBeautyResponse 
} from '@/types/beauty';

export class BeautyAPI {
  /**
   * Classify image and detect gender
   */
  static async classifyBeauty(imageUrl: string): Promise<BeautyClassificationResult> {
    const { data, error } = await supabase.functions.invoke('classify-beauty', {
      body: { imageUrl }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Generate beauty enhancement
   */
  static async generateEnhancement(
    request: GenerateBeautyRequest
  ): Promise<GenerateBeautyResponse> {
    const { data, error } = await supabase.functions.invoke('generate-enhanced-image', {
      body: request
    });

    if (error) throw error;
    return data;
  }

  /**
   * Force gender classification
   */
  static async classifyBeautyWithGender(
    imageUrl: string,
    forceGender: 'male' | 'female'
  ): Promise<BeautyClassificationResult> {
    const { data, error } = await supabase.functions.invoke('classify-beauty', {
      body: { imageUrl, forceGender }
    });

    if (error) throw error;
    return data;
  }
}
```

### 3. Main Beauty Component

```typescript
// components/BeautyEnhancer.tsx
import { useState } from 'react';
import { BeautyAPI } from '@/services/beautyApi';
import { HairStyleSelector } from './HairStyleSelector';
import { MakeupSelector } from './MakeupSelector';
import { CustomColorInput } from './CustomColorInput';
import { GenderToggle } from './GenderToggle';
import { ImageUploader } from './ImageUploader';
import { ResultDisplay } from './ResultDisplay';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import type { BeautyEnhancement, BeautyClassificationResult } from '@/types/beauty';

export const BeautyEnhancer = () => {
  // State
  const [imageUrl, setImageUrl] = useState<string>('');
  const [classification, setClassification] = useState<BeautyClassificationResult | null>(null);
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'hair' | 'makeup'>('hair');

  // Classify image
  const handleClassify = async () => {
    if (!imageUrl) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await BeautyAPI.classifyBeauty(imageUrl);
      setClassification(result);
      setSelectedEnhancements([]);
      setCustomColor('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Classification failed');
    } finally {
      setLoading(false);
    }
  };

  // Generate enhancement
  const handleGenerate = async () => {
    if (selectedEnhancements.length === 0) {
      setError('Please select at least one enhancement');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const result = await BeautyAPI.generateEnhancement({
        imageUrl,
        enhancementIds: selectedEnhancements,
        classification: 'beauty',
        customPrompt: customColor || undefined
      });

      setResult(result.generatedImageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // Toggle enhancement selection
  const toggleEnhancement = (id: string) => {
    setSelectedEnhancements(prev =>
      prev.includes(id)
        ? prev.filter(e => e !== id)
        : [...prev, id]
    );
  };

  // Force gender change
  const handleGenderChange = async (gender: 'male' | 'female') => {
    if (!imageUrl) return;

    setLoading(true);
    try {
      const result = await BeautyAPI.classifyBeautyWithGender(imageUrl, gender);
      setClassification(result);
      setSelectedEnhancements([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change gender');
    } finally {
      setLoading(false);
    }
  };

  // Check if any selected enhancement supports custom prompt
  const supportsCustomPrompt = classification?.enhancementOptions
    .filter(e => selectedEnhancements.includes(e.id))
    .some(e => e.supports_custom_prompt) || false;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Beauty Enhancement 💄</h1>
        <p className="text-muted-foreground">
          Transform your hair style and makeup with AI
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image Upload */}
      <ImageUploader
        imageUrl={imageUrl}
        onImageChange={setImageUrl}
        onClassify={handleClassify}
        loading={loading}
      />

      {/* Classification Result */}
      {classification && (
        <div className="space-y-4">
          {/* Gender Display & Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Detected Gender</p>
              <p className="text-lg font-semibold capitalize">
                {classification.gender}
              </p>
            </div>
            <GenderToggle
              currentGender={classification.gender}
              onGenderChange={handleGenderChange}
              disabled={loading}
            />
          </div>

          {/* Enhancement Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'hair' | 'makeup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hair">
                Hair Style ({classification.subcategories.hair_style.length})
              </TabsTrigger>
              <TabsTrigger value="makeup">
                Make Up ({classification.subcategories.makeup.length})
              </TabsTrigger>
            </TabsList>

            {/* Hair Style Tab */}
            <TabsContent value="hair" className="space-y-4">
              <HairStyleSelector
                hairStyles={classification.subcategories.hair_style}
                selectedIds={selectedEnhancements}
                onToggle={toggleEnhancement}
              />
            </TabsContent>

            {/* Makeup Tab */}
            <TabsContent value="makeup" className="space-y-4">
              <MakeupSelector
                makeupOptions={classification.subcategories.makeup}
                selectedIds={selectedEnhancements}
                onToggle={toggleEnhancement}
              />
            </TabsContent>
          </Tabs>

          {/* Custom Color Input */}
          {supportsCustomPrompt && (
            <CustomColorInput
              value={customColor}
              onChange={setCustomColor}
              placeholder="e.g., 'soft pink', 'burgundy red', 'rose gold eyeshadow'"
            />
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={selectedEnhancements.length === 0 || generating}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              `Generate Enhancement (${selectedEnhancements.length} selected)`
            )}
          </Button>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <ResultDisplay
          originalUrl={imageUrl}
          resultUrl={result}
          onReset={() => {
            setResult('');
            setSelectedEnhancements([]);
            setCustomColor('');
          }}
        />
      )}
    </div>
  );
};
```

### 4. Hair Style Selector Component

```typescript
// components/HairStyleSelector.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { BeautyEnhancement } from '@/types/beauty';

interface HairStyleSelectorProps {
  hairStyles: BeautyEnhancement[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const HairStyleSelector = ({
  hairStyles,
  selectedIds,
  onToggle
}: HairStyleSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hairStyles.map((style) => (
        <Card
          key={style.id}
          className={`cursor-pointer transition-all ${
            selectedIds.includes(style.id)
              ? 'ring-2 ring-primary'
              : 'hover:shadow-md'
          }`}
          onClick={() => onToggle(style.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={selectedIds.includes(style.id)}
                onCheckedChange={() => onToggle(style.id)}
              />
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1">
                  {style.display_name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {style.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

### 5. Makeup Selector Component

```typescript
// components/MakeupSelector.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { BeautyEnhancement } from '@/types/beauty';

interface MakeupSelectorProps {
  makeupOptions: BeautyEnhancement[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const MakeupSelector = ({
  makeupOptions,
  selectedIds,
  onToggle
}: MakeupSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {makeupOptions.map((makeup) => (
        <Card
          key={makeup.id}
          className={`cursor-pointer transition-all ${
            selectedIds.includes(makeup.id)
              ? 'ring-2 ring-primary'
              : 'hover:shadow-md'
          }`}
          onClick={() => onToggle(makeup.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={selectedIds.includes(makeup.id)}
                onCheckedChange={() => onToggle(makeup.id)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">
                    {makeup.display_name}
                  </h3>
                  {makeup.supports_custom_prompt && (
                    <Badge variant="secondary" className="text-xs">
                      Custom Color
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {makeup.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

### 6. Custom Color Input Component

```typescript
// components/CustomColorInput.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';

interface CustomColorInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CustomColorInput = ({
  value,
  onChange,
  placeholder = "Describe your desired color..."
}: CustomColorInputProps) => {
  return (
    <div className="space-y-2 p-4 bg-muted rounded-lg">
      <Label className="flex items-center gap-2">
        <Palette className="h-4 w-4" />
        Custom Color/Style
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Examples: "soft pink", "burgundy red with matte finish", "rose gold eyeshadow"
      </p>
    </div>
  );
};
```

### 7. Gender Toggle Component

```typescript
// components/GenderToggle.tsx
import { Button } from '@/components/ui/button';
import { User, UserCheck } from 'lucide-react';

interface GenderToggleProps {
  currentGender: 'male' | 'female';
  onGenderChange: (gender: 'male' | 'female') => void;
  disabled?: boolean;
}

export const GenderToggle = ({
  currentGender,
  onGenderChange,
  disabled = false
}: GenderToggleProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={currentGender === 'male' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onGenderChange('male')}
        disabled={disabled}
      >
        {currentGender === 'male' ? (
          <UserCheck className="h-4 w-4 mr-2" />
        ) : (
          <User className="h-4 w-4 mr-2" />
        )}
        Male
      </Button>
      <Button
        variant={currentGender === 'female' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onGenderChange('female')}
        disabled={disabled}
      >
        {currentGender === 'female' ? (
          <UserCheck className="h-4 w-4 mr-2" />
        ) : (
          <User className="h-4 w-4 mr-2" />
        )}
        Female
      </Button>
    </div>
  );
};
```

### 8. Image Uploader Component

```typescript
// components/ImageUploader.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  onClassify: () => void;
  loading: boolean;
}

export const ImageUploader = ({
  imageUrl,
  onImageChange,
  onClassify,
  loading
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase storage
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('upload-images')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('upload-images')
        .getPublicUrl(fileName);

      onImageChange(urlData.publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border-2 border-dashed rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="image-upload">Upload Portrait Photo</Label>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading || loading}
        />
      </div>

      {imageUrl && (
        <div className="space-y-4">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="w-full max-w-md mx-auto rounded-lg"
          />
          <Button
            onClick={onClassify}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Detecting Gender...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Classify Image
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
```

### 9. Result Display Component

```typescript
// components/ResultDisplay.tsx
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';

interface ResultDisplayProps {
  originalUrl: string;
  resultUrl: string;
  onReset: () => void;
}

export const ResultDisplay = ({
  originalUrl,
  resultUrl,
  onReset
}: ResultDisplayProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `beauty-enhanced-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-4 p-6 bg-muted rounded-lg">
      <h3 className="text-lg font-semibold">Result</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Original</p>
          <img
            src={originalUrl}
            alt="Original"
            className="w-full rounded-lg"
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Enhanced</p>
          <img
            src={resultUrl}
            alt="Enhanced"
            className="w-full rounded-lg"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleDownload} className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button onClick={onReset} variant="outline" className="flex-1">
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Another
        </Button>
      </div>
    </div>
  );
};
```

### 10. Add to Main Menu

```typescript
// Update your main navigation/menu
import { Sparkles } from 'lucide-react';

// In your menu items array
const menuItems = [
  // ... existing items
  {
    icon: Sparkles,
    label: 'Beauty',
    path: '/beauty',
    description: 'Hair style & makeup enhancement'
  }
];
```

### 11. Route Setup

```typescript
// App.tsx or routes configuration
import { BeautyEnhancer } from '@/components/BeautyEnhancer';

// Add route
<Route path="/beauty" element={<BeautyEnhancer />} />
```

## Usage Example

```typescript
// pages/BeautyPage.tsx
import { BeautyEnhancer } from '@/components/BeautyEnhancer';

export default function BeautyPage() {
  return (
    <div className="container mx-auto py-8">
      <BeautyEnhancer />
    </div>
  );
}
```

## Testing

```typescript
// __tests__/BeautyEnhancer.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BeautyEnhancer } from '@/components/BeautyEnhancer';

describe('BeautyEnhancer', () => {
  it('should classify image and show enhancements', async () => {
    render(<BeautyEnhancer />);
    
    // Upload image
    const input = screen.getByLabelText('Upload Portrait Photo');
    fireEvent.change(input, { target: { files: [mockFile] } });
    
    // Classify
    const classifyBtn = await screen.findByText('Classify Image');
    fireEvent.click(classifyBtn);
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/Detected Gender/i)).toBeInTheDocument();
    });
  });
});
```

---

## Summary

Implementasi frontend lengkap dengan:
- ✅ Type-safe TypeScript
- ✅ Reusable components
- ✅ Gender detection & toggle
- ✅ Hair style selector
- ✅ Makeup selector
- ✅ Custom color input
- ✅ Result display with before/after
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design

**Estimated implementation time: 2-3 hours**
