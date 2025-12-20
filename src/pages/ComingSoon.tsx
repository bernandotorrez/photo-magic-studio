import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  Sparkles, 
  Zap, 
  Brain,
  Wand2,
  Video,
  Music,
  FileText,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const upcomingFeatures = [
  {
    icon: Video,
    title: 'AI Video Generator',
    description: 'Generate video dari gambar atau text prompt dengan AI',
    status: 'In Development',
    eta: 'Comming Soon'
  },
  {
    icon: Music,
    title: 'AI Music & Audio',
    description: 'Generate musik background dan sound effects untuk konten Anda',
    status: 'Planned',
    eta: 'Comming Soon'
  },
  {
    icon: FileText,
    title: 'AI Content Writer',
    description: 'Generate deskripsi produk, caption, dan konten marketing dengan AI',
    status: 'In Development',
    eta: 'Comming Soon'
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Development':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Planned':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Research':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Rocket className="w-5 h-5" />
            <span className="font-semibold">Coming Soon</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Fitur AI <span className="gradient-text">Terbaru</span> Segera Hadir
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kami terus berinovasi dan mengembangkan teknologi AI terbaru untuk membantu bisnis Anda berkembang lebih cepat.
          </p>
        </div>

        {/* Current Features CTA */}
        <Card className="mb-12 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Coba Fitur yang Sudah Tersedia</h3>
                  <p className="text-sm text-muted-foreground">
                    Fashion & Product, AI Photographer, Interior & Exterior Design
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/dashboard')} size="lg">
                <Zap className="w-4 h-4 mr-2" />
                Mulai Sekarang
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Features Grid */}
        {/* <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Roadmap Fitur AI</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge className={getStatusColor(feature.status)} variant="outline">
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>ETA: {feature.eta}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> */}

        {/* Newsletter/Notification CTA */}
        {/* <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ingin Tahu Lebih Dulu?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Kami akan memberitahu Anda saat fitur baru diluncurkan. 
              Pantau terus dashboard Anda untuk update terbaru!
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/dashboard')}>
                Kembali ke Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/settings')}>
                Pengaturan Notifikasi
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </Layout>
  );
}
