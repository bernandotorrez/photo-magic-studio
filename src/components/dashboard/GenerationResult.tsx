import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageMagnifier } from '@/components/ui/image-magnifier';
import { Download, RefreshCw, PlusCircle, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface GeneratedResult {
  enhancement: string;
  url: string;
}

interface GenerationResultProps {
  originalUrl: string;
  results: GeneratedResult[];
  onRegenerate: () => void;
  onNewImage: () => void;
}

export function GenerationResult({
  originalUrl,
  results,
  onRegenerate,
  onNewImage,
}: GenerationResultProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const handleDownload = async (url: string, enhancement: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `enhanced-${enhancement.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDownloadAll = async () => {
    for (const result of results) {
      await handleDownload(result.url, result.enhancement);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="text-lg font-semibold truncate">
              {previewImage?.title || 'Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="relative bg-muted/30 p-4 flex-1 overflow-y-auto overflow-x-hidden">
            {previewImage && (
              <div className="flex justify-center">
                <ImageMagnifier
                  src={previewImage.url}
                  alt={previewImage.title}
                  magnifierSize={200}
                  zoomLevel={2.5}
                />
              </div>
            )}
          </div>
          <div className="px-6 py-4 flex justify-center gap-3 border-t flex-shrink-0">
            <Button
              onClick={() => previewImage && handleDownload(previewImage.url, previewImage.title)}
              variant="hero"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Gambar
            </Button>
            <Button
              onClick={() => setPreviewImage(null)}
              variant="outline"
              size="sm"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4 md:space-y-6">
        {/* Header Actions - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Badge variant="secondary" className="text-sm w-fit">
            {results.length} gambar di-generate
          </Badge>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RefreshCw className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Generate </span>Ulang
            </Button>
            <Button variant="outline" size="sm" onClick={onNewImage}>
              <PlusCircle className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Gambar </span>Baru
            </Button>
          </div>
        </div>

        {/* Responsive Layout: Stack on mobile, horizontal on desktop */}
        <div className="flex flex-col md:flex-row gap-4 md:items-start">
          {/* Original Image */}
          <div className="w-full md:flex-shrink-0 md:w-48 lg:w-64">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Original</h3>
            <div 
              className="rounded-xl overflow-hidden border border-border bg-muted/30 aspect-square flex items-center justify-center relative group cursor-pointer max-w-[200px] md:max-w-none mx-auto md:mx-0"
              onClick={() => setPreviewImage({ url: originalUrl, title: 'Original Image' })}
            >
              <img 
                src={originalUrl} 
                alt="Original" 
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-3">
                  <Maximize2 className="w-5 h-5 text-gray-900" />
                </div>
              </div>
            </div>
          </div>

          {/* Arrow Divider - Hidden on mobile */}
          <div className="hidden md:flex flex-shrink-0 items-center justify-center h-48 lg:h-64 text-muted-foreground">
            <ChevronRight className="w-6 h-6" />
          </div>

          {/* Results Section */}
          <div className="flex-1 min-w-0 relative">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Hasil Enhancement</h3>
            
            {/* Carousel Navigation - Only show when multiple results */}
            {results.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md hidden md:flex"
                  onClick={scrollLeft}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md hidden md:flex"
                  onClick={scrollRight}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {/* Scrollable Container */}
            <div 
              ref={scrollContainerRef}
              className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent snap-x snap-mandatory md:snap-none"
              style={{ scrollbarWidth: 'thin' }}
            >
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-48 lg:w-64 rounded-xl overflow-hidden border-2 border-primary/30 bg-primary/5 relative group snap-center"
                >
                  <div className="p-1.5 sm:p-2 bg-background/80 border-b border-border">
                    <Badge variant="outline" className="text-[10px] sm:text-xs truncate max-w-full block">
                      {result.enhancement}
                    </Badge>
                  </div>
                  <div 
                    className="aspect-square flex items-center justify-center p-1 sm:p-2 cursor-pointer"
                    onClick={() => setPreviewImage({ url: result.url, title: result.enhancement })}
                  >
                    <img 
                      src={result.url} 
                      alt={result.enhancement} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  {/* Hover overlay for desktop, tap hint for mobile */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 md:transition-opacity flex items-end justify-center pb-4 sm:pb-6 gap-1 sm:gap-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage({ url: result.url, title: result.enhancement });
                      }}
                      variant="secondary" 
                      size="sm"
                      className="text-xs px-2 sm:px-3"
                    >
                      <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Preview</span>
                    </Button>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(result.url, result.enhancement);
                      }}
                      variant="hero" 
                      size="sm"
                      className="text-xs px-2 sm:px-3"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Download All Button */}
        <div className="flex justify-center pt-2 md:pt-4">
          <Button onClick={handleDownloadAll} variant="hero" size="default" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Download Semua ({results.length})
          </Button>
        </div>
      </div>
    </>
  );
}
