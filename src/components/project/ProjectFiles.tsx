import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Search,
  File,
  FileText,
  Image,
  Download,
  MoreVertical,
  Folder,
  Grid,
  List
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface ProjectFilesProps {
  projectId: string;
}

// Mock data for demonstration
const mockFiles = [
  {
    id: '1',
    name: 'Project Proposal.pdf',
    file_type: 'pdf',
    file_size: 2048576,
    version: 1,
    uploaded_by: 'user-1',
    created_at: new Date().toISOString(),
    tags: ['proposal', 'document']
  },
  {
    id: '2',
    name: 'UI Mockups.fig',
    file_type: 'fig',
    file_size: 15728640,
    version: 3,
    uploaded_by: 'user-2',
    created_at: new Date().toISOString(),
    tags: ['design', 'ui']
  },
  {
    id: '3',
    name: 'Database Schema.sql',
    file_type: 'sql',
    file_size: 4096,
    version: 1,
    uploaded_by: 'user-1',
    created_at: new Date().toISOString(),
    tags: ['database', 'code']
  }
];

export function ProjectFiles({ projectId }: ProjectFilesProps) {
  const [files] = useState(mockFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getFileIcon = (fileType: string) => {
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileType.toLowerCase())) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(fileType.toLowerCase())) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <File className="w-5 h-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* File Management Header */}
      <Card className="glass-morphism-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Project Files ({files.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center glass-morphism-card border-0 bg-white/5 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
              <Button className="glass-morphism-button bg-gradient-primary hover:shadow-glow transition-smooth border-0">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-input border-0 bg-white/5"
              />
            </div>
          </div>

          {/* Files Display */}
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 glass-morphism-card rounded-lg border-0 hover:shadow-glow transition-smooth"
                >
                  {getFileIcon(file.file_type)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{file.name}</h3>
                      {file.version > 1 && (
                        <Badge variant="outline" className="glass-badge border-0 text-xs">
                          v{file.version}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>Uploaded {format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                      {file.tags && file.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1">
                            {file.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="glass-badge border-0 text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="glass-morphism-button border-0">
                      <Download className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="glass-morphism-button border-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-morphism-card border-0">
                        <DropdownMenuItem>Preview</DropdownMenuItem>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Share Link</DropdownMenuItem>
                        <DropdownMenuItem>Move to Folder</DropdownMenuItem>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="glass-morphism-card border-0 hover:shadow-glow transition-smooth">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      {getFileIcon(file.file_type)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-morphism-card border-0">
                          <DropdownMenuItem>Preview</DropdownMenuItem>
                          <DropdownMenuItem>Download</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <h3 className="font-medium text-sm mb-1 truncate">{file.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {formatFileSize(file.file_size)}
                    </p>
                    
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {file.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="glass-badge border-0 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(file.created_at), 'MMM d')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Folder className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No files found' : 'No files uploaded yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Upload files to share with your team and keep everything organized.'
                }
              </p>
              {!searchTerm && (
                <Button className="bg-gradient-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First File
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card className="glass-morphism-card border-0">
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Used Space</span>
                <span className="text-sm font-medium">
                  {formatFileSize(files.reduce((sum, file) => sum + file.file_size, 0))} / 5 GB
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: '15%' }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Files</p>
                <p className="text-lg font-semibold">{files.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Available Space</p>
                <p className="text-lg font-semibold text-success">4.98 GB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}