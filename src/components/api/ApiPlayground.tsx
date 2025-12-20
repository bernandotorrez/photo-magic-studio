import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

interface Enhancement {
  enhancement_id: string;
  enhancement_type: string;
  display_name: string;
  description: string;
  category: string;
  is_default: boolean;
  sort_order: number;
}

export default function ApiPlayground() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [enhancement, setEnhancement] = useState('');
  const [classification, setClassification] = useState('clothing');
  const [customPose, setCustomPose] = useState('');
  const [customFurniture, setCustomFurniture] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [loadingEnhancements, setLoadingEnhancements] = useState(true);

  // Load enhancements from database
  useEffect(() => {
    loadEnhancements();
  }, []);

  const loadEnhancements = async () => {
    try {
      // Query enhancements directly from database using type assertion
      const { data, error } = await supabase
        .from('enhancement_prompts' as any)
        .select(`
          id,
          enhancement_type,
          display_name,
          description,
          is_active,
          category_enhancements!inner (
            sort_order,
            image_categories!inner (
              category_code,
              category_name
            )
          )
        `)
        .eq('is_active', true)
        .order('category_enhancements.sort_order');

      if (!error && data) {
        // Transform data to match Enhancement interface
        const transformedData: Enhancement[] = data.map((item: any) => ({
          enhancement_id: item.id,
          enhancement_type: item.enhancement_type,
          display_name: item.display_name,
          description: item.description,
          category: item.category_enhancements[0]?.image_categories?.category_code || '',
          is_default: false,
          sort_order: item.category_enhancements[0]?.sort_order || 0
        }));

        setEnhancements(transformedData);
        // Set default enhancement if available
        if (transformedData.length > 0) {
          setEnhancement(transformedData[0].enhancement_type);
        }
      }
    } catch (error) {
      console.error('Error loading enhancements:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat enhancement list',
        variant: 'destructive',
      });
    } finally {
      setLoadingEnhancements(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey) {
      toast({
        title: 'Error',
        description: 'Masukkan API key Anda',
        variant: 'destructive',
      });
      return;
    }

    if (!imageUrl) {
      toast({
        title: 'Error',
        description: 'Masukkan URL gambar',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const requestBody: any = {
        imageUrl,
        enhancement,
        classification,
      };

      // Add custom input if provided
      if (customPose && classification === 'person') {
        requestBody.customPose = customPose;
      }
      if (customFurniture && classification === 'interior') {
        requestBody.customFurniture = customFurniture;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/api-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResult(data);
      toast({
        title: 'Success!',
        description: 'Gambar berhasil di-generate',
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            API Playground
          </CardTitle>
          <CardDescription>
            Test API Anda langsung di sini tanpa perlu coding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Perhatian:</strong> Test di playground ini akan mengurangi kuota generation bulanan Anda.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="eak_your_api_key_here"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              API key Anda tidak akan disimpan
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              placeholder="https://example.com/product.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classification">Classification</Label>
            <Select value={classification} onValueChange={setClassification}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clothing">Clothing (Pakaian)</SelectItem>
                <SelectItem value="person">Person (AI Photographer)</SelectItem>
                <SelectItem value="interior">Interior (Interior Design)</SelectItem>
                <SelectItem value="shoes">Shoes (Sepatu)</SelectItem>
                <SelectItem value="accessories">Accessories (Aksesoris)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enhancement">Enhancement Type</Label>
            {loadingEnhancements ? (
              <div className="flex items-center justify-center py-4 border rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Loading enhancements...</span>
              </div>
            ) : (
              <Select value={enhancement} onValueChange={setEnhancement}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih enhancement" />
                </SelectTrigger>
                <SelectContent>
                  {enhancements.map((item) => (
                    <SelectItem key={item.enhancement_id} value={item.enhancement_type}>
                      {item.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Custom Pose Input */}
          {classification === 'person' && enhancement === 'ubah pose' && (
            <div className="space-y-2 p-3 border border-primary/30 rounded-lg bg-primary/5">
              <Label htmlFor="custom-pose" className="flex items-center gap-2">
                ✨ Custom Pose (Optional)
              </Label>
              <Input
                id="custom-pose"
                placeholder="e.g., standing with arms crossed, looking confident"
                value={customPose}
                onChange={(e) => setCustomPose(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan untuk pose random, atau isi untuk pose spesifik
              </p>
            </div>
          )}

          {/* Custom Furniture Input */}
          {classification === 'interior' && enhancement === 'virtual staging' && (
            <div className="space-y-2 p-3 border border-primary/30 rounded-lg bg-primary/5">
              <Label htmlFor="custom-furniture" className="flex items-center gap-2">
                ✨ Custom Furniture (Optional)
              </Label>
              <Input
                id="custom-furniture"
                placeholder="e.g., sofa, meja TV, rak buku, karpet"
                value={customFurniture}
                onChange={(e) => setCustomFurniture(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan untuk furniture random, atau isi item spesifik (pisahkan dengan koma)
              </p>
            </div>
          )}

          <Button 
            onClick={handleTest} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Test API
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
              Success!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Generated Image:</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img 
                  src={result.generatedImageUrl} 
                  alt="Generated" 
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Image URL:</Label>
              <div className="mt-1 p-2 bg-muted rounded text-xs break-all">
                {result.generatedImageUrl}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Task ID:</Label>
              <div className="mt-1 p-2 bg-muted rounded text-xs">
                {result.taskId}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Prompt Used:</Label>
              <div className="mt-1 p-2 bg-muted rounded text-xs">
                {result.prompt}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
