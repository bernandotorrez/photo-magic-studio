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
import { Check, Sparkles, ArrowRight, Upload, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionTier {
  id: string;
  tier_id: string;
  tier_name: string;
  display_order: number;
  price: number;
  tokens: number;
  bonus_tokens: number;
  description: string;
  features: string[];
  limitations: string[];
  api_rate_limit: number;
  is_popular: boolean;
  color: string;
  bg_color: string;
  icon: string;
}

export default function PricingNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uniqueCode, setUniqueCode] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [plans, setPlans] = useState<SubscriptionTier[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Fetch subscription tiers from database
  useEffect(() => {
    fetchSubscriptionTiers();
  }, []);

  const fetchSubscriptionTiers = async () => {
    try {
      // Use RPC function to get active tiers
      const { data, error } = await supabase
        .rpc('get_active_subscription_tiers');

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      console.log('Fetched subscription tiers:', data);
      setPlans((data as any) || []);
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
      toast.error('Gagal memuat paket subscription');
      // Fallback to empty array if error
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Check if coming from plan selection
  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId && plans.length > 0) {
      const plan = plans.find(p => p.tier_id === planId);
      if (plan) {
        setSelectedPlan(plan);
        generateUniqueCode(plan);
      }
    }
  }, [searchParams, plans]);

  const generateUniqueCode = (plan: SubscriptionTier) => {
    const baseTotal = plan.price;
    
    if (baseTotal < 100000) {
      const code = Math.floor(Math.random() * 900) + 100;
      setUniqueCode(code);
    } else {
      const code = Math.floor(Math.random() * 1000) + 1000;
      setUniqueCode(code);
    }
  };

  const handleSelectPlan = async (plan: SubscriptionTier) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/auth');
      return;
    }

    if (plan.tier_id === 'free') {
      return;
    }

    setSelectedPlan(plan);
    generateUniqueCode(plan);
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

    setLoading(selectedPlan.tier_id);
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

      const totalWithCode = selectedPlan.price + uniqueCode;
      const totalTokens = selectedPlan.tokens + selectedPlan.bonus_tokens;

      const { error } = await supabase
        .from('payments' as any)
        .insert({
          user_id: currentUser.id,
          user_email: currentUser.email,
          amount: selectedPlan.price,
          unique_code: uniqueCode,
          amount_with_code: totalWithCode,
          tokens_purchased: selectedPlan.tokens,
          bonus_tokens: selectedPlan.bonus_tokens,
          price_per_token: Math.round(selectedPlan.price / totalTokens),
          payment_method: 'bank_transfer',
          payment_status: 'pending',
          payment_proof_url: proofUrl,
          bank_name: 'BCA',
          account_name: 'Bernand Dayamuntari Hermawan',
          account_number: '2040239483',
          transfer_date: new Date().toISOString(),
          token_type: 'subscription',
          subscription_plan: selectedPlan.tier_id, // Add subscription_plan field
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
        {selectedPlan ? (
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={handleBackToPlans} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Pilihan Paket
            </Button>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Paket</CardTitle>
                  <CardDescription>Detail paket yang Anda pilih</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-bold text-lg">{selectedPlan.tier_name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      {selectedPlan.features.slice(0, 5).map((feature, index) => (
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
                      <span className="font-medium">Rp {selectedPlan.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Token:</span>
                      <span className="font-medium">{selectedPlan.tokens} token</span>
                    </div>
                    {selectedPlan.bonus_tokens > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bonus Token:</span>
                        <span className="font-medium text-green-600">+{selectedPlan.bonus_tokens} token</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kode Unik:</span>
                      <span className="font-medium text-accent">+{uniqueCode}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Transfer:</span>
                      <span className="text-primary">Rp {(selectedPlan.price + uniqueCode).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                        Rp {(selectedPlan.price + uniqueCode).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        (Rp {selectedPlan.price.toLocaleString('id-ID')} + kode unik {uniqueCode})
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
                        <strong>Rp {(selectedPlan.price + uniqueCode).toLocaleString('id-ID')}</strong>
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
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                Pricing Plans
              </Badge>
              <h1 className="text-4xl font-bold mb-4">
                Pilih Paket yang Sesuai untuk Kebutuhan Anda
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Mulai gratis, upgrade kapan saja. Semua paket include AI-powered image enhancement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
              {loadingPlans ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : plans.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">Paket subscription tidak tersedia saat ini</p>
                </div>
              ) : (
                plans.map((plan) => {
                  const isPopular = plan.is_popular;
                  const isFree = plan.tier_id === 'free';

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
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4`} style={{ backgroundColor: plan.bg_color }}>
                          <Sparkles className="w-6 h-6" style={{ color: plan.color }} />
                        </div>
                        <CardTitle className="text-2xl">{plan.tier_name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          <div className="text-4xl font-bold">
                            {plan.price === 0 ? 'Gratis' : `Rp ${plan.price.toLocaleString('id-ID')}`}
                            {plan.price > 0 && (
                              <span className="text-lg font-normal text-muted-foreground">
                                /bulan
                              </span>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <div className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {plan.limitations && plan.limitations.length > 0 && (
                          <div className="space-y-2 pt-4 border-t">
                            {plan.limitations.map((limitation, index) => (
                              <div key={index} className="flex items-start gap-3 opacity-50">
                                <span className="text-sm">✗ {limitation}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button
                          className="w-full"
                          size="lg"
                          variant={isPopular ? 'default' : 'outline'}
                          onClick={() => handleSelectPlan(plan)}
                          disabled={isFree || loading === plan.tier_id}
                        >
                          {loading === plan.tier_id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              {isFree ? 'Paket Aktif' : `Pilih ${plan.tier_name}`}
                              {!isFree && <ArrowRight className="w-4 h-4 ml-2" />}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

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
