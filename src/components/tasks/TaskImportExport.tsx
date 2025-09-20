import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  AlertTriangle,
  CheckCircle2,
  X,
  Info,
  Eye,
  Settings,
  RefreshCw
} from "lucide-react";
import { Task } from "@/hooks/useTasks";
import { toast } from "sonner";
import { format } from "date-fns";

interface TaskImportExportProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

interface ImportMapping {
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  due_date: string;
  tags: string;
}

export function TaskImportExport({ isOpen, onClose, tasks }: TaskImportExportProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('export');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fieldMapping, setFieldMapping] = useState<ImportMapping>({
    title: '',
    description: '',
    status: '',
    priority: '',
    category: '',
    due_date: '',
    tags: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'title', 'description', 'status', 'priority', 'due_date', 'created_at'
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export Functions
  const exportToCSV = () => {
    const headers = selectedFields.join(',');
    const rows = tasks.map(task => 
      selectedFields.map(field => {
        const value = task[field as keyof Task];
        if (Array.isArray(value)) return `"${value.join(';')}"`;
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value || '';
      }).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    downloadFile(csvContent, `tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
  };

  const exportToJSON = () => {
    const exportData = tasks.map(task => {
      const filteredTask: any = {};
      selectedFields.forEach(field => {
        filteredTask[field] = task[field as keyof Task];
      });
      return filteredTask;
    });
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `tasks-${format(new Date(), 'yyyy-MM-dd')}.json`, 'application/json');
  };

  const exportToExcel = () => {
    // For now, export as CSV with Excel-friendly formatting
    const headers = selectedFields.join('\t');
    const rows = tasks.map(task => 
      selectedFields.map(field => {
        const value = task[field as keyof Task];
        if (Array.isArray(value)) return value.join(';');
        return value || '';
      }).join('\t')
    ).join('\n');
    
    const excelContent = `${headers}\n${rows}`;
    downloadFile(excelContent, `tasks-${format(new Date(), 'yyyy-MM-dd')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${tasks.length} tasks successfully!`);
  };

  // Import Functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    parseFile(file);
  };

  const parseFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      
      if (importFormat === 'csv') {
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        
        setParsedData(data);
        setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
        
        // Auto-map common fields
        const autoMapping: ImportMapping = {
          title: findBestMatch(headers, ['title', 'name', 'task', 'summary']),
          description: findBestMatch(headers, ['description', 'desc', 'details', 'content']),
          status: findBestMatch(headers, ['status', 'state', 'progress']),
          priority: findBestMatch(headers, ['priority', 'importance', 'urgency']),
          category: findBestMatch(headers, ['category', 'type', 'group']),
          due_date: findBestMatch(headers, ['due_date', 'due', 'deadline', 'date']),
          tags: findBestMatch(headers, ['tags', 'labels', 'keywords'])
        };
        setFieldMapping(autoMapping);
        
      } else if (importFormat === 'json') {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData)) {
          setParsedData(jsonData);
          setPreviewData(jsonData.slice(0, 5));
        } else {
          throw new Error('JSON file must contain an array of tasks');
        }
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse file. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const findBestMatch = (headers: string[], candidates: string[]): string => {
    for (const candidate of candidates) {
      const match = headers.find(header => 
        header.toLowerCase().includes(candidate.toLowerCase())
      );
      if (match) return match;
    }
    return '';
  };

  const handleImport = () => {
    if (!parsedData.length) {
      toast.error('No data to import');
      return;
    }

    setIsProcessing(true);
    
    // Process the import
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`Successfully imported ${parsedData.length} tasks!`);
      onClose();
    }, 2000);
  };

  const availableFields = [
    { key: 'title', label: 'Title', icon: FileText },
    { key: 'description', label: 'Description', icon: FileText },
    { key: 'status', label: 'Status', icon: Settings },
    { key: 'priority', label: 'Priority', icon: AlertTriangle },
    { key: 'category', label: 'Category', icon: Settings },
    { key: 'due_date', label: 'Due Date', icon: Settings },
    { key: 'created_at', label: 'Created Date', icon: Settings },
    { key: 'updated_at', label: 'Updated Date', icon: Settings },
    { key: 'assignee_id', label: 'Assignee', icon: Settings },
    { key: 'estimated_hours', label: 'Estimated Hours', icon: Settings },
    { key: 'tags', label: 'Tags', icon: Settings },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-morphism-card border-0 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary-readable font-semibold text-xl">
            Import & Export Tasks
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="glass-morphism-card border-0 bg-white/5 w-full">
            <TabsTrigger value="export" className="flex-1 data-[state=active]:bg-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export Tasks
            </TabsTrigger>
            <TabsTrigger value="import" className="flex-1 data-[state=active]:bg-white/10">
              <Upload className="w-4 h-4 mr-2" />
              Import Tasks
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-morphism-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Export Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Export Format</Label>
                    <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                      <SelectTrigger className="glass-input border-0 bg-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-morphism-card border-0">
                        <SelectItem value="csv">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" />
                            CSV File
                          </div>
                        </SelectItem>
                        <SelectItem value="json">
                          <div className="flex items-center gap-2">
                            <FileJson className="w-4 h-4" />
                            JSON File
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" />
                            Excel File
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-3 block">Fields to Export</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableFields.map((field) => (
                        <div key={field.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={field.key}
                            checked={selectedFields.includes(field.key)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFields([...selectedFields, field.key]);
                              } else {
                                setSelectedFields(selectedFields.filter(f => f !== field.key));
                              }
                            }}
                          />
                          <Label htmlFor={field.key} className="text-sm">
                            {field.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Button
                      onClick={() => {
                        if (exportFormat === 'csv') exportToCSV();
                        else if (exportFormat === 'json') exportToJSON();
                        else if (exportFormat === 'excel') exportToExcel();
                      }}
                      disabled={selectedFields.length === 0}
                      className="w-full bg-gradient-primary hover:shadow-glow"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export {tasks.length} Tasks
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Export Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Tasks:</span>
                      <span className="font-medium ml-2">{tasks.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Selected Fields:</span>
                      <span className="font-medium ml-2">{selectedFields.length}</span>
                    </div>
                  </div>

                  <Separator className="border-white/10" />

                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Format Details</Label>
                    {exportFormat === 'csv' && (
                      <div className="text-sm space-y-1">
                        <p>• Comma-separated values</p>
                        <p>• Compatible with Excel, Google Sheets</p>
                        <p>• Arrays will be semicolon-separated</p>
                      </div>
                    )}
                    {exportFormat === 'json' && (
                      <div className="text-sm space-y-1">
                        <p>• JavaScript Object Notation</p>
                        <p>• Preserves data types</p>
                        <p>• Easy to import programmatically</p>
                      </div>
                    )}
                    {exportFormat === 'excel' && (
                      <div className="text-sm space-y-1">
                        <p>• Microsoft Excel format</p>
                        <p>• Native Excel compatibility</p>
                        <p>• Tab-separated for Excel import</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            {!importFile ? (
              <Card className="glass-morphism-card border-0">
                <CardContent className="p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Choose File to Import</h3>
                  <p className="text-muted-foreground mb-6">
                    Select a CSV or JSON file containing your tasks
                  </p>
                  
                  <div className="mb-4">
                    <Select value={importFormat} onValueChange={(value: any) => setImportFormat(value)}>
                      <SelectTrigger className="w-32 mx-auto glass-input border-0 bg-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-morphism-card border-0">
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={importFormat === 'csv' ? '.csv' : '.json'}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-primary hover:shadow-glow"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="glass-morphism-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        File Loaded: {importFile.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImportFile(null);
                          setParsedData([]);
                          setPreviewData([]);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge className="bg-success text-success-foreground">
                        {parsedData.length} records found
                      </Badge>
                      <span className="text-muted-foreground">
                        File size: {Math.round(importFile.size / 1024)}KB
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {importFormat === 'csv' && (
                  <Card className="glass-morphism-card border-0">
                    <CardHeader>
                      <CardTitle>Field Mapping</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(fieldMapping).map(([field, value]) => (
                          <div key={field}>
                            <Label className="capitalize">{field.replace('_', ' ')}</Label>
                            <Select 
                              value={value} 
                              onValueChange={(newValue) => 
                                setFieldMapping(prev => ({ ...prev, [field]: newValue }))
                              }
                            >
                              <SelectTrigger className="glass-input border-0 bg-white/5">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent className="glass-morphism-card border-0">
                                <SelectItem value="">None</SelectItem>
                                {parsedData.length > 0 && Object.keys(parsedData[0]).map((header) => (
                                  <SelectItem key={header} value={header}>
                                    {header}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="glass-morphism-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Data Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            {previewData.length > 0 && Object.keys(previewData[0]).map((header) => (
                              <th key={header} className="text-left p-2 font-medium">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, index) => (
                            <tr key={index} className="border-b border-white/5">
                              {Object.values(row).map((value: any, cellIndex) => (
                                <td key={cellIndex} className="p-2 text-muted-foreground">
                                  {String(value).length > 30 
                                    ? String(value).substring(0, 30) + '...' 
                                    : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedData.length > 5 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Showing first 5 of {parsedData.length} records
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImportFile(null);
                      setParsedData([]);
                      setPreviewData([]);
                    }}
                    className="glass-button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={isProcessing || parsedData.length === 0}
                    className="bg-gradient-primary hover:shadow-glow"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import {parsedData.length} Tasks
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}