import { Layout } from '@/components/Layout';
import { GenerationHistory } from '@/components/dashboard/GenerationHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Riwayat Generate
          </h1>
          <p className="text-muted-foreground">
            Lihat semua hasil generate gambar Anda dari semua kategori
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Semua Riwayat Generate
            </CardTitle>
            <CardDescription>
              Riwayat generate dari Fashion & Product, AI Photographer, Interior Design, Exterior Design, dan Food Enhancement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GenerationHistory />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
