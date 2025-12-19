import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Check, 
  Zap, 
  Shield, 
  Code2, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  Wand2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ApiPlayground from './ApiPlayground';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

export default function UserApiGuide() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toast({
      title: 'Berhasil di-copy!',
      description: `${label} sudah tersalin`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, label }: { code: string; language: string; label: string }) => (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
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
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm pt-12">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Panduan API</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Integrasikan fitur generate gambar produk ke aplikasi, website, atau toko online Anda secara otomatis
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            ⚡ Response 10-30 detik
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            🔒 Secure & Reliable
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            📚 Multi-language Support
          </Badge>
        </div>
      </div>

      {/* Benefits Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <Zap className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-base">Otomatis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate gambar tanpa perlu login ke dashboard
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <ImageIcon className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-base">Batch Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Process ratusan gambar sekaligus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Code2 className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-base">Easy Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Integrasikan ke e-commerce atau aplikasi Anda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Shield className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-base">Secure & Fast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              API key authentication & response cepat
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="intro" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="intro">Apa itu API?</TabsTrigger>
          <TabsTrigger value="start">Cara Mulai</TabsTrigger>
          <TabsTrigger value="usage">Cara Pakai</TabsTrigger>
          <TabsTrigger value="playground">🎮 Playground</TabsTrigger>
          <TabsTrigger value="faq">FAQ & Tips</TabsTrigger>
        </TabsList>

        {/* Intro Tab */}
        <TabsContent value="intro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Apa itu API?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                API (Application Programming Interface) adalah cara untuk menghubungkan aplikasi Anda dengan layanan kami secara otomatis. 
                Bayangkan seperti "jembatan" yang memungkinkan aplikasi Anda berkomunikasi dengan sistem generate gambar kami.
              </p>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Contoh Penggunaan:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Toko Online:</strong> Otomatis generate foto produk saat upload gambar baru</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Marketplace:</strong> Batch process ratusan foto produk sekaligus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Aplikasi Mobile:</strong> Generate foto langsung dari aplikasi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Website:</strong> Integrasikan fitur generate ke website Anda</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Siapa yang Bisa Menggunakan?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-red-500/5 border-red-500/20">
                  <div>
                    <p className="font-semibold">Free Plan</p>
                    <p className="text-sm text-muted-foreground">Tidak ada akses API</p>
                  </div>
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-500/5 border-green-500/20">
                  <div>
                    <p className="font-semibold">Basic Plan</p>
                    <p className="text-sm text-muted-foreground">5 requests/menit • 50 generations/bulan</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-500/5 border-green-500/20">
                  <div>
                    <p className="font-semibold">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">10 requests/menit • 200 generations/bulan</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Start Tab */}
        <TabsContent value="start" className="space-y-4">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Mulai dalam 3 Langkah Mudah!</AlertTitle>
            <AlertDescription>
              Ikuti panduan di bawah untuk mulai menggunakan API
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <CardTitle>Upgrade Paket Anda</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                API tersedia untuk paket <strong>Basic</strong> dan <strong>Pro</strong>.
              </p>
              <Button>Upgrade Sekarang</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <CardTitle>Buat API Key</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Buka halaman <strong>API Keys</strong> di menu</li>
                <li>Klik tombol <strong>"Create New Key"</strong></li>
                <li>Beri nama untuk API key (contoh: "Toko Online", "Production")</li>
                <li>Klik <strong>"Create"</strong></li>
                <li><strong className="text-orange-500">PENTING:</strong> Simpan API key yang muncul (hanya ditampilkan sekali!)</li>
              </ol>
              
              <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-orange-500 mb-1">Jangan Lupa!</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• API key hanya muncul sekali saat dibuat</li>
                      <li>• Simpan di tempat yang aman</li>
                      <li>• Jangan share ke orang lain</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <CardTitle>Test API Anda</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Copy code di bawah dan jalankan untuk test API Anda:
              </p>
              
              <CodeBlock
                language="bash"
                label="Test Command"
                code={`curl -X POST ${SUPABASE_URL}/functions/v1/api-generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: GANTI_DENGAN_API_KEY_ANDA" \\
  -d '{
    "imageUrl": "https://example.com/product.jpg",
    "enhancement": "add_female_model"
  }'`}
              />

              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Berhasil!</AlertTitle>
                <AlertDescription>
                  Jika berhasil, Anda akan menerima URL gambar yang sudah di-generate
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cara Menggunakan API</CardTitle>
              <CardDescription>Pilih bahasa pemrograman yang Anda gunakan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* JavaScript Example */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  JavaScript / Node.js
                </h4>
                <CodeBlock
                  language="javascript"
                  label="JavaScript Code"
                  code={`// Simpan API key di environment variable
const API_KEY = process.env.API_KEY;

async function generateImage(imageUrl, enhancement, options = {}) {
  const response = await fetch('${SUPABASE_URL}/functions/v1/api-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      imageUrl: imageUrl,
      enhancement: enhancement,
      ...options
    })
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Gambar berhasil di-generate!');
    console.log('URL:', data.generatedImageUrl);
    return data.generatedImageUrl;
  } else {
    console.error('Error:', data.error);
  }
}

// Contoh penggunaan basic
generateImage(
  'https://example.com/product.jpg',
  'add_female_model'
);

// ✨ NEW: Contoh dengan custom pose
generateImage(
  'https://example.com/portrait.jpg',
  'ubah pose',
  {
    classification: 'person',
    customPose: 'sitting on a chair, hands on lap, smiling'
  }
);

// ✨ NEW: Contoh dengan custom furniture
generateImage(
  'https://example.com/empty-room.jpg',
  'virtual staging',
  {
    classification: 'interior',
    customFurniture: 'sofa modern, meja TV, rak buku, karpet'
  }
);`}
                />
              </div>

              {/* Python Example */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Python
                </h4>
                <CodeBlock
                  language="python"
                  label="Python Code"
                  code={`import requests
import os

# Simpan API key di environment variable
API_KEY = os.getenv('API_KEY')

def generate_image(image_url, enhancement):
    response = requests.post(
        '${SUPABASE_URL}/functions/v1/api-generate',
        json={
            'imageUrl': image_url,
            'enhancement': enhancement
        },
        headers={
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    )
    
    data = response.json()
    
    if data.get('success'):
        print('Gambar berhasil di-generate!')
        print('URL:', data['generatedImageUrl'])
        return data['generatedImageUrl']
    else:
        print('Error:', data.get('error'))

# Contoh penggunaan
generate_image(
    'https://example.com/product.jpg',
    'add_female_model'
)`}
                />
              </div>

              {/* PHP Example */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  PHP
                </h4>
                <CodeBlock
                  language="php"
                  label="PHP Code"
                  code={`<?php
// Simpan API key di environment variable
$apiKey = getenv('API_KEY');

function generateImage($imageUrl, $enhancement) {
    global $apiKey;
    
    $ch = curl_init('${SUPABASE_URL}/functions/v1/api-generate');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'imageUrl' => $imageUrl,
        'enhancement' => $enhancement
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey
    ]);
    
    $response = curl_exec($ch);
    $data = json_decode($response, true);
    curl_close($ch);
    
    if ($data['success']) {
        echo "Gambar berhasil di-generate!\\n";
        echo "URL: " . $data['generatedImageUrl'] . "\\n";
        return $data['generatedImageUrl'];
    } else {
        echo "Error: " . $data['error'] . "\\n";
    }
}

// Contoh penggunaan
generateImage(
    'https://example.com/product.jpg',
    'add_female_model'
);
?>`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jenis Enhancement</CardTitle>
              <CardDescription>Pilih enhancement sesuai kebutuhan Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { value: 'add_female_model', label: 'Model Wanita', desc: 'Tampilkan produk dipakai model wanita' },
                  { value: 'add_male_model', label: 'Model Pria', desc: 'Tampilkan produk dipakai model pria' },
                  { value: 'add_female_hijab_model', label: 'Model Hijab', desc: 'Model wanita berhijab' },
                  { value: 'add_mannequin', label: 'Mannequin', desc: 'Tampilkan di mannequin' },
                  { value: 'remove_background', label: 'Hapus Background', desc: 'Background putih bersih' },
                  { value: 'improve_lighting', label: 'Perbaiki Lighting', desc: 'Tingkatkan pencahayaan' },
                  { value: 'enhance_background', label: 'Enhance Background', desc: 'Background lebih profesional' },
                  { value: 'lifestyle', label: 'Lifestyle Photo', desc: 'Foto lifestyle dengan model' },
                  { value: 'ubah pose', label: '✨ Custom Pose (NEW)', desc: 'Ubah pose dengan deskripsi spesifik', isNew: true },
                  { value: 'virtual staging', label: '✨ Custom Furniture (NEW)', desc: 'Tambah furniture spesifik ke ruangan', isNew: true },
                ].map((item) => (
                  <div key={item.value} className={`p-3 border rounded-lg hover:border-primary transition-colors ${item.isNew ? 'bg-primary/5 border-primary/30' : ''}`}>
                    <code className="text-xs bg-muted px-2 py-1 rounded block mb-2">{item.value}</code>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Playground Tab */}
        <TabsContent value="playground" className="space-y-4">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Test API Anda Langsung!</AlertTitle>
            <AlertDescription>
              Masukkan API key dan URL gambar untuk test API tanpa perlu coding
            </AlertDescription>
          </Alert>

          <ApiPlayground />
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pertanyaan yang Sering Ditanyakan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Berapa lama proses generate?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Biasanya 10-30 detik, tergantung kompleksitas enhancement yang dipilih.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Format gambar apa yang didukung?
                </h4>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG, dan WebP. Ukuran maksimal 10MB. Pastikan URL gambar bisa diakses publik.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Apakah API key saya aman?
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Ya, selama Anda menyimpannya dengan benar:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>✓ Simpan di environment variables</li>
                  <li>✓ Jangan commit ke Git/GitHub</li>
                  <li>✓ Jangan share ke orang lain</li>
                  <li>✓ Rotate key secara berkala</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Bisa generate banyak gambar sekaligus?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ya, tapi perhatikan rate limit. Basic: 5 requests/menit, Pro: 10 requests/menit. 
                  Untuk batch processing, gunakan queue system atau delay antar requests.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Apa yang harus dilakukan jika error?
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Error "Invalid API key":</strong> Check API key Anda, pastikan masih aktif</p>
                  <p><strong>Error "Quota exceeded":</strong> Kuota bulanan habis, upgrade atau tunggu bulan depan</p>
                  <p><strong>Error "Rate limit":</strong> Terlalu banyak request, tambahkan delay</p>
                  <p><strong>Error "Timeout":</strong> Coba lagi atau gunakan gambar lebih kecil</p>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips & Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Gunakan Environment Variables</p>
                    <p className="text-xs text-muted-foreground">Jangan hardcode API key di code Anda</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Implementasikan Error Handling</p>
                    <p className="text-xs text-muted-foreground">Selalu check response dan handle error dengan baik</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Cache Hasil Generation</p>
                    <p className="text-xs text-muted-foreground">Simpan hasil untuk menghindari duplicate requests</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Monitor Usage</p>
                    <p className="text-xs text-muted-foreground">Check usage di dashboard untuk menghindari quota exceeded</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Compress Images</p>
                    <p className="text-xs text-muted-foreground">Gunakan gambar dengan ukuran optimal (&lt;5MB) untuk performa terbaik</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Butuh Bantuan?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Jika Anda mengalami kesulitan atau memiliki pertanyaan, jangan ragu untuk menghubungi kami:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    📧 Email Support
                  </Button>
                  <Button variant="outline" className="justify-start">
                    💬 Live Chat
                  </Button>
                  <Button variant="outline" className="justify-start">
                    📚 Dokumentasi Lengkap
                  </Button>
                  <Button variant="outline" className="justify-start">
                    🎥 Video Tutorial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
