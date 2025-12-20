import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Coins, CreditCard, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface TokenPricing {
  min_tokens: number;
  max_tokens: number | null;
  price_per_token: number;
  discount_percentage: number;
}

export default function TopUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(50);
  const [pricing, setPricing] = useState<TokenPricing[]>([]);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    const { data } = await supabase
      .from('token_pricing' as any)
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (data) setPricing(data as unknown as TokenPricing[]);
  };

  const calculatePrice = () => {
    if (!pricing || pricing.length === 0) {
      // Default pricing if not loaded yet
      return { total: tokenAmount * 1000, perToken: 1000, discount: 0 };
    }

    const tier = pricing.find(p => 
      tokenAmount >= p.min_tokens && 
      (p.max_tokens === null || tokenAmount <= p.max_tokens)
    );
    
    if (!tier) {
      // Fallback to default
      return { total: tokenAmount * 1000, perToken: 1000, discount: 0 };
    }
    
    return {
      total: tokenAmount * tier.price_per_token,
      perToken: tier.price_per_token,
      discount: tier.discount_percentage
    };
  };

  const price = calculatePrice();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const uploadProof = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

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

  const handleSubmit = async () => {
    if (!paymentProof) {
      toast.error('Please upload payment proof');
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login first');
        navigate('/auth');
        return;
      }

      // Upload proof
      const proofUrl = await uploadProof(paymentProof);
      if (!proofUrl) {
        toast.error('Failed to upload payment proof');
        return;
      }

      // Create payment record
      const { error } = await supabase
        .from('payments' as any)
        .insert({
          user_id: user.id,
          user_email: user.email,
          amount: price.total,
          tokens_purchased: tokenAmount,
          price_per_token: price.perToken,
          payment_method: 'bank_transfer',
          payment_status: 'pending',
          payment_proof_url: proofUrl,
          bank_name: 'BCA',
          account_name: 'Bernand Dayamuntari Hermawan',
          account_number: '2040239483',
          transfer_date: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Payment submitted! Waiting for admin verification.');
      navigate('/payment-history');
    } catch (error: any) {
      toast.error('Failed to submit payment: ' + error.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Top Up Token</h1>
          <p className="text-muted-foreground">
            Beli token generate tambahan untuk akun Anda. Konfirmasi pembayaran maksimal 1 hari kerja.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Token Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Pilih Jumlah Token
                </CardTitle>
                <CardDescription>
                  Pilih berapa token yang ingin Anda beli
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tokens">Jumlah Token</Label>
                  <Input
                    id="tokens"
                    type="number"
                    min="1"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(parseInt(e.target.value) || 1)}
                  />
                </div>

                {/* Pricing Tiers */}
                <div className="space-y-2">
                  <Label>Harga Bertingkat</Label>
                  {pricing.map((tier, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        tokenAmount >= tier.min_tokens &&
                        (tier.max_tokens === null || tokenAmount <= tier.max_tokens)
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {tier.min_tokens} - {tier.max_tokens || '∞'} token
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Rp {tier.price_per_token.toLocaleString('id-ID')} per token
                          </p>
                        </div>
                        {tier.discount_percentage > 0 && (
                          <Badge variant="secondary">
                            Hemat {tier.discount_percentage}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Token:</span>
                    <span className="font-medium">{tokenAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Harga per token:</span>
                    <span className="font-medium">
                      Rp {price.perToken.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {price.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Diskon:</span>
                      <span className="font-medium">{price.discount}%</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      Rp {price.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Payment Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Instruksi Pembayaran
                </CardTitle>
                <CardDescription>
                  Transfer ke rekening bank berikut
                </CardDescription>
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
                    <p className="text-xl font-mono font-bold tracking-wider">
                      2040239483
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Jumlah Transfer</Label>
                    <p className="text-2xl font-bold text-primary">
                      Rp {price.total.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proof">Upload Bukti Transfer *</Label>
                  <Input
                    id="proof"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {paymentProof && (
                    <p className="text-sm text-muted-foreground">
                      Terpilih: {paymentProof.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Langkah-langkah:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Transfer sejumlah <strong>Rp {price.total.toLocaleString('id-ID')}</strong> ke rekening BCA <strong>2040239483</strong> a.n. <strong>Bernand Dayamuntari Hermawan</strong></li>
                    <li>Screenshot bukti transfer dari mobile banking Anda</li>
                    <li>Upload screenshot sebagai bukti pembayaran di form ini</li>
                    <li>Klik tombol "Submit Pembayaran" dan tunggu verifikasi admin</li>
                    <li>Konfirmasi pembayaran maksimal <strong>1 hari kerja</strong></li>
                  </ol>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !paymentProof}
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

            {/* Status Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informasi Status Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Pending (Menunggu)</p>
                    <p className="text-muted-foreground">Pembayaran Anda sedang dalam proses verifikasi oleh admin. Konfirmasi maksimal 1 hari kerja.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                  <div>
                    <p className="font-medium">Disetujui (Approved)</p>
                    <p className="text-muted-foreground">Pembayaran berhasil diverifikasi. Token sudah ditambahkan ke akun Anda dan siap digunakan.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-red-500" />
                  <div>
                    <p className="font-medium">Ditolak (Rejected)</p>
                    <p className="text-muted-foreground">Verifikasi pembayaran gagal. Silakan hubungi admin atau coba lagi dengan bukti transfer yang valid.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
