import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Generation {
  id: string;
  user_id: string;
  original_image_path: string;
  generated_image_path: string;
  enhancement_type: string;
  classification_result: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export function GenerationsHistory() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [filteredGenerations, setFilteredGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchGenerations();
  }, []);

  useEffect(() => {
    filterGenerations();
  }, [generations, searchQuery]);

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      
      // Fetch generations with user info
      const { data: generationsData, error: genError } = await supabase
        .from('generation_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (genError) throw genError;

      // Get unique user IDs
      const userIds = [...new Set((generationsData || []).map(g => g.user_id))];

      // Fetch user emails
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('Error fetching users:', userError);
      }

      // Fetch profiles for names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      // Merge data
      const enrichedGenerations = (generationsData || []).map(gen => {
        const user = users?.find((u: any) => u.id === gen.user_id);
        const profile = profiles?.find(p => p.user_id === gen.user_id);
        
        return {
          ...gen,
          user_email: user?.email || 'Unknown',
          user_name: profile?.full_name || 'Unknown',
        };
      });

      setGenerations(enrichedGenerations);
    } catch (error) {
      console.error('Error fetching generations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch generation history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterGenerations = () => {
    if (!searchQuery) {
      setFilteredGenerations(generations);
      return;
    }

    const filtered = generations.filter(
      (gen) =>
        gen.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gen.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gen.enhancement_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gen.classification_result.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredGenerations(filtered);
  };

  const getClassificationColor = (classification: string) => {
    const colors: Record<string, string> = {
      clothing: 'bg-blue-500',
      shoes: 'bg-green-500',
      accessories: 'bg-purple-500',
      electronics: 'bg-yellow-500',
      furniture: 'bg-orange-500',
    };
    return colors[classification.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Generation History</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              All image enhancements across platform
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGenerations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, enhancement type, or classification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Enhancement</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredGenerations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No generations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGenerations.map((gen) => (
                  <TableRow key={gen.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{gen.user_name}</div>
                        <div className="text-xs text-muted-foreground">{gen.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`${getClassificationColor(gen.classification_result)} text-white`}
                      >
                        {gen.classification_result}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-[200px] truncate">
                        {gen.enhancement_type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(gen.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(gen.created_at), 'HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Open image in new tab (if needed)
                          toast({
                            title: 'Image Path',
                            description: gen.generated_image_path,
                          });
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredGenerations.length} of {generations.length} generations
        </div>
      </CardContent>
    </Card>
  );
}
