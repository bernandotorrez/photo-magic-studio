import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { generateInvoicePDF } from '@/lib/invoiceGenerator';

interface Payment {
  id: string;
  user_email: string;
  amount: number;
  unique_code: number;
  amount_with_code: number;
  tokens_purchased: number;
  bonus_tokens: number;
  price_per_token: number;
  payment_status: string;
  payment_method: string;
  subscription_plan: string;
  token_type: string;
  invoice_no: string | null;
  created_at: string;
  verified_at: string;
}

export default function MyPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments' as any)
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments((data as any) || []);
    } catch (error: any) {
      toast.error('Gagal memuat pembayaran: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (payment: Payment) => {
    setDownloading(payment.id);
    try {
      // Get user profile for full name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user?.id)
        .single();

      await generateInvoicePDF(payment, profile?.full_name || user?.email || 'Customer');
      toast.success('Invoice berhasil didownload');
    } catch (error: any) {
      toast.error('Gagal download invoice: ' + error.message);
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Menunggu
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-500 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Lunas
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentType = (payment: Payment) => {
    if (payment.token_type === 'subscription' && payment.subscription_plan) {
      return `Paket ${payment.subscription_plan.replace('_', ' ').toUpperCase()}`;
    }
    return 'Top-Up Token';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Pembayaran Saya</h1>
          <p className="text-muted-foreground">
            Riwayat semua pembayaran Anda
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Riwayat Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Belum ada pembayaran</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Riwayat pembayaran akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Invoice</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Download</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.invoice_no || `INV-${payment.id.substring(0, 8).toUpperCase()}`}
                        </TableCell>
                        <TableCell>
                          {format(new Date(payment.created_at), 'dd MMM yyyy', { locale: idLocale })}
                        </TableCell>
                        <TableCell>{getPaymentType(payment)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{payment.tokens_purchased}</span>
                            {payment.bonus_tokens > 0 && (
                              <span className="text-green-600 text-sm">+{payment.bonus_tokens}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          Rp {payment.amount_with_code.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>
                        <TableCell className="text-right">
                          {payment.payment_status === 'approved' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPDF(payment)}
                              disabled={downloading === payment.id}
                            >
                              {downloading === payment.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </>
                              )}
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
