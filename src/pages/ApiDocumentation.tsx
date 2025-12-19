import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users } from 'lucide-react';
import ApiDocumentation from '@/components/api/ApiDocumentation';
import UserApiGuide from '@/components/api/UserApiGuide';

export default function ApiDocumentationPage() {
  const [activeTab, setActiveTab] = useState('user');

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="user" className="gap-2">
              <Users className="w-4 h-4" />
              Panduan User
            </TabsTrigger>
            <TabsTrigger value="developer" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Developer Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <UserApiGuide />
          </TabsContent>

          <TabsContent value="developer">
            <ApiDocumentation />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
