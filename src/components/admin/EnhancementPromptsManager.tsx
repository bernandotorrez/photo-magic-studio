import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
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
  created_at: string;
  updated_at: string;
}

export default function EnhancementPromptsManager() {
  const [prompts, setPrompts] = useState<EnhancementPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<EnhancementPrompt>>({
    enhancement_type: '',
    display_name: '',
    prompt_template: '',
    description: '',
    is_active: true,
    category: 'general',
    sort_order: 0,
    applicable_classifications: [],
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

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhancement Prompts Manager</h2>
          <p className="text-muted-foreground">Manage AI enhancement prompts for all categories</p>
        </div>
        <Button onClick={handleCreate} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Prompt
        </Button>
      </div>

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

      <div className="grid gap-4">
        {['interior', 'exterior', 'fashion', 'furniture', 'general'].map((category) => {
          const categoryPrompts = prompts.filter((p) => p.category === category);
          if (categoryPrompts.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3 capitalize">{category} Enhancements</h3>
              <div className="grid gap-3">
                {categoryPrompts.map((prompt) => (
                  <Card key={prompt.id} className={!prompt.is_active ? 'opacity-60' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{prompt.display_name}</h4>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {prompt.enhancement_type}
                            </code>
                            <Switch
                              checked={prompt.is_active}
                              onCheckedChange={() => handleToggleActive(prompt.id, prompt.is_active)}
                            />
                          </div>
                          {prompt.description && (
                            <p className="text-sm text-muted-foreground mb-2">{prompt.description}</p>
                          )}
                          <p className="text-sm bg-muted p-3 rounded mt-2">{prompt.prompt_template}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(prompt)}
                            disabled={editingId !== null || isCreating}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(prompt.id)}
                            disabled={editingId !== null || isCreating}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
