import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

export default function ApiPlayground() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [enhancement, setEnhancement] = useState('add_female_model');
  const [classification, setClassification] = useState('clothing');
  const [customPose, setCustomPose] = useState('');
  const [customFurniture, setCustomFurniture] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
            <Select value={enhancement} onValueChange={setEnhancement}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add_female_model">Model Wanita</SelectItem>
                <SelectItem value="add_male_model">Model Pria</SelectItem>
                <SelectItem value="add_female_hijab_model">Model Hijab</SelectItem>
                <SelectItem value="add_mannequin">Mannequin</SelectItem>
                <SelectItem value="remove_background">Remove Background</SelectItem>
                <SelectItem value="improve_lighting">Improve Lighting</SelectItem>
                <SelectItem value="enhance_background">Enhance Background</SelectItem>
                <SelectItem value="lifestyle">Lifestyle Photo</SelectItem>
                <SelectItem value="ubah pose">✨ Custom Pose (NEW)</SelectItem>
                <SelectItem value="virtual staging">✨ Custom Furniture (NEW)</SelectItem>
              </SelectContent>
            </Select>
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
