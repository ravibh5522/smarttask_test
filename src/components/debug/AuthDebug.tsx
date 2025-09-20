import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function AuthDebug() {
  const { user, session } = useAuth();
  const [dbAuthStatus, setDbAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkDbAuth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('count')
        .limit(1);
      
      setDbAuthStatus({
        canQuery: !error,
        error: error?.message,
        userId: user?.id,
        sessionExists: !!session,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setDbAuthStatus({
        canQuery: false,
        error: err.message,
        userId: user?.id,
        sessionExists: !!session,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkDbAuth();
    }
  }, [user]);

  if (!user) {
    return (
      <Card className="mb-4 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">⚠️ Not Authenticated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">You are not logged in. Please log in to create projects.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-700 flex items-center gap-2">
          🔍 Authentication Status
          <Button
            variant="outline"
            size="sm"
            onClick={checkDbAuth}
            disabled={loading}
            className="ml-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <strong>User ID:</strong> {user.id}
        </div>
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>Session:</strong> {session ? '✅ Active' : '❌ No Session'}
        </div>
        {dbAuthStatus && (
          <div>
            <strong>Database Access:</strong> {dbAuthStatus.canQuery ? '✅ Working' : '❌ Failed'}
            {dbAuthStatus.error && (
              <div className="text-red-600 text-xs mt-1">
                Error: {dbAuthStatus.error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}