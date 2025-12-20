import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link2, Unlink } from 'lucide-react';

interface Category {
  id: string;
  category_code: string;
  category_name: string;
  icon: string;
}

interface Enhancement {
  id: string;
  enhancement_type: string;
  display_name: string;
  category: string;
}

interface Mapping {
  category_id: string;
  enhancement_id: string;
}

export default function CategoryEnhancementMapper() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('image_categories' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      // Fetch enhancements
      const { data: enhancementsData } = await supabase
        .from('enhancement_prompts' as any)
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      // Fetch mappings
      const { data: mappingsData } = await supabase
        .from('category_enhancements' as any)
        .select('category_id, enhancement_id');

      setCategories((categoriesData as any) || []);
      setEnhancements((enhancementsData as any) || []);
      setMappings((mappingsData as any) || []);

      if (categoriesData && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isMapped = (categoryId: string, enhancementId: string): boolean => {
    return mappings.some(
      (m) => m.category_id === categoryId && m.enhancement_id === enhancementId
    );
  };

  const toggleMapping = async (categoryId: string, enhancementId: string) => {
    const mapped = isMapped(categoryId, enhancementId);

    try {
      if (mapped) {
        // Remove mapping
        const { error } = await supabase
          .from('category_enhancements' as any)
          .delete()
          .eq('category_id', categoryId)
          .eq('enhancement_id', enhancementId);

        if (error) throw error;

        setMappings(
          mappings.filter(
            (m) => !(m.category_id === categoryId && m.enhancement_id === enhancementId)
          )
        );
        toast.success('Enhancement removed from category');
      } else {
        // Add mapping
        const { error } = await supabase
          .from('category_enhancements' as any)
          .insert({
            category_id: categoryId,
            enhancement_id: enhancementId,
            sort_order: mappings.filter((m) => m.category_id === categoryId).length,
          });

        if (error) throw error;

        setMappings([...mappings, { category_id: categoryId, enhancement_id: enhancementId }]);
        toast.success('Enhancement added to category');
      }
    } catch (error: any) {
      toast.error('Failed to update mapping: ' + error.message);
    }
  };

  const getMappedCount = (categoryId: string): number => {
    return mappings.filter((m) => m.category_id === categoryId).length;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);
  const groupedEnhancements = enhancements.reduce((acc: any, enh) => {
    if (!acc[enh.category]) {
      acc[enh.category] = [];
    }
    acc[enh.category].push(enh);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Category-Enhancement Mapping</h2>
        <p className="text-muted-foreground">
          Map which enhancements are available for each image category
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Select a category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="mr-2">{category.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{category.category_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {getMappedCount(category.id)} enhancements
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Enhancements List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {selectedCategoryData?.icon} {selectedCategoryData?.category_name}
            </CardTitle>
            <CardDescription>
              Select enhancements available for this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCategory && (
              <div className="space-y-6">
                {Object.entries(groupedEnhancements).map(([category, enhs]: [string, any]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold mb-3 capitalize">{category}</h3>
                    <div className="grid gap-2">
                      {enhs.map((enhancement: Enhancement) => {
                        const mapped = isMapped(selectedCategory, enhancement.id);
                        return (
                          <div
                            key={enhancement.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border ${
                              mapped ? 'bg-secondary/50 border-primary' : 'border-border'
                            }`}
                          >
                            <Checkbox
                              checked={mapped}
                              onCheckedChange={() =>
                                toggleMapping(selectedCategory, enhancement.id)
                              }
                            />
                            <div className="flex-1">
                              <div className="font-medium">{enhancement.display_name}</div>
                              <code className="text-xs text-muted-foreground">
                                {enhancement.enhancement_type}
                              </code>
                            </div>
                            {mapped ? (
                              <Badge variant="default">
                                <Link2 className="w-3 h-3 mr-1" />
                                Mapped
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Unlink className="w-3 h-3 mr-1" />
                                Not Mapped
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
