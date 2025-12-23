import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Code, BookOpen, Zap, Shield, Loader2 } from 'lucide-react';
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

interface SubscriptionTier {
  tier_id: string;
  tier_name: string;
  api_rate_limit: number;
  tokens: number;
}

export default function ApiDocumentation() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [enhancements, setEnhancements] = useState<Record<string, Enhancement[]>>({});
  const [loadingEnhancements, setLoadingEnhancements] = useState(true);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);

  // Load enhancements from database
  useEffect(() => {
    loadEnhancements();
    loadSubscriptionTiers();
  }, []);

  const loadSubscriptionTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('tier_id, tier_name, api_rate_limit, tokens')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setTiers(data);
      }
    } catch (error) {
      console.error('Error loading subscription tiers:', error);
    } finally {
      setLoadingTiers(false);
    }
  };

  const loadEnhancements = async () => {
    try {
      const categories = ['food', 'fashion', 'interior', 'exterior', 'portrait'];
      const enhancementsByCategory: Record<string, Enhancement[]> = {};

      for (const category of categories) {
        const { data, error } = await supabase
          .rpc('get_enhancements_by_category', { p_category_code: category });

        if (!error && data) {
          enhancementsByCategory[category] = data;
        }
      }

      setEnhancements(enhancementsByCategory);
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toast({
      title: 'Copied!',
      description: `${label} berhasil di-copy`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, label }: { code: string; language: string; label: string }) => (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">{language}</Badge>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => copyToClipboard(code, label)}
        >
          {copiedCode === label ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          Panduan lengkap untuk mengintegrasikan API generate image ke aplikasi Anda
        </p>
      </div>

      {/* Quick Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Quick Start</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Mulai dalam 5 menit dengan panduan quick start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Code Examples</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contoh code untuk 10+ bahasa pemrograman
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Secure & Reliable</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              API key authentication & rate limiting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Documentation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Auth</TabsTrigger>
          <TabsTrigger value="enhancements">Enhancements</TabsTrigger>
          <TabsTrigger value="endpoint">Endpoint</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Base URL</CardTitle>
              <CardDescription>Endpoint dasar untuk semua API calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-4 py-2 rounded text-sm">
                  {SUPABASE_URL}/functions/v1
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(`${SUPABASE_URL}/functions/v1`, 'Base URL')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
              <CardDescription>Batas request berdasarkan paket subscription</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTiers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {tiers.map((tier) => {
                    const hasApiAccess = tier.api_rate_limit > 0;
                    return (
                      <div key={tier.tier_id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-semibold">{tier.tier_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {hasApiAccess 
                              ? `${tier.api_rate_limit} req/min • ${tier.tokens} gen/month`
                              : 'No API Access'
                            }
                          </p>
                        </div>
                        <Badge variant={hasApiAccess ? 'default' : 'secondary'}>
                          {hasApiAccess ? '✅' : '❌'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key Authentication</CardTitle>
              <CardDescription>Semua request memerlukan API key yang valid</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Header Required:</h4>
                <CodeBlock
                  language="http"
                  label="Auth Header"
                  code={`x-api-key: eak_your_api_key_here`}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Cara Mendapatkan API Key:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Upgrade ke paket Pro atau Enterprise</li>
                  <li>Buka halaman API Keys</li>
                  <li>Klik "Create New Key"</li>
                  <li>Beri nama dan simpan key dengan aman</li>
                </ol>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4">
                <p className="text-sm font-semibold text-orange-500 mb-2">⚠️ Penting!</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• API key hanya ditampilkan sekali saat dibuat</li>
                  <li>• Jangan share atau commit ke version control</li>
                  <li>• Gunakan environment variables</li>
                  <li>• Rotate key secara berkala untuk keamanan</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhancements Tab */}
        <TabsContent value="enhancements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Enhancements</CardTitle>
              <CardDescription>
                Daftar lengkap enhancement yang tersedia. Anda bisa menggunakan <strong>Display Name</strong> (dengan emoji) atau <strong>Enhancement Type</strong> (tanpa emoji).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEnhancements ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading enhancements...</span>
                </div>
              ) : (
                <Tabs defaultValue="food" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="food">Food</TabsTrigger>
                    <TabsTrigger value="fashion">Fashion</TabsTrigger>
                    <TabsTrigger value="interior">Interior</TabsTrigger>
                    <TabsTrigger value="exterior">Exterior</TabsTrigger>
                    <TabsTrigger value="portrait">Portrait</TabsTrigger>
                  </TabsList>

                  {Object.entries(enhancements).map(([category, items]) => (
                    <TabsContent key={category} value={category} className="space-y-4">
                      <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-blue-500 mb-2">💡 Tip:</p>
                        <p className="text-sm text-muted-foreground">
                          Klik pada <strong>Display Name</strong> atau <strong>Enhancement Type</strong> untuk copy ke clipboard.
                        </p>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3">Display Name</th>
                              <th className="text-left p-3">Enhancement Type</th>
                              <th className="text-left p-3">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={item.enhancement_id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                <td className="p-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-2 font-normal justify-start hover:bg-primary/10"
                                    onClick={() => copyToClipboard(item.display_name, `Display Name: ${item.display_name}`)}
                                  >
                                    <span className="text-left">{item.display_name}</span>
                                    {copiedCode === `Display Name: ${item.display_name}` ? (
                                      <Check className="w-3 h-3 ml-2 text-green-500 flex-shrink-0" />
                                    ) : (
                                      <Copy className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                                    )}
                                  </Button>
                                </td>
                                <td className="p-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-2 font-mono text-xs justify-start hover:bg-primary/10"
                                    onClick={() => copyToClipboard(item.enhancement_type, `Enhancement Type: ${item.enhancement_type}`)}
                                  >
                                    <code className="text-left">{item.enhancement_type}</code>
                                    {copiedCode === `Enhancement Type: ${item.enhancement_type}` ? (
                                      <Check className="w-3 h-3 ml-2 text-green-500 flex-shrink-0" />
                                    ) : (
                                      <Copy className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                                    )}
                                  </Button>
                                </td>
                                <td className="p-3 text-muted-foreground">{item.description || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Example Usage:</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Using Display Name (with emoji):</p>
                            <CodeBlock
                              language="json"
                              label={`${category} display name example`}
                              code={`{
  "imageUrl": "https://example.com/image.jpg",
  "enhancement": "${items[0]?.display_name || 'enhancement name'}",
  "classification": "${category}"
}`}
                            />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Using Enhancement Type (without emoji):</p>
                            <CodeBlock
                              language="json"
                              label={`${category} enhancement type example`}
                              code={`{
  "imageUrl": "https://example.com/image.jpg",
  "enhancement": "${items[0]?.enhancement_type || 'enhancement_type'}",
  "classification": "${category}"
}`}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoint Tab */}
        <TabsContent value="endpoint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>POST /api-generate</CardTitle>
              <CardDescription>Generate enhanced product image dengan AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Request Example:</h4>
                <CodeBlock
                  language="bash"
                  label="cURL Request"
                  code={`curl -X POST ${SUPABASE_URL}/functions/v1/api-generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: eak_your_api_key" \\
  -d '{
    "imageUrl": "https://example.com/product.jpg",
    "enhancement": "add_female_model",
    "classification": "clothing",
    "watermark": {
      "type": "text",
      "text": "My Brand"
    }
  }'`}
                />
                
                <h4 className="font-semibold mb-2 mt-4">✨ NEW: Multiple Enhancements (Comma-Separated):</h4>
                <CodeBlock
                  language="bash"
                  label="Multiple Enhancements Request"
                  code={`curl -X POST ${SUPABASE_URL}/functions/v1/api-generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: eak_your_api_key" \\
  -d '{
    "imageUrl": "https://example.com/product.jpg",
    "enhancement": "background_removal, color_correction, add_shadow",
    "classification": "product"
  }'`}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  💡 <strong>Tip:</strong> Anda bisa menggabungkan multiple enhancements dengan memisahkan menggunakan koma (,). 
                  Semua enhancement akan diterapkan secara bersamaan untuk hasil yang lebih optimal.
                </p>
                
                <h4 className="font-semibold mb-2 mt-4">✨ Custom Pose Example (AI Photographer):</h4>
                <CodeBlock
                  language="bash"
                  label="Custom Pose Request"
                  code={`curl -X POST ${SUPABASE_URL}/functions/v1/api-generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: eak_your_api_key" \\
  -d '{
    "imageUrl": "https://example.com/portrait.jpg",
    "enhancement": "ubah pose",
    "classification": "person",
    "customPose": "standing with arms crossed, looking confident"
  }'`}
                />
                
                <h4 className="font-semibold mb-2 mt-4">✨ Custom Furniture Example (Interior Design):</h4>
                <CodeBlock
                  language="bash"
                  label="Custom Furniture Request"
                  code={`curl -X POST ${SUPABASE_URL}/functions/v1/api-generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: eak_your_api_key" \\
  -d '{
    "imageUrl": "https://example.com/empty-room.jpg",
    "enhancement": "virtual staging",
    "classification": "interior",
    "customFurniture": "sofa modern, meja TV, rak buku, karpet"
  }'`}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Parameters:</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Parameter</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Required</th>
                        <th className="text-left p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3 font-mono">imageUrl</td>
                        <td className="p-3">string</td>
                        <td className="p-3"><Badge variant="destructive">Yes</Badge></td>
                        <td className="p-3">URL gambar produk</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-mono">enhancement</td>
                        <td className="p-3">string</td>
                        <td className="p-3"><Badge variant="destructive">Yes</Badge></td>
                        <td className="p-3">
                          Jenis enhancement. Bisa single atau multiple (pisahkan dengan koma).
                          <br />
                          <span className="text-xs text-muted-foreground">
                            Contoh: "background_removal" atau "background_removal, color_correction, add_shadow"
                          </span>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-mono">classification</td>
                        <td className="p-3">string</td>
                        <td className="p-3"><Badge variant="secondary">No</Badge></td>
                        <td className="p-3">Kategori produk</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-mono">customPose</td>
                        <td className="p-3">string</td>
                        <td className="p-3"><Badge variant="secondary">No</Badge></td>
                        <td className="p-3">✨ Custom pose untuk AI Photographer</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-mono">customFurniture</td>
                        <td className="p-3">string</td>
                        <td className="p-3"><Badge variant="secondary">No</Badge></td>
                        <td className="p-3">✨ Custom furniture untuk Interior Design</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-mono">watermark</td>
                        <td className="p-3">object</td>
                        <td className="p-3"><Badge variant="secondary">No</Badge></td>
                        <td className="p-3">Konfigurasi watermark</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Enhancement Types:</h4>
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-500 mb-2">📋 Daftar Lengkap Enhancement</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Lihat daftar lengkap enhancement yang tersedia dengan deskripsi dan contoh penggunaan di tab <strong>Enhancements</strong>.
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Anda bisa menggunakan <strong>Display Name</strong> (dengan emoji) atau <strong>Enhancement Type</strong> (tanpa emoji). Keduanya valid!
                  </p>
                  <div className="grid md:grid-cols-2 gap-2 text-xs">
                    <div className="bg-background p-2 rounded border">
                      <p className="font-semibold mb-1">✅ Display Name:</p>
                      <code className="text-xs">"📐 Top-Down View (Flat Lay)"</code>
                    </div>
                    <div className="bg-background p-2 rounded border">
                      <p className="font-semibold mb-1">✅ Enhancement Type:</p>
                      <code className="text-xs">"food_angle_top_down"</code>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Success Response (200):</h4>
                <CodeBlock
                  language="json"
                  label="Success Response"
                  code={`{
  "success": true,
  "generatedImageUrl": "https://example.com/generated.png",
  "prompt": "Generated prompt used for AI",
  "taskId": "task_123456"
}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>POST /api-check-status</CardTitle>
              <CardDescription>Check status of generation task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Request:</h4>
                <CodeBlock
                  language="bash"
                  label="Check Status Request"
                  code={`curl -X POST ${SUPABASE_URL}/functions/v1/api-check-status \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: eak_your_api_key" \\
  -d '{
    "taskId": "task_123456"
  }'`}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Parameters:</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Parameter</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Required</th>
                        <th className="text-left p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3 font-mono">taskId</td>
                        <td className="p-3">string</td>
                        <td className="p-3"><Badge variant="destructive">Yes</Badge></td>
                        <td className="p-3">Task ID dari response api-generate</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Success Response (200):</h4>
                <CodeBlock
                  language="json"
                  label="Status Response"
                  code={`// Task completed successfully
{
  "taskId": "task_123456",
  "state": "success",
  "success": true,
  "generatedImageUrl": "https://example.com/generated.png",
  "resultUrls": ["https://example.com/generated.png"]
}

// Task still processing
{
  "taskId": "task_123456",
  "state": "processing",
  "success": false,
  "status": "processing",
  "message": "Task is still processing"
}

// Task failed
{
  "taskId": "task_123456",
  "state": "fail",
  "success": false,
  "error": "Generation failed"
}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JavaScript / Node.js</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="javascript"
                label="JavaScript Example"
                code={`async function generateImage(imageUrl, enhancement, options = {}) {
  const response = await fetch('${SUPABASE_URL}/functions/v1/api-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_KEY
    },
    body: JSON.stringify({
      imageUrl,
      enhancement,
      ...options
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  return data.generatedImageUrl;
}

// Basic usage
const result = await generateImage(
  'https://example.com/product.jpg',
  'add_female_model'
);

// ✨ Multiple enhancements
const result2 = await generateImage(
  'https://example.com/product.jpg',
  'background_removal, color_correction, add_shadow'
);

// ✨ With custom options
const result3 = await generateImage(
  'https://example.com/shirt.jpg',
  'add_female_model, professional_lighting',
  { classification: 'clothing' }
);

console.log('Generated:', result);`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Python</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="python"
                label="Python Example"
                code={`import requests

def generate_image(image_url, enhancement, options=None):
    payload = {
        'imageUrl': image_url,
        'enhancement': enhancement
    }
    
    if options:
        payload.update(options)
    
    response = requests.post(
        '${SUPABASE_URL}/functions/v1/api-generate',
        json=payload,
        headers={
            'Content-Type': 'application/json',
            'x-api-key': 'eak_your_api_key'
        }
    )
    response.raise_for_status()
    return response.json()['generatedImageUrl']

# Basic usage
result = generate_image(
    'https://example.com/product.jpg',
    'add_female_model'
)

# ✨ Multiple enhancements
result2 = generate_image(
    'https://example.com/product.jpg',
    'background_removal, color_correction, add_shadow'
)

# ✨ With custom options
result3 = generate_image(
    'https://example.com/shirt.jpg',
    'add_female_model, professional_lighting',
    {'classification': 'clothing'}
)

print('Generated:', result)`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PHP</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                language="php"
                label="PHP Example"
                code={`<?php
function generateImage($imageUrl, $enhancement, $options = []) {
    $payload = [
        'imageUrl' => $imageUrl,
        'enhancement' => $enhancement
    ];
    
    if (!empty($options)) {
        $payload = array_merge($payload, $options);
    }
    
    $ch = curl_init('${SUPABASE_URL}/functions/v1/api-generate');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: eak_your_api_key'
    ]);
    
    $response = curl_exec($ch);
    $data = json_decode($response, true);
    curl_close($ch);
    
    return $data['generatedImageUrl'];
}

// Basic usage
$result = generateImage(
    'https://example.com/product.jpg',
    'add_female_model'
);

// ✨ Multiple enhancements
$result2 = generateImage(
    'https://example.com/product.jpg',
    'background_removal, color_correction, add_shadow'
);

// ✨ With custom options
$result3 = generateImage(
    'https://example.com/shirt.jpg',
    'add_female_model, professional_lighting',
    ['classification' => 'clothing']
);

echo 'Generated: ' . $result;
?>`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Responses</CardTitle>
              <CardDescription>Daftar error codes dan cara mengatasinya</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  code: '400',
                  title: 'Bad Request',
                  description: 'Parameter tidak valid atau kurang',
                  example: '{ "error": "imageUrl is required" }',
                  solution: 'Pastikan semua parameter required terisi dengan benar'
                },
                {
                  code: '401',
                  title: 'Unauthorized',
                  description: 'API key tidak valid atau tidak ada',
                  example: '{ "error": "Invalid API key" }',
                  solution: 'Check API key Anda dan pastikan masih aktif'
                },
                {
                  code: '403',
                  title: 'Quota Exceeded',
                  description: 'Kuota bulanan habis',
                  example: '{ "error": "Monthly generation quota exceeded", "current": 100, "limit": 100 }',
                  solution: 'Upgrade paket atau tunggu reset bulan depan'
                },
                {
                  code: '429',
                  title: 'Rate Limit',
                  description: 'Terlalu banyak request',
                  example: '{ "error": "Rate limit exceeded. Please try again later." }',
                  solution: 'Implementasikan delay antar requests atau upgrade paket'
                },
                {
                  code: '500',
                  title: 'Server Error',
                  description: 'Error dari server',
                  example: '{ "error": "Failed to generate image", "details": "..." }',
                  solution: 'Coba lagi atau hubungi support jika berlanjut'
                }
              ].map((error) => (
                <div key={error.code} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <Badge variant="destructive">{error.code}</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold">{error.title}</h4>
                      <p className="text-sm text-muted-foreground">{error.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-xs font-semibold mb-1">Example Response:</p>
                      <code className="block bg-muted p-2 rounded text-xs">{error.example}</code>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1">Solution:</p>
                      <p className="text-xs text-muted-foreground">{error.solution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Links */}
      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => window.open('/API_DOCUMENTATION.md', '_blank')}
            >
              <BookOpen className="w-4 h-4" />
              Full Documentation
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => window.open('/API_QUICK_START.md', '_blank')}
            >
              <Zap className="w-4 h-4" />
              Quick Start Guide
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => window.open('/postman_collection.json', '_blank')}
            >
              <Code className="w-4 h-4" />
              Postman Collection
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}