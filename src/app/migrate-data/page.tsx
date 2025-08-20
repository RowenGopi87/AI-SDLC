'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Database, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface MigrationStatus {
  currentCounts: {
    businessBriefs: number;
    initiatives: number;
    features: number;
    epics: number;
    stories: number;
  };
  availableMockData: {
    businessBriefs: number;
    initiatives: number;
    features: number;
    epics: number;
    stories: number;
  };
}

interface MigrationResult {
  success: boolean;
  message?: string;
  statistics?: {
    businessBriefs: number;
    initiatives: number;
    features: number;
    epics: number;
    stories: number;
  };
  details?: any;
  error?: string;
}

export default function MigrateDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const loadMigrationStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const response = await fetch('/api/migrate/mock-data');
      const data = await response.json();
      
      if (data.success) {
        setMigrationStatus(data);
      } else {
        console.error('Failed to load migration status:', data.error);
      }
    } catch (error) {
      console.error('Error loading migration status:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const runMigration = async () => {
    setIsLoading(true);
    setMigrationResult(null);
    
    try {
      console.log('🚀 Starting V1 mock data migration to AuraV2 database...');
      
      const response = await fetch('/api/migrate/mock-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Migration completed successfully!', result.statistics);
        setMigrationResult(result);
        // Refresh status after migration
        await loadMigrationStatus();
      } else {
        console.error('❌ Migration failed:', result.error);
        setMigrationResult(result);
      }
      
    } catch (error) {
      console.error('❌ Migration error:', error);
      setMigrationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load status on component mount
  React.useEffect(() => {
    loadMigrationStatus();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Migration Controller</h1>
          <p className="text-muted-foreground">
            Migrate V1 mock data into AuraV2 database tables with proper linking
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadMigrationStatus}
          disabled={isLoadingStatus}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStatus ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Database Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Current Database Status
            </CardTitle>
            <CardDescription>
              Current record counts in AuraV2 database tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            {migrationStatus?.currentCounts ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Business Briefs:</span>
                  <Badge variant="secondary">{migrationStatus.currentCounts.businessBriefs || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Initiatives:</span>
                  <Badge variant="secondary">{migrationStatus.currentCounts.initiatives || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Features:</span>
                  <Badge variant="secondary">{migrationStatus.currentCounts.features || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Epics:</span>
                  <Badge variant="secondary">{migrationStatus.currentCounts.epics || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Stories:</span>
                  <Badge variant="secondary">{migrationStatus.currentCounts.stories || 0}</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                {isLoadingStatus ? 'Loading status...' : 'Click Refresh Status to load'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Mock Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Available V1 Mock Data
            </CardTitle>
            <CardDescription>
              V1 mock data ready for migration to AuraV2
            </CardDescription>
          </CardHeader>
          <CardContent>
            {migrationStatus?.availableMockData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Business Briefs:</span>
                  <Badge variant="outline">{migrationStatus.availableMockData.businessBriefs || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Initiatives:</span>
                  <Badge variant="outline">{migrationStatus.availableMockData.initiatives || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Features:</span>
                  <Badge variant="outline">{migrationStatus.availableMockData.features || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Epics:</span>
                  <Badge variant="outline">{migrationStatus.availableMockData.epics || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Stories:</span>
                  <Badge variant="outline">{migrationStatus.availableMockData.stories || 0}</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Loading available data counts...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Migration Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Controller
          </CardTitle>
          <CardDescription>
            Clear AuraV2 database tables and populate with V1 mock data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Warning: Data Clearing Operation</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This operation will <strong>permanently delete</strong> all existing data from business_briefs, 
                  initiatives, features, epics, and stories tables before populating with V1 mock data.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={runMigration} 
            disabled={isLoading}
            size="lg"
            className="w-full"
            variant="destructive"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Migrating V1 Mock Data...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Clear Database & Migrate V1 Mock Data
              </>
            )}
          </Button>

          {/* Migration Result Display */}
          {migrationResult && (
            <div className="mt-4">
              <Separator className="mb-4" />
              
              {migrationResult.success ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800">Migration Successful!</p>
                      <p className="text-sm text-green-700 mt-1">{migrationResult.message}</p>
                      
                      {migrationResult.statistics && (
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>✅ Business Briefs: <strong>{migrationResult.statistics.businessBriefs}</strong></div>
                          <div>✅ Initiatives: <strong>{migrationResult.statistics.initiatives}</strong></div>
                          <div>✅ Features: <strong>{migrationResult.statistics.features}</strong></div>
                          <div>✅ Epics: <strong>{migrationResult.statistics.epics}</strong></div>
                          <div>✅ Stories: <strong>{migrationResult.statistics.stories}</strong></div>
                        </div>
                      )}
                      
                      {migrationResult.details && (
                        <div className="mt-3 p-3 bg-white border border-green-200 rounded text-xs font-mono">
                          <p><strong>Details:</strong></p>
                          <ul className="mt-1 space-y-1">
                            <li>• {migrationResult.details.businessBriefs}</li>
                            <li>• {migrationResult.details.initiatives}</li>
                            <li>• {migrationResult.details.features}</li>
                            <li>• {migrationResult.details.epics}</li>
                            <li>• {migrationResult.details.stories}</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Migration Failed</p>
                      <p className="text-sm text-red-700 mt-1">{migrationResult.error}</p>
                      {migrationResult.details && (
                        <pre className="mt-2 text-xs bg-white p-2 border rounded overflow-auto">
                          {migrationResult.details}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}