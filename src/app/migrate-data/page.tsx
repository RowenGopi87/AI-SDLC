'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Upload, CheckCircle, AlertTriangle } from 'lucide-react';

// Import your Zustand stores
const STORE_KEYS = [
  'feature-store',
  'epic-store', 
  'story-store',
  'initiative-store',
  'business-brief-store'
];

export default function MigrateDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [localData, setLocalData] = useState<any>({});
  const [databaseCounts, setDatabaseCounts] = useState<any>({});

  useEffect(() => {
    loadLocalStorageData();
    fetchDatabaseStatus();
  }, []);

  const loadLocalStorageData = () => {
    const data: any = {};
    let totalItems = 0;

    // Load from localStorage (Zustand persist) - using correct keys
    try {
      // Use Cases (these contain your BB-001, BB-002, etc.)
      const useCaseStore = JSON.parse(localStorage.getItem('use-case-storage') || '{}');
      data.businessBriefs = useCaseStore.state?.useCases || [];
      totalItems += data.businessBriefs.length;

      // Features
      const featureStore = JSON.parse(localStorage.getItem('aura-features') || '{}');
      data.features = featureStore.state?.features || [];
      totalItems += data.features.length;

      // Epics
      const epicStore = JSON.parse(localStorage.getItem('aura-epics') || '{}');
      data.epics = epicStore.state?.epics || [];
      totalItems += data.epics.length;

      // Stories
      const storyStore = JSON.parse(localStorage.getItem('aura-stories') || '{}');
      data.stories = storyStore.state?.stories || [];
      totalItems += data.stories.length;

      // Initiatives
      const initiativeStore = JSON.parse(localStorage.getItem('aura-initiatives') || '{}');
      data.initiatives = initiativeStore.state?.initiatives || [];
      totalItems += data.initiatives.length;

      // Debug: Log actual localStorage contents
      console.log('🔍 Raw localStorage contents:');
      console.log('- use-case-storage:', localStorage.getItem('use-case-storage'));
      console.log('- aura-initiatives:', localStorage.getItem('aura-initiatives'));
      console.log('- aura-features:', localStorage.getItem('aura-features'));
      console.log('- aura-epics:', localStorage.getItem('aura-epics'));
      console.log('- aura-stories:', localStorage.getItem('aura-stories'));

      console.log('🔍 Parsed localStorage data:', {
        businessBriefs: data.businessBriefs.length,
        initiatives: data.initiatives.length,
        features: data.features.length,
        epics: data.epics.length,
        stories: data.stories.length,
        total: totalItems
      });

      // Debug: Log sample data from each type
      if (data.businessBriefs.length > 0) console.log('Sample business brief:', data.businessBriefs[0]);
      if (data.initiatives.length > 0) console.log('Sample initiative:', data.initiatives[0]);
      if (data.features.length > 0) console.log('Sample feature:', data.features[0]);
      if (data.epics.length > 0) console.log('Sample epic:', data.epics[0]);
      if (data.stories.length > 0) console.log('Sample story:', data.stories[0]);

    } catch (error) {
      console.error('Error loading local storage data:', error);
    }

    data.totalItems = totalItems;
    setLocalData(data);
  };

  const fetchDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/migrate/work-items');
      const result = await response.json();
      if (result.success) {
        setDatabaseCounts(result.data.currentDatabaseCounts);
      }
    } catch (error) {
      console.error('Failed to fetch database status:', error);
    }
  };

  const handleMigration = async () => {
    if (localData.totalItems === 0) {
      alert('No local data found to migrate.');
      return;
    }

    setIsLoading(true);
    setMigrationResult(null);

    try {
      const migrationPayload = {
        data: {
          businessBriefs: localData.businessBriefs || [],
          initiatives: localData.initiatives || [],
          features: localData.features || [],
          epics: localData.epics || [],
          stories: localData.stories || [],
        }
      };

      console.log('📤 Sending migration payload:', {
        businessBriefs: migrationPayload.data.businessBriefs.length,
        initiatives: migrationPayload.data.initiatives.length,
        features: migrationPayload.data.features.length,
        epics: migrationPayload.data.epics.length,
        stories: migrationPayload.data.stories.length,
      });

      // Debug: Show first initiative details if exists
      if (migrationPayload.data.initiatives.length > 0) {
        console.log('📝 Sample initiative being sent:', {
          id: migrationPayload.data.initiatives[0].id,
          title: migrationPayload.data.initiatives[0].title,
          businessBriefId: migrationPayload.data.initiatives[0].businessBriefId,
          hasBusinessBriefId: !!migrationPayload.data.initiatives[0].businessBriefId
        });
      } else {
        console.log('⚠️ No initiatives found in migration payload!');
      }

      const response = await fetch('/api/migrate/work-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(migrationPayload)
      });

      const result = await response.json();
      setMigrationResult(result);

      if (result.success) {
        // Refresh database counts
        fetchDatabaseStatus();
      }

    } catch (error: any) {
      setMigrationResult({
        success: false,
        message: 'Migration failed',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Data Migration</h1>
          <p className="text-gray-600">
            Move your work items from local storage to MariaDB database
          </p>
        </div>

        {/* Current Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Local Storage Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Business Briefs:</span>
                  <span className="font-medium">{localData.businessBriefs?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Initiatives:</span>
                  <span className="font-medium">{localData.initiatives?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Features:</span>
                  <span className="font-medium">{localData.features?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Epics:</span>
                  <span className="font-medium">{localData.epics?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stories:</span>
                  <span className="font-medium">{localData.stories?.length || 0}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Items:</span>
                  <span>{localData.totalItems || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Database Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Business Briefs:</span>
                  <span className="font-medium">{databaseCounts.businessBriefs || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Initiatives:</span>
                  <span className="font-medium">{databaseCounts.initiatives || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Features:</span>
                  <span className="font-medium">{databaseCounts.features || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Epics:</span>
                  <span className="font-medium">{databaseCounts.epics || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stories:</span>
                  <span className="font-medium">{databaseCounts.stories || 0}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Items:</span>
                  <span>
                    {Object.values(databaseCounts).reduce((sum: number, count: any) => sum + (count || 0), 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Migration Action */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Ready to Migrate?</h3>
              <p className="text-gray-600">
                This will copy your local work items to the MariaDB database and index them for RAG search.
                Your local data will remain unchanged.
              </p>
              
              <Button 
                onClick={handleMigration}
                disabled={isLoading || localData.totalItems === 0}
                size="lg"
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Migrate to Database
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Migration Result */}
        {migrationResult && (
          <Alert className={migrationResult.success ? 'border-green-200' : 'border-red-200'}>
            <div className="flex items-center">
              {migrationResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className="ml-2">
                <strong>
                  {migrationResult.success ? 'Success!' : 'Error:'}
                </strong>{' '}
                {migrationResult.message}
                
                {migrationResult.success && migrationResult.data && (
                  <div className="mt-2">
                    <p>Total migrated: {migrationResult.data.totalMigrated} items</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">View breakdown</summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                        {JSON.stringify(migrationResult.data.breakdown, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>After Migration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ Work items will be stored in MariaDB database</p>
              <p>✅ Items will be indexed for RAG search (if embedding service enabled)</p>
              <p>✅ Assistant will be able to find and answer questions about your work items</p>
              <p>✅ Try asking: "What is the status of BB-004?" or "How many business briefs do I have?"</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
