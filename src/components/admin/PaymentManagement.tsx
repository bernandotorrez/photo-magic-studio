import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Clock, CheckCircle2, XCircle, ExternalLink, Coins } from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
  id: string;
  user_email: string;
  amount: number;
  unique_code?: number;
  amount_with_code?: number;
  bonus_tokens?: number;
  tokens_purchased: number;
  price_per_token: number;
  payment_status: string;
  payment_proof_url: string;
  bank_name: string;
  account_number: string;
  transfer_date: string;
  admin_notes: string | null;
  created_at: string;
  subscription_plan?: string;
}

interface SubscriptionTier {
  tier_id: string;
  bonus_tokens: number;
}

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);

  useEffect(() => {
    fetchPayments();
    fetchSubscriptionTiers();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      toast.error('Failed to load payments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers' as any)
        .select('tier_id, bonus_tokens');

      if (error) throw error;
      setSubscriptionTiers(data || []);
    } catch (error: any) {
      console.error('Failed to load subscription tiers:', error);
    }
  };

  const calculateBonusFromUniqueCode = (uniqueCode: number): number => {
    // Bonus token dari kode unik = unique_code / 1000 (rounded down)
    // Example: 1456 → 1 token, 456 → 0 token, 1999 → 1 token
    return Math.floor(uniqueCode / 1000);
  };

  const getBonusTokenBreakdown = (payment: Payment) => {
    // Get bonus from package (from subscription_tiers)
    let bonusFromPackage = 0;
    if (payment.subscription_plan) {
      const tier = subscriptionTiers.find(t => t.tier_id === payment.subscription_plan);
      bonusFromPackage = tier?.bonus_tokens || 0;
    }

    // Calculate bonus from unique code
    const bonusFromUniqueCode = payment.unique_code ? calculateBonusFromUniqueCode(payment.unique_code) : 0;

    // Total bonus
    const totalBonus = bonusFromPackage + bonusFromUniqueCode;

    // If no bonus at all, return null
    if (totalBonus === 0) return null;

    return {
      total: totalBonus,
      fromPackage: bonusFromPackage,
      fromUniqueCode: bonusFromUniqueCode
    };
  };

  const handleApprove = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const payment = payments.find(p => p.id === paymentId);
      
      // Call process_approved_payment function
      // This function will:
      // 1. Find payment with status='pending'
      // 2. Add tokens to user (including bonus)
      // 3. Update payment status to 'approved'
      const { error: processError } = await supabase
        .rpc('process_approved_payment' as any, { payment_id: paymentId });

      if (processError) throw processError;

      // Update admin notes if provided
      if (notes[paymentId]) {
        const { error: notesError } = await supabase
          .from('payments' as any)
          .update({ admin_notes: notes[paymentId] })
          .eq('id', paymentId);
        
        if (notesError) console.error('Failed to update notes:', notesError);
      }

      const breakdown = payment ? getBonusTokenBreakdown(payment) : null;
      let message = 'Payment approved and tokens added to user account';
      
      if (breakdown && breakdown.total > 0) {
        const parts = [];
        if (breakdown.fromPackage > 0) parts.push(`${breakdown.fromPackage} dari paket`);
        if (breakdown.fromUniqueCode > 0) parts.push(`${breakdown.fromUniqueCode} dari kode unik`);
        message = `Payment approved! Bonus: +${breakdown.total} token (${parts.join(' dan ')})`;
      }
      
      toast.success(message);
      await fetchPayments();
    } catch (error: any) {
      toast.error('Failed to approve payment: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!notes[paymentId]) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessingId(paymentId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('payments')
        .update({
          payment_status: 'rejected',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          admin_notes: notes[paymentId]
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Payment rejected');
      await fetchPayments();
    } catch (error: any) {
      toast.error('Failed to reject payment: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingPayments = payments.filter(p => p.payment_status === 'pending');
  const processedPayments = payments.filter(p => p.payment_status !== 'pending');

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment Management</h2>
        <p className="text-muted-foreground">
          Review and approve token purchase payments
        </p>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Pending Payments ({pendingPayments.length})
          </h3>
          <div className="space-y-4">
            {pendingPayments.map((payment) => (
              <Card key={payment.id} className="border-yellow-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="w-5 h-5" />
                        {payment.tokens_purchased} Tokens
                      </CardTitle>
                      <CardDescription>{payment.user_email}</CardDescription>
                    </div>
                    {getStatusBadge(payment.payment_status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Subtotal</p>
                      <p className="font-medium">
                        Rp {payment.amount.toLocaleString('id-ID')}
                      </p>
                      {payment.unique_code && (
                        <p className="text-xs text-accent font-mono">
                          + {payment.unique_code}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Transfer</p>
                      <p className="font-bold text-primary">
                        Rp {(payment.amount_with_code || payment.amount).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bank</p>
                      <p className="font-medium">{payment.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium">
                        {format(new Date(payment.created_at), 'PP')}
                      </p>
                    </div>
                  </div>

                  {payment.payment_proof_url && (
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(payment.payment_proof_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Payment Proof
                      </Button>
                    </div>
                  )}

                  {(() => {
                    const breakdown = getBonusTokenBreakdown(payment);
                    if (!breakdown) return null;

                    return (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 font-medium">
                          🎁 Bonus Token Otomatis: +{breakdown.total} token
                        </p>
                        <div className="text-xs text-green-600 mt-1 space-y-0.5">
                          {breakdown.fromPackage > 0 && (
                            <p>• +{breakdown.fromPackage} token dari paket berlangganan</p>
                          )}
                          {breakdown.fromUniqueCode > 0 && payment.unique_code && (
                            <p>• +{breakdown.fromUniqueCode} token dari kode unik {payment.unique_code} (kelipatan 1.000)</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${payment.id}`}>Admin Notes</Label>
                    <Textarea
                      id={`notes-${payment.id}`}
                      placeholder="Add notes (required for rejection)"
                      value={notes[payment.id] || ''}
                      onChange={(e) =>
                        setNotes({ ...notes, [payment.id]: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(payment.id)}
                      disabled={processingId === payment.id}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(payment.id)}
                      disabled={processingId === payment.id}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed Payments */}
      {processedPayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Payment History</h3>
          <div className="space-y-4">
            {processedPayments.map((payment) => (
              <Card key={payment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        {payment.tokens_purchased} Tokens
                        {payment.bonus_tokens > 0 && (
                          <span className="text-green-600"> +{payment.bonus_tokens} Bonus</span>
                        )}
                        {' '}- {payment.user_email}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(payment.created_at), 'PPP')}
                      </CardDescription>
                    </div>
                    {getStatusBadge(payment.payment_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Subtotal</p>
                      <p className="font-medium">
                        Rp {payment.amount.toLocaleString('id-ID')}
                      </p>
                      {payment.unique_code && (
                        <p className="text-xs text-accent font-mono">
                          + {payment.unique_code}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Transfer</p>
                      <p className="font-bold text-primary">
                        Rp {(payment.amount_with_code || payment.amount).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bank</p>
                      <p className="font-medium">{payment.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{payment.payment_status}</p>
                    </div>
                  </div>
                  {(() => {
                    const breakdown = getBonusTokenBreakdown(payment);
                    if (!breakdown) return null;

                    return (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                        <p className="font-medium text-green-700">
                          🎁 Bonus Token: +{breakdown.total} token
                        </p>
                        <div className="text-xs text-green-600 mt-1 space-y-0.5">
                          {breakdown.fromPackage > 0 && (
                            <p>• +{breakdown.fromPackage} token dari paket</p>
                          )}
                          {breakdown.fromUniqueCode > 0 && payment.unique_code && (
                            <p>• +{breakdown.fromUniqueCode} token dari kode unik {payment.unique_code}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  {payment.admin_notes && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <p className="font-medium">Notes:</p>
                      <p className="text-muted-foreground">{payment.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {payments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Coins className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No payments yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
