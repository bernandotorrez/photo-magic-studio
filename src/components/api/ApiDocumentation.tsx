import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Code, BookOpen, Zap, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

export default function ApiDocumentation() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Auth</TabsTrigger>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-semibold">Free Plan</p>
                    <p className="text-sm text-muted-foreground">No API Access</p>
                  </div>
                  <Badge variant="secondary">❌</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-semibold">Basic Plan</p>
                    <p className="text-sm text-muted-foreground">5 req/min • 50 gen/month</p>
                  </div>
                  <Badge>✅</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-semibold">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">10 req/min • 200 gen/month</p>
                  </div>
                  <Badge>✅</Badge>
                </div>
              </div>
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

        {/* Endpoint Tab */}
        <TabsContent value="endpoint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>POST /api-generate</CardTitle>
              <CardDescription>Generate enhanced product image dengan AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Request:</h4>
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
                        <td className="p-3">Jenis enhancement</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-mono">classification</td>
                        <td className="p-3">string</td>
                        <td className="p-3"><Badge variant="secondary">No</Badge></td>
                        <td className="p-3">Kategori produk</td>
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
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    { value: 'add_female_model', label: 'Model Wanita' },
                    { value: 'add_male_model', label: 'Model Pria' },
                    { value: 'add_female_hijab_model', label: 'Model Hijab' },
                    { value: 'add_mannequin', label: 'Mannequin' },
                    { value: 'remove_background', label: 'Remove Background' },
                    { value: 'improve_lighting', label: 'Improve Lighting' },
                    { value: 'enhance_background', label: 'Enhance Background' },
                    { value: 'lifestyle', label: 'Lifestyle Photo' },
                  ].map((item) => (
                    <div key={item.value} className="flex items-center gap-2 p-2 border rounded">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{item.value}</code>
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
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
                code={`async function generateImage(imageUrl, enhancement) {
  const response = await fetch('${SUPABASE_URL}/functions/v1/api-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_KEY
    },
    body: JSON.stringify({
      imageUrl,
      enhancement,
      classification: 'clothing'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  return data.generatedImageUrl;
}

// Usage
const result = await generateImage(
  'https://example.com/product.jpg',
  'add_female_model'
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

def generate_image(image_url, enhancement):
    response = requests.post(
        '${SUPABASE_URL}/functions/v1/api-generate',
        json={
            'imageUrl': image_url,
            'enhancement': enhancement,
            'classification': 'clothing'
        },
        headers={
            'Content-Type': 'application/json',
            'x-api-key': 'eak_your_api_key'
        }
    )
    response.raise_for_status()
    return response.json()['generatedImageUrl']

# Usage
result = generate_image(
    'https://example.com/product.jpg',
    'add_female_model'
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
$ch = curl_init('${SUPABASE_URL}/functions/v1/api-generate');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'imageUrl' => 'https://example.com/product.jpg',
    'enhancement' => 'add_female_model',
    'classification' => 'clothing'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: eak_your_api_key'
]);

$response = curl_exec($ch);
$data = json_decode($response, true);
echo 'Generated: ' . $data['generatedImageUrl'];
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