import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Mail, Lock, User, ArrowLeft, AlertTriangle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { isDisposableEmail, isValidEmailProvider } from '@/lib/disposable-emails';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/Logo';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { strongPasswordSchema } from '@/lib/password-validator';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const emailSchema = z.string().email('Email tidak valid');
const nameSchema = z.string().min(2, 'Nama minimal 2 karakter').optional();

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
        theme?: 'light' | 'dark';
        size?: 'normal' | 'compact';
      }) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
  }
}

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingCaptcha, setIsVerifyingCaptcha] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  const loginCaptchaRef = useRef<HTMLDivElement>(null);
  const registerCaptchaRef = useRef<HTMLDivElement>(null);
  const loginWidgetId = useRef<number | null>(null);
  const registerWidgetId = useRef<number | null>(null);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load reCAPTCHA script
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn('reCAPTCHA site key not configured');
      setCaptchaLoaded(true);
      return;
    }

    const scriptId = 'recaptcha-script';
    if (document.getElementById(scriptId)) {
      setCaptchaLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;

    (window as any).onRecaptchaLoad = () => {
      setCaptchaLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
      delete (window as any).onRecaptchaLoad;
    };
  }, []);

  // Render CAPTCHA widgets when loaded and tab changes
  const renderCaptcha = useCallback(() => {
    if (!captchaLoaded || !window.grecaptcha || !RECAPTCHA_SITE_KEY) return;

    try {
      // Clear and render login CAPTCHA
      if (activeTab === 'login' && loginCaptchaRef.current) {
        // Clear existing widget
        if (loginWidgetId.current !== null) {
          loginCaptchaRef.current.innerHTML = '';
          loginWidgetId.current = null;
        }
        
        // Render new widget
        loginWidgetId.current = window.grecaptcha.render(loginCaptchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token: string) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(null),
          'error-callback': () => setCaptchaToken(null),
          theme: 'light',
          size: 'normal',
        });
      }

      // Clear and render register CAPTCHA
      if (activeTab === 'register' && registerCaptchaRef.current) {
        // Clear existing widget
        if (registerWidgetId.current !== null) {
          registerCaptchaRef.current.innerHTML = '';
          registerWidgetId.current = null;
        }
        
        // Render new widget
        registerWidgetId.current = window.grecaptcha.render(registerCaptchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token: string) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(null),
          'error-callback': () => setCaptchaToken(null),
          theme: 'light',
          size: 'normal',
        });
      }
    } catch (error) {
      console.error('Error rendering reCAPTCHA:', error);
    }
  }, [captchaLoaded, activeTab]);

  useEffect(() => {
    if (captchaLoaded && window.grecaptcha) {
      window.grecaptcha.ready(() => {
        renderCaptcha();
      });
    }
  }, [captchaLoaded, activeTab, renderCaptcha]);

  // Reset CAPTCHA token when switching tabs
  useEffect(() => {
    setCaptchaToken(null);
  }, [activeTab]);

  const validateForm = (isSignUp: boolean) => {
    const newErrors: Record<string, string> = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    } else if (isSignUp) {
      // Check for disposable email during signup
      if (isDisposableEmail(email)) {
        newErrors.email = 'Email disposable/temporary tidak diperbolehkan. Gunakan email resmi seperti Gmail, Yahoo, Outlook, atau email kantor.';
      } else if (!isValidEmailProvider(email)) {
        newErrors.email = 'Email tidak valid. Gunakan email resmi.';
      }
    }
    
    // Use strong password validation for signup, simple validation for login
    if (isSignUp) {
      const passwordResult = strongPasswordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    } else {
      // For login, just check if password is not empty
      if (!password || password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }
    }
    
    if (isSignUp && fullName) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.fullName = nameResult.error.errors[0].message;
      }
    }

    // Check CAPTCHA
    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      newErrors.captcha = 'Silakan selesaikan verifikasi CAPTCHA';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const verifyCaptcha = async (token: string): Promise<boolean> => {
    if (!RECAPTCHA_SITE_KEY) return true;
    
    setIsVerifyingCaptcha(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { token },
      });

      if (error) {
        console.error('CAPTCHA verification error:', error);
        return false;
      }

      return data?.success === true;
    } catch (error) {
      console.error('CAPTCHA verification failed:', error);
      return false;
    } finally {
      setIsVerifyingCaptcha(false);
    }
  };

  const checkRateLimit = async (checkEmail: string): Promise<{ isBlocked: boolean; remaining: number }> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { email: checkEmail, checkOnly: true },
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return { isBlocked: false, remaining: 5 };
      }

      return {
        isBlocked: data?.isBlocked || false,
        remaining: data?.remainingAttempts ?? 5,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { isBlocked: false, remaining: 5 };
    }
  };

  const recordLoginAttempt = async (attemptEmail: string): Promise<void> => {
    try {
      const { data } = await supabase.functions.invoke('verify-captcha', {
        body: { email: attemptEmail },
      });
      
      if (data?.remainingAttempts !== undefined) {
        setRemainingAttempts(data.remainingAttempts);
      }
      if (data?.isBlocked) {
        setIsRateLimited(true);
      }
    } catch (error) {
      console.error('Failed to record login attempt:', error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setIsLoading(true);

    try {
      // Check rate limit first
      const { isBlocked, remaining } = await checkRateLimit(email);
      if (isBlocked) {
        setIsRateLimited(true);
        setRemainingAttempts(0);
        toast({
          title: 'Terlalu Banyak Percobaan',
          description: 'Akun Anda terkunci sementara. Silakan coba lagi dalam 15 menit.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      setRemainingAttempts(remaining);

      // Verify CAPTCHA
      if (RECAPTCHA_SITE_KEY && captchaToken) {
        const captchaValid = await verifyCaptcha(captchaToken);
        if (!captchaValid) {
          toast({
            title: 'Verifikasi Gagal',
            description: 'CAPTCHA tidak valid. Silakan coba lagi.',
            variant: 'destructive',
          });
          // Reset CAPTCHA
          if (loginWidgetId.current !== null && window.grecaptcha) {
            window.grecaptcha.reset(loginWidgetId.current);
          }
          setCaptchaToken(null);
          setIsLoading(false);
          return;
        }
      }
      
      const { error } = await signIn(email, password);
      
      if (error) {
        // Record failed login attempt
        await recordLoginAttempt(email);

        let errorMessage = error.message;
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'Email atau password salah';
        } else if (error.message === 'Email not confirmed') {
          errorMessage = 'Email belum diverifikasi. Silakan cek inbox email Anda.';
        }

        toast({
          title: 'Login Gagal',
          description: errorMessage,
          variant: 'destructive',
        });

        // Reset CAPTCHA
        if (loginWidgetId.current !== null && window.grecaptcha) {
          window.grecaptcha.reset(loginWidgetId.current);
        }
        setCaptchaToken(null);
      } else {
        toast({
          title: 'Berhasil Login',
          description: 'Selamat datang kembali!',
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setIsLoading(true);

    try {
      // Verify CAPTCHA
      if (RECAPTCHA_SITE_KEY && captchaToken) {
        const captchaValid = await verifyCaptcha(captchaToken);
        if (!captchaValid) {
          toast({
            title: 'Verifikasi Gagal',
            description: 'CAPTCHA tidak valid. Silakan coba lagi.',
            variant: 'destructive',
          });
          // Reset CAPTCHA
          if (registerWidgetId.current !== null && window.grecaptcha) {
            window.grecaptcha.reset(registerWidgetId.current);
          }
          setCaptchaToken(null);
          setIsLoading(false);
          return;
        }
      }
      
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: 'Email Sudah Terdaftar',
            description: 'Silakan login atau gunakan email lain.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Registrasi Gagal',
            description: error.message,
            variant: 'destructive',
          });
        }
        // Reset CAPTCHA
        if (registerWidgetId.current !== null && window.grecaptcha) {
          window.grecaptcha.reset(registerWidgetId.current);
        }
        setCaptchaToken(null);
      } else {
        toast({
          title: 'Registrasi Berhasil',
          description: 'Silakan cek email Anda untuk verifikasi akun.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
        
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Logo size="xl" />
            </div>
            <CardDescription>
              Platform AI untuk mempercantik foto produk Anda
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isRateLimited && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Terlalu banyak percobaan login. Silakan tunggu 15 menit sebelum mencoba lagi.
                </AlertDescription>
              </Alert>
            )}

            {remainingAttempts !== null && remainingAttempts <= 2 && !isRateLimited && (
              <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
                <Shield className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-600">
                  Sisa {remainingAttempts} percobaan login sebelum akun terkunci sementara.
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Masuk</TabsTrigger>
                <TabsTrigger value="register">Daftar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isRateLimited}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isRateLimited}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  {RECAPTCHA_SITE_KEY && (
                    <div className="space-y-2">
                      <div ref={loginCaptchaRef} className="flex justify-center" />
                      {errors.captcha && <p className="text-sm text-destructive text-center">{errors.captcha}</p>}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg" 
                    disabled={isLoading || isVerifyingCaptcha || isRateLimited}
                  >
                    {isVerifyingCaptcha ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Memverifikasi CAPTCHA...
                      </>
                    ) : isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Memproses Login...
                      </>
                    ) : (
                      'Masuk'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    <p className="text-xs text-muted-foreground">
                      Gunakan email resmi (Gmail, Yahoo, Outlook, atau email kantor)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    
                    {/* Password Requirements Info */}
                    {!password && (
                      <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-md">
                        <p className="font-medium text-foreground mb-1">Password harus mengandung:</p>
                        <ul className="space-y-0.5 ml-1">
                          <li>• Minimal 8 karakter</li>
                          <li>• Minimal 1 huruf besar (A-Z)</li>
                          <li>• Minimal 1 huruf kecil (a-z)</li>
                          <li>• Minimal 1 angka (0-9)</li>
                          <li>• Minimal 1 simbol (!@#$%^&*)</li>
                        </ul>
                      </div>
                    )}
                    
                    {/* Password Strength Indicator */}
                    <PasswordStrengthIndicator password={password} show={password.length > 0} />
                  </div>

                  {RECAPTCHA_SITE_KEY && (
                    <div className="space-y-2">
                      <div ref={registerCaptchaRef} className="flex justify-center" />
                      {errors.captcha && <p className="text-sm text-destructive text-center">{errors.captcha}</p>}
                    </div>
                  )}
                  
                  <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading || isVerifyingCaptcha}>
                    {isVerifyingCaptcha ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Memverifikasi CAPTCHA...
                      </>
                    ) : isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Memproses Registrasi...
                      </>
                    ) : (
                      'Daftar Sekarang'
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Setelah mendaftar, Anda akan menerima email verifikasi.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
