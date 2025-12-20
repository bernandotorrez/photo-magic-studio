import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Sparkles, X } from 'lucide-react';
import { getEnhancementsByCategory, CategoryEnhancement } from '@/lib/enhancementPrompts';

interface EnhancementMultiSelectorProps {
  categoryCode: string;
  onGenerate: (selectedEnhancements: string[]) => void;
  maxSelections?: number;
  disabled?: boolean;
}

export default function EnhancementMultiSelector({
  categoryCode,
  onGenerate,
  maxSelections = 4,
  disabled = false,
}: EnhancementMultiSelectorProps) {
  const [enhancements, setEnhancements] = useState<CategoryEnhancement[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnhancements();
  }, [categoryCode]);

  const fetchEnhancements = async () => {
    setLoading(true);
    try {
      const data = await getEnhancementsByCategory(categoryCode);
      setEnhancements(data);
    } catch (error: any) {
      toast.error('Failed to load enhancements: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEnhancement = (type: string) => {
    if (selected.includes(type)) {
      // Remove
      setSelected(selected.filter((t) => t !== type));
    } else {
      // Add (check max limit)
      if (selected.length >= maxSelections) {
        toast.error(`Maximum ${maxSelections} enhancements allowed`);
        return;
      }
      setSelected([...selected, type]);
    }
  };

  const removeSelection = (type: string) => {
    setSelected(selected.filter((t) => t !== type));
  };

  const handleGenerate = () => {
    if (selected.length === 0) {
      toast.error('Please select at least one enhancement');
      return;
    }
    onGenerate(selected);
  };

  const clearAll = () => {
    setSelected([]);
  };

  // Group enhancements by category
  const groupedEnhancements = enhancements.reduce((acc: any, enh) => {
    const cat = enh.category || 'general';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(enh);
    return acc;
  }, {});

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">Loading enhancements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Select Enhancements</CardTitle>
            <CardDescription>
              Choose up to {maxSelections} enhancements to apply
            </CardDescription>
          </div>
          <Badge variant={selected.length > 0 ? 'default' : 'secondary'}>
            {selected.length} / {maxSelections} selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Enhancements */}
        {selected.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Selected:</span>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.map((type) => {
                const enh = enhancements.find((e) => e.type === type);
                return (
                  <Badge key={type} variant="default" className="pl-3 pr-1">
                    {enh?.title || type}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removeSelection(type)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            <Separator />
          </div>
        )}

        {/* Enhancement Options */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedEnhancements).map(([category, enhs]: [string, any]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3 capitalize">{category}</h3>
                <div className="space-y-2">
                  {enhs.map((enhancement: CategoryEnhancement) => {
                    const isSelected = selected.includes(enhancement.type);
                    const isDisabled =
                      disabled ||
                      (!isSelected && selected.length >= maxSelections);

                    return (
                      <div
                        key={enhancement.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-primary/10 border-primary'
                            : 'border-border hover:bg-muted/50'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => !isDisabled && toggleEnhancement(enhancement.type)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={() => toggleEnhancement(enhancement.type)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{enhancement.title}</div>
                          {enhancement.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {enhancement.description}
                            </p>
                          )}
                          {enhancement.isDefault && (
                            <Badge variant="outline" className="mt-2">
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Generate Button */}
        <div className="pt-4">
          <Button
            onClick={handleGenerate}
            disabled={disabled || selected.length === 0}
            className="w-full"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with {selected.length} Enhancement{selected.length !== 1 ? 's' : ''}
          </Button>
          {selected.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Select at least one enhancement to continue
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
