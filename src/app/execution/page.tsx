"use client";

import { useState } from 'react';
import { useTestCaseStore } from '@/store/test-case-store';
import { useWorkItemStore } from '@/store/work-item-store';
import { formatDateTimeForDisplay } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Eye,
  Download,
  Filter,
  Search,
  BarChart3,
  FileText,
  Terminal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ExecutionPage() {
  const { testCases, executeTestCase } = useTestCaseStore();
  const { workItems, getWorkItemById } = useWorkItemStore();
  const [selectedTestCase, setSelectedTestCase] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);

  // Mock execution logs
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    '[2024-01-20 10:30:01] Test execution started',
    '[2024-01-20 10:30:02] Loading test case: Valid User Login',
    '[2024-01-20 10:30:03] Step 1: Navigate to login page - PASSED',
    '[2024-01-20 10:30:04] Step 2: Enter valid email - PASSED',
    '[2024-01-20 10:30:05] Step 3: Enter valid password - PASSED',
    '[2024-01-20 10:30:06] Step 4: Click login button - PASSED',
    '[2024-01-20 10:30:07] Test case completed successfully',
    '[2024-01-20 10:30:08] Test execution finished'
  ]);

  const handleRunTest = async (testCaseId: string) => {
    setIsRunning(true);
    setSelectedTestCase(testCaseId);
    
    // Mock test execution
    const testCase = testCases.find(tc => tc.id === testCaseId);
    if (!testCase) return;

    const newLogs = [
      `[${new Date().toLocaleString()}] Starting test: ${testCase.title}`,
      `[${new Date().toLocaleString()}] Test type: ${testCase.type}`,
      `[${new Date().toLocaleString()}] Executing preconditions...`,
    ];

    // Add step execution logs
    testCase.steps.forEach((step, index) => {
      newLogs.push(`[${new Date().toLocaleString()}] Step ${index + 1}: ${step} - EXECUTING`);
    });

    setExecutionLogs(newLogs);

    // Simulate test execution delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock result (random for demo)
    const results = ['passed', 'failed', 'blocked'] as const;
    const randomResult = results[Math.floor(Math.random() * results.length)];
    
    executeTestCase(testCaseId, randomResult, `Test executed automatically at ${new Date().toLocaleString()}`);
    
    newLogs.push(`[${new Date().toLocaleString()}] Test completed with status: ${randomResult.toUpperCase()}`);
    setExecutionLogs(newLogs);
    setIsRunning(false);
  };

  const handleBulkRun = async () => {
    setIsRunning(true);
    const testCasesToRun = filteredTestCases.filter(tc => tc.status === 'not_run');
    
    for (const testCase of testCasesToRun) {
      await handleRunTest(testCase.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle size={16} className="text-green-600" />;
      case 'failed': return <XCircle size={16} className="text-red-600" />;
      case 'blocked': return <AlertTriangle size={16} className="text-yellow-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'edge': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTestCases = testCases.filter(testCase => {
    const matchesSearch = testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || testCase.status === filterStatus;
    const matchesType = filterType === 'all' || testCase.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const executionStats = {
    total: testCases.length,
    passed: testCases.filter(tc => tc.status === 'passed').length,
    failed: testCases.filter(tc => tc.status === 'failed').length,
    blocked: testCases.filter(tc => tc.status === 'blocked').length,
    notRun: testCases.filter(tc => tc.status === 'not_run').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Execution</h1>
          <p className="text-gray-600 mt-1">Execute test cases and monitor results</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleBulkRun}
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run All Tests</span>
              </>
            )}
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Download size={16} />
            <span>Export Results</span>
          </Button>
        </div>
      </div>

      {/* Execution Stats - Collapsible */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Execution Summary</CardTitle>
              <CardDescription>Test execution metrics and status overview</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSummaryCardsVisible(!summaryCardsVisible)}
              className="h-8 w-8 p-0"
            >
              {summaryCardsVisible ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Button>
          </div>
        </CardHeader>
        {summaryCardsVisible && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Tests', value: executionStats.total, color: 'bg-blue-100 text-blue-800' },
                { label: 'Passed', value: executionStats.passed, color: 'bg-green-100 text-green-800' },
                { label: 'Failed', value: executionStats.failed, color: 'bg-red-100 text-red-800' },
                { label: 'Blocked', value: executionStats.blocked, color: 'bg-yellow-100 text-yellow-800' },
                { label: 'Not Run', value: executionStats.notRun, color: 'bg-gray-100 text-gray-800' },
              ].map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <Badge className={stat.color}>{stat.value}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search test cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_run">Not Run</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
            <SelectItem value="edge">Edge</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Cases Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play size={18} />
                <span>Test Cases</span>
              </CardTitle>
              <CardDescription>Execute individual test cases or run in bulk</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Case</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestCases.map((testCase) => {
                    const workItem = getWorkItemById(testCase.workItemId);
                    return (
                      <TableRow key={testCase.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{testCase.title}</div>
                            <div className="text-sm text-gray-500">
                              {workItem?.title || 'Unknown Work Item'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(testCase.type)} variant="secondary">
                            {testCase.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(testCase.status)}
                            <Badge className={getStatusColor(testCase.status)}>
                              {testCase.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {testCase.lastExecuted
                              ? formatDateTimeForDisplay(testCase.lastExecuted)
                              : 'Never'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRunTest(testCase.id)}
                              disabled={isRunning}
                            >
                              {isRunning && selectedTestCase === testCase.id ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : (
                                <Play size={14} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedTestCase(testCase.id)}
                            >
                              <Eye size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredTestCases.length === 0 && (
                <div className="text-center py-8">
                  <Play size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No test cases found</h3>
                  <p className="text-gray-600">
                    {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'No test cases available for execution'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Execution Logs */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Terminal size={18} />
                <span>Execution Logs</span>
              </CardTitle>
              <CardDescription>Real-time test execution output</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                {executionLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
                {isRunning && (
                  <div className="flex items-center space-x-2 mt-2">
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Executing...</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExecutionLogs([])}
                >
                  Clear Logs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Download size={14} />
                  <span>Export Logs</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Test Case Details Modal */}
      {selectedTestCase && (
        <Dialog open={!!selectedTestCase} onOpenChange={() => setSelectedTestCase(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Test Case Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected test case
              </DialogDescription>
            </DialogHeader>
            
            {(() => {
              const testCase = testCases.find(tc => tc.id === selectedTestCase);
              if (!testCase) return null;
              
              const workItem = getWorkItemById(testCase.workItemId);
              
              return (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Test Case Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Title</p>
                        <p className="text-sm text-gray-600">{testCase.title}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Type</p>
                        <Badge className={getTypeColor(testCase.type)} variant="secondary">
                          {testCase.type}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Status</p>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(testCase.status)}
                          <Badge className={getStatusColor(testCase.status)}>
                            {testCase.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Work Item</p>
                        <p className="text-sm text-gray-600">{workItem?.title || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                    <p className="text-sm text-gray-600">{testCase.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Preconditions</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {testCase.preconditions.map((condition, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Test Steps</p>
                    <ol className="text-sm text-gray-600 space-y-1">
                      {testCase.steps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 font-medium">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Expected Result</p>
                    <p className="text-sm text-gray-600">{testCase.expectedResult}</p>
                  </div>
                  
                  {testCase.actualResult && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Actual Result</p>
                      <p className="text-sm text-gray-600">{testCase.actualResult}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 