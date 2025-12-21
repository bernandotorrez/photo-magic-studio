import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Save, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancementPrompt {
  id: string;
  enhancement_type: string;
  display_name: string;
  prompt_template: string;
  description: string | null;
  is_active: boolean;
  category: string;
  sort_order: number;
  applicable_classifications: string[];
  supports_custom_prompt: boolean;
  created_at: string;
  updated_at: string;
}

export default function EnhancementPromptsManager() {
  const [prompts, setPrompts] = useState<EnhancementPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState<Partial<EnhancementPrompt>>({
    enhancement_type: '',
    display_name: '',
    prompt_template: '',
    description: '',
    is_active: true,
    category: 'general',
    sort_order: 0,
    applicable_classifications: [],
    supports_custom_prompt: false,
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('enhancement_prompts' as any)
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPrompts((data as any) || []);
    } catch (error: any) {
      toast.error('Failed to load enhancement prompts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      enhancement_type: '',
      display_name: '',
      prompt_template: '',
      description: '',
      is_active: true,
      category: 'general',
      sort_order: prompts.length,
      applicable_classifications: [],
      supports_custom_prompt: false,
    });
  };

  const handleEdit = (prompt: EnhancementPrompt) => {
    setEditingId(prompt.id);
    setFormData(prompt);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (!formData.enhancement_type || !formData.display_name || !formData.prompt_template) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (isCreating) {
        const { error } = await supabase
          .from('enhancement_prompts' as any)
          .insert([formData]);

        if (error) throw error;
        toast.success('Enhancement prompt created successfully');
      } else if (editingId) {
        const { error } = await supabase
          .from('enhancement_prompts' as any)
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Enhancement prompt updated successfully');
      }

      await fetchPrompts();
      handleCancel();
    } catch (error: any) {
      toast.error('Failed to save: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enhancement prompt?')) return;

    try {
      const { error } = await supabase
        .from('enhancement_prompts' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Enhancement prompt deleted successfully');
      await fetchPrompts();
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('enhancement_prompts' as any)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Enhancement ${!currentStatus ? 'activated' : 'deactivated'}`);
      await fetchPrompts();
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  // Filter prompts based on search and category
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = 
      prompt.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.enhancement_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.prompt_template.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || prompt.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPrompts = filteredPrompts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhancement Prompts Manager</h2>
          <p className="text-muted-foreground">
            Manage AI enhancement prompts for all categories ({prompts.length} total)
          </p>
        </div>
        <Button onClick={handleCreate} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Prompt
        </Button>
      </div>

      {/* Search and Filter */}
      {!isCreating && !editingId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, type, or prompt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="exterior">Exterior</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="hair_style_male">Hair Style Male</SelectItem>
                  <SelectItem value="hair_style_female">Hair Style Female</SelectItem>
                  <SelectItem value="makeup">Makeup</SelectItem>
                </SelectContent>
              </Select>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {(isCreating || editingId) && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{isCreating ? 'Create New' : 'Edit'} Enhancement Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enhancement_type">Enhancement Type *</Label>
                <Input
                  id="enhancement_type"
                  value={formData.enhancement_type || ''}
                  onChange={(e) => setFormData({ ...formData, enhancement_type: e.target.value })}
                  placeholder="e.g., modern_minimalist"
                  disabled={!isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name || ''}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="e.g., Modern Minimalist"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt_template">Prompt Template *</Label>
              <Textarea
                id="prompt_template"
                value={formData.prompt_template || ''}
                onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
                placeholder="Enter the AI prompt template..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short description for users"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || 'general'}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="exterior">Exterior</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="hair_style_male">Hair Style Male</SelectItem>
                    <SelectItem value="hair_style_female">Hair Style Female</SelectItem>
                    <SelectItem value="makeup">Makeup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order || 0}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Active</Label>
                <div className="flex items-center h-10">
                  <Switch
                    id="is_active"
                    checked={formData.is_active || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="supports_custom_prompt" className="text-base">
                    Supports Custom Prompt
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this if the enhancement supports custom user input (e.g., custom colors for makeup)
                  </p>
                </div>
                <Switch
                  id="supports_custom_prompt"
                  checked={formData.supports_custom_prompt || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, supports_custom_prompt: checked })}
                />
              </div>
              {formData.supports_custom_prompt && (
                <div className="mt-3 p-3 bg-background rounded border border-border">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> Use <code className="bg-muted px-1 py-0.5 rounded text-xs">{'{{customPrompt}}'}</code> placeholder in your prompt template where you want the custom input to be inserted.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Example:</strong> "Apply lipstick with custom color: {'{{customPrompt}}'}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DataTable */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead className="w-[200px]">Display Name</TableHead>
                  <TableHead className="w-[150px]">Type</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead>Prompt Template</TableHead>
                  <TableHead className="w-[100px]">Custom</TableHead>
                  <TableHead className="w-[80px]">Order</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPrompts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchQuery || categoryFilter !== 'all' 
                        ? 'No prompts found matching your filters'
                        : 'No enhancement prompts yet. Click "Add New Prompt" to create one.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPrompts.map((prompt) => (
                    <TableRow key={prompt.id} className={!prompt.is_active ? 'opacity-50' : ''}>
                      <TableCell>
                        <Switch
                          checked={prompt.is_active}
                          onCheckedChange={() => handleToggleActive(prompt.id, prompt.is_active)}
                          disabled={editingId !== null || isCreating}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{prompt.display_name}</div>
                          {prompt.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {prompt.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {prompt.enhancement_type}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {prompt.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm text-muted-foreground truncate">
                            {prompt.prompt_template}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {prompt.supports_custom_prompt ? (
                          <Badge variant="default" className="text-xs">
                            ✓ Yes
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-muted-foreground">{prompt.sort_order}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(prompt)}
                            disabled={editingId !== null || isCreating}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(prompt.id)}
                            disabled={editingId !== null || isCreating}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredPrompts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredPrompts.length)} of {filteredPrompts.length} prompts
                {(searchQuery || categoryFilter !== 'all') && ` (filtered from ${prompts.length} total)`}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
