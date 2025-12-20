import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check, Zap, Crown, Sparkles, ArrowRight, Upload, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    tokens: 5,
    bonusTokens: 0,
    priceLabel: 'Gratis',
    description: 'Untuk mencoba fitur dasar',
    icon: Sparkles,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    features: [
      '5 token per bulan',
      'Akses fitur dasar',
      'Support email',
      'Watermark pada hasil',
    ],
    limitations: [
      'Tidak ada akses API',
      'Tidak ada priority support',
      'Tidak ada custom enhancement',
    ],
    cta: 'Paket Aktif',
    disabled: true,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 30000,
    tokens: 40,
    bonusTokens: 0,
    priceLabel: 'Rp 30.000',
    period: '/bulan',
    description: 'Untuk bisnis kecil',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    popular: false,
    features: [
      '40 token per bulan',
      'Semua fitur enhancement',
      'Tanpa watermark',
      'Export HD quality',
      'Email support',
    ],
    cta: 'Pilih Basic',
  },
  {
    id: 'basic_plus',
    name: 'Basic+',
    price: 50000,
    tokens: 50,
    bonusTokens: 2,
    priceLabel: 'Rp 50.000',
    period: '/bulan',
    description: 'Untuk UMKM',
    icon: Zap,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    popular: true,
    features: [
      '50 token + 2 bonus token',
      'Semua fitur Basic',
      'API Access (5 req/min)',
      'Priority email support',
      'Bulk processing',
    ],
    cta: 'Pilih Basic+',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 75000,
    tokens: 75,
    bonusTokens: 5,
    priceLabel: 'Rp 75.000',
    period: '/bulan',
    description: 'Untuk bisnis berkembang',
    icon: Crown,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    popular: false,
    features: [
      '75 token + 5 bonus token',
      'Semua fitur Basic+',
      'API Access (10 req/min)',
      'Custom enhancement prompts',
      'Priority support (WhatsApp)',
      'Advanced analytics',
    ],
    cta: 'Pilih Pro',
  },
  {
    id: 'pro_max',
    name: 'Pro Max',
    price: 100000,
    tokens: 100,
    bonusTokens: 10,
    priceLabel: 'Rp 100.000',
    period: '/bulan',
    description: 'Untuk bisnis besar',
    icon: Crown,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    popular: false,
    features: [
      '100 token + 10 bonus token',
      'Semua fitur Pro',
      'API Access (20 req/min)',
      'Dedicated support',
      'Custom AI training',
      'White-label option',
      'Early access to beta features',
    ],
    cta: 'Pilih Pro Max',
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uniqueCode, setUniqueCode] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Check if coming from plan selection
  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan && (plan === 'basic' || plan === 'pro')) {
      setSelectedPlan(plan);
      generateUniqueCode(plan);
    }
  }, [searchParams]);

  const generateUniqueCode = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const baseTotal = plan.price;
    
    // If total < 100.000, use 3-digit code (100-999)
    // If total >= 100.000, use 4-digit code (1000-1999)
    if (baseTotal < 100000) {
      const code = Math.floor(Math.random() * 900) + 100;
      setUniqueCode(code);
    } else {
      const code = Math.floor(Math.random() * 1000) + 1000;
      setUniqueCode(code);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/auth');
      return;
    }

    if (planId === 'free') {
      return;
    }

    // Navigate to checkout
    setSelectedPlan(planId);
    generateUniqueCode(planId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('File harus berupa gambar (JPG, PNG, WEBP) atau PDF');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setPaymentProof(file);
    toast.success('File berhasil dipilih');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const uploadProof = async (file: File): Promise<string | null> => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleSubmitPayment = async () => {
    if (!paymentProof || !selectedPlan) {
      toast.error('Please upload payment proof');
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setLoading(selectedPlan);
    setUploading(true);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error('Please login first');
        navigate('/auth');
        return;
      }

      const proofUrl = await uploadProof(paymentProof);
      if (!proofUrl) {
        toast.error('Failed to upload payment proof');
        return;
      }

      const totalWithCode = plan.price + uniqueCode;

      // Create payment record for subscription
      const { error } = await supabase
        .from('payments' as any)
        .insert({
          user_id: currentUser.id,
          user_email: currentUser.email,
          amount: plan.price,
          unique_code: uniqueCode,
          amount_with_code: totalWithCode,
          tokens_purchased: plan.tokens + plan.bonusTokens, // Include bonus
          price_per_token: Math.round(plan.price / (plan.tokens + plan.bonusTokens)),
          payment_method: 'bank_transfer',
          payment_status: 'pending',
          payment_proof_url: proofUrl,
          bank_name: 'BCA',
          account_name: 'Bernand Dayamuntari Hermawan',
          account_number: '2040239483',
          transfer_date: new Date().toISOString(),
          token_type: 'subscription', // Subscription tokens (expire 30 days)
          subscription_plan: plan.id, // Store plan type
        });

      if (error) throw error;

      toast.success('Payment submitted! Waiting for admin verification.');
      navigate('/payment-history');
    } catch (error: any) {
      toast.error('Failed to submit payment: ' + error.message);
    } finally {
      setLoading(null);
      setUploading(false);
    }
  };

  const handleBackToPlans = () => {
    setSelectedPlan(null);
    setPaymentProof(null);
    navigate('/pricing');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Show checkout if plan selected */}
        {selectedPlan ? (
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={handleBackToPlans}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Pilihan Paket
            </Button>

            {(() => {
              const plan = plans.find(p => p.id === selectedPlan);
              if (!plan) return null;

              const totalWithCode = plan.price + uniqueCode;

              return (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left: Plan Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ringkasan Paket</CardTitle>
                      <CardDescription>Detail paket yang Anda pilih</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          {(() => {
                            const Icon = plan.icon;
                            return <Icon className={`w-6 h-6 ${plan.color}`} />;
                          })()}
                          <div>
                            <h3 className="font-bold text-lg">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          {plan.features.slice(0, 5).map((feature, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Harga Paket:</span>
                          <span className="font-medium">Rp {plan.price.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Token:</span>
                          <span className="font-medium">{plan.tokens} token</span>
                        </div>
                        {plan.bonusTokens > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Bonus Token:</span>
                            <span className="font-medium text-green-600">+{plan.bonusTokens} token</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Kode Unik:</span>
                          <span className="font-medium text-accent">+{uniqueCode}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Transfer:</span>
                          <span className="text-primary">Rp {totalWithCode.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right: Payment Instructions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Instruksi Pembayaran</CardTitle>
                      <CardDescription>Transfer ke rekening berikut</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Nama Bank</Label>
                          <p className="text-lg font-bold">BCA</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Nama Penerima</Label>
                          <p className="font-medium">Bernand Dayamuntari Hermawan</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Nomor Rekening</Label>
                          <p className="text-xl font-mono font-bold tracking-wider">2040239483</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Jumlah Transfer</Label>
                          <p className="text-2xl font-bold text-primary">
                            Rp {totalWithCode.toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            (Rp {plan.price.toLocaleString('id-ID')} + kode unik {uniqueCode})
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="proof">Upload Bukti Transfer *</Label>
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                            isDragging
                              ? 'border-primary bg-primary/5'
                              : paymentProof
                                ? 'border-green-500 bg-green-50'
                                : 'border-border hover:border-primary/50'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <input
                            id="proof"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="text-center">
                            {paymentProof ? (
                              <div className="space-y-2">
                                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
                                <p className="text-sm font-medium text-green-700">{paymentProof.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(paymentProof.size / 1024).toFixed(1)} KB
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPaymentProof(null);
                                  }}
                                >
                                  Ganti File
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                                <div>
                                  <p className="text-sm font-medium">Drag & drop atau klik untuk upload</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    JPG, PNG, WEBP, atau PDF (Max 5MB)
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Langkah-langkah:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>
                            Transfer <strong className="text-primary">TEPAT</strong> sejumlah{' '}
                            <strong>Rp {totalWithCode.toLocaleString('id-ID')}</strong>
                          </li>
                          <li>Screenshot bukti transfer dari mobile banking</li>
                          <li>Upload screenshot di form ini</li>
                          <li>Klik "Submit Pembayaran"</li>
                          <li>Tunggu verifikasi admin (max 1 hari kerja)</li>
                        </ol>
                      </div>

                      <Button
                        onClick={handleSubmitPayment}
                        disabled={loading !== null || !paymentProof}
                        className="w-full"
                        size="lg"
                      >
                        {uploading ? (
                          <>
                            <Upload className="w-4 h-4 mr-2 animate-spin" />
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Submit Pembayaran
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </div>
        ) : (
          <>
            {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Pricing Plans
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Pilih Paket yang Sesuai untuk Bisnis Anda
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mulai gratis, upgrade kapan saja. Semua paket include AI-powered image enhancement.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  isPopular ? 'border-primary shadow-lg scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${plan.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-4xl font-bold">
                      {plan.priceLabel}
                      {plan.period && (
                        <span className="text-lg font-normal text-muted-foreground">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations (if any) */}
                  {plan.limitations && (
                    <div className="space-y-2 pt-4 border-t">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-3 opacity-50">
                          <span className="text-sm">✗ {limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    variant={isPopular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={plan.disabled || loading === plan.id}
                  >
                    {loading === plan.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        {!plan.disabled && <ArrowRight className="w-4 h-4 ml-2" />}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💳 Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Kami menerima pembayaran melalui:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Transfer Bank (BCA, Mandiri, BNI, BRI)</li>
                <li>• E-Wallet (GoPay, OVO, Dana)</li>
                <li>• Virtual Account</li>
                <li>• QRIS</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔄 Kebijakan Langganan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Langganan diperpanjang otomatis setiap bulan</li>
                <li>• Bisa cancel kapan saja tanpa biaya tambahan</li>
                <li>• Quota reset setiap awal bulan</li>
                <li>• Upgrade/downgrade bisa dilakukan kapan saja</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Pertanyaan yang Sering Diajukan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Apa bedanya dengan Top Up Token?</h3>
              <p className="text-sm text-muted-foreground">
                Paket subscription memberikan quota bulanan yang lebih murah per generate, plus akses API dan fitur premium. 
                Top Up Token cocok untuk kebutuhan sesekali atau tambahan di luar quota bulanan.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Apakah bisa upgrade/downgrade paket?</h3>
              <p className="text-sm text-muted-foreground">
                Ya, Anda bisa upgrade atau downgrade paket kapan saja. Perubahan akan berlaku di periode billing berikutnya.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Bagaimana jika quota habis sebelum akhir bulan?</h3>
              <p className="text-sm text-muted-foreground">
                Anda bisa melakukan Top Up Token tambahan atau upgrade ke paket yang lebih tinggi.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Apakah ada kontrak jangka panjang?</h3>
              <p className="text-sm text-muted-foreground">
                Tidak ada. Semua paket adalah subscription bulanan yang bisa di-cancel kapan saja tanpa penalti.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Masih Ragu?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Mulai dengan paket Free untuk mencoba fitur dasar. Upgrade kapan saja jika Anda membutuhkan lebih banyak generate dan fitur premium.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Mulai Gratis
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/top-up')}>
              Lihat Top Up Token
            </Button>
          </div>
        </div>
          </>
        )}
      </div>
    </Layout>
  );
}
