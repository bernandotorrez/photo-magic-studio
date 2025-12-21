import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { 
  Sparkles, 
  Wand2, 
  Image, 
  Zap, 
  Shield, 
  History,
  ArrowRight,
  Check,
  Coins
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

const features = [
  {
    icon: Coins,
    title: 'Pay as You Go',
    description: 'Butuh hanya 1 optimasi gambar? Kamu bisa beli 1 token saja seharga Rp. 1.000! Tidak perlu komitmen berlangganan yang mahal.',
  },
  {
    icon: Image,
    title: 'Upload Gambar',
    description: 'Upload foto produk Anda dengan mudah, support berbagai format gambar.',
  },
  {
    icon: Sparkles,
    title: 'AI Classification',
    description: 'AI otomatis mengenali jenis gambar dan memberikan opsi enhancement yang sesuai.',
  },
  {
    icon: Wand2,
    title: 'Smart Enhancement',
    description: 'Pilih dari berbagai opsi enhancement yang dinamis sesuai kategori gambar.',
  },
  {
    icon: Zap,
    title: 'Generate Instan',
    description: 'Hasil generate gambar dalam hitungan detik dengan teknologi AI terkini.',
  },
  {
    icon: Shield,
    title: 'API Access',
    description: 'Integrasikan ke sistem Anda dengan API key management yang aman.',
  },
  {
    icon: History,
    title: 'Riwayat Generate',
    description: 'Simpan dan akses kembali semua hasil generate Anda kapan saja.',
  },
];

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

export default function Index() {
  const { user } = useAuth();
  const [pricingPlans, setPricingPlans] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      // Use RPC function to get active tiers
      const { data, error } = await supabase
        .rpc('get_active_subscription_tiers');

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      console.log('Fetched pricing plans:', data);
      setPricingPlans((data as any) || []);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      // Fallback to default plans if error
      setPricingPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Rp 0';
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const isHighlighted = (isPopular: boolean) => {
    return isPopular;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-3 sm:px-4 h-20 sm:h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="lg" className="scale-100 sm:scale-110 md:scale-125" />
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm" className="text-xs sm:text-sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Masuk</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                    <span className="hidden xs:inline">Mulai </span>Gratis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-3 sm:px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-[250px] sm:w-[400px] md:w-[500px] h-[250px] sm:h-[400px] md:h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] bg-accent/20 rounded-full blur-[100px] animate-pulse-slow" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center px-2">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/20 text-primary-foreground/90 text-xs sm:text-sm mb-4 sm:mb-6 animate-slide-up">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-4 sm:mb-6 leading-tight animate-slide-up-delay-1">
              PixelNova AI
              <br />
              <span className="gradient-text">Upgrade Every Pixel</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-primary-foreground/70 mb-6 sm:mb-8 max-w-2xl mx-auto animate-slide-up-delay-2 px-2">
              Enhance images instantly with AI-powered precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-up-delay-3 px-2">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                  Coba Gratis Sekarang
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                Lihat Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Fitur <span className="gradient-text">Unggulan</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Semua yang Anda butuhkan untuk meningkatkan kualitas foto produk
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group p-4 sm:p-5 md:p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center mb-3 sm:mb-4 group-hover:shadow-glow transition-shadow">
                  <feature.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Pilih <span className="gradient-text">Paket</span> Anda
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Mulai gratis dan upgrade kapan saja sesuai kebutuhan. Semua paket bisa top up token tambahan!
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pricingPlans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Pricing plans tidak tersedia saat ini</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => {
                const highlighted = isHighlighted(plan.is_popular);
                const totalTokens = plan.tokens + plan.bonus_tokens;
                
                return (
                  <div 
                    key={plan.id}
                    className={`p-4 sm:p-5 md:p-6 rounded-2xl border-2 transition-all duration-300 ${
                      highlighted 
                        ? 'border-primary bg-card shadow-xl shadow-primary/10 sm:scale-105' 
                        : 'border-border/50 bg-card hover:border-primary/30'
                    }`}
                  >
                    {highlighted && (
                      <div className="text-[10px] sm:text-xs font-semibold text-primary mb-3 sm:mb-4 uppercase tracking-wide">
                        Paling Populer
                      </div>
                    )}
                    <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">{plan.tier_name}</h3>
                    <div className="mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl font-extrabold">{formatPrice(plan.price)}</span>
                      <span className="text-sm sm:text-base text-muted-foreground">/bulan</span>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                      {plan.tokens} generate/bulan
                      {plan.bonus_tokens > 0 && (
                        <span className="text-green-600 font-medium"> +{plan.bonus_tokens} bonus</span>
                      )}
                    </div>
                    <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/auth">
                      <Button 
                        className="w-full text-sm" 
                        variant={highlighted ? 'hero' : 'outline'}
                        size="sm"
                      >
                        Pilih Paket
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Top Up Info */}
          <div className="mt-10 sm:mt-12 md:mt-16 max-w-3xl mx-auto">
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold mb-2">Top Up Token Tambahan</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    Kehabisan token? Tidak perlu upgrade paket! Anda bisa membeli token tambahan kapan saja dengan sistem top up.
                  </p>
                  
                  {/* Pricing Tiers */}
                  <div className="mb-3 p-3 bg-background/50 rounded-lg space-y-1.5">
                    <p className="text-xs font-semibold text-foreground mb-2">Harga Token:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">1-100</Badge>
                        <span className="text-muted-foreground">Rp 1.000/token</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">101-200</Badge>
                        <span className="text-muted-foreground">Rp 950/token</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">201+</Badge>
                        <span className="text-muted-foreground">Rp 900/token</span>
                      </div>
                    </div>
                  </div>

                  {/* <div className="space-y-1.5 text-xs sm:text-sm">
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      <span>Transfer ke rekening <strong>BCA 2040239483</strong> a.n. <strong>Bernand Dayamuntari Hermawan</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      <span>Upload bukti transfer untuk konfirmasi pembayaran</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      <span>Konfirmasi pembayaran maksimal <strong>1 hari kerja</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" />
                      <span>Token langsung masuk ke akun Anda setelah diverifikasi</span>
                    </p>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl gradient-hero relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-primary/30 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-accent/30 rounded-full blur-[80px]" />
            </div>
            
            <div className="relative z-10 px-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 sm:mb-4">
                Siap Meningkatkan Foto Produk Anda?
              </h2>
              <p className="text-primary-foreground/70 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Bergabung dengan ribuan seller yang sudah menggunakan PixelNova AI untuk meningkatkan penjualan mereka.
              </p>
              <Link to="/auth">
                <Button variant="hero" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                  Mulai Sekarang - Gratis
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-3 sm:px-4 border-t border-border/50">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <Logo size="sm" />
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                © 2025 PixelNova AI. All rights reserved.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Butuh Bantuan? Hubungi WhatsApp{' '}
                <a 
                  href="https://wa.me/6289687610639" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  +62 896-8761-0639
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
