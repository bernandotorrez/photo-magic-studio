import { Layout } from '@/components/Layout';
import { GenerationHistory } from '@/components/dashboard/GenerationHistory';

export default function HistoryPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <GenerationHistory />
      </div>
    </Layout>
  );
}
