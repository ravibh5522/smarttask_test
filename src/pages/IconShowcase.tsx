import React from 'react';
import { SmartTaskIcon, SmartTaskFavicon, SmartTaskLogo } from '@/components/ui/SmartTaskIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';

const IconShowcase = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadSVG = (svgElement: Element, filename: string) => {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">SmartTask Icon System</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive icon system designed for your SmartTask project. Choose from multiple variants, sizes, and styles.
          </p>
        </div>

        {/* Logo Variations */}
        <Card>
          <CardHeader>
            <CardTitle>Logo Variations</CardTitle>
            <CardDescription>Complete logo with text for headers and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Dark Theme</h4>
                <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
                  <SmartTaskLogo size="sm" variant="auto" />
                  <SmartTaskLogo size="md" variant="auto" />
                  <SmartTaskLogo size="lg" variant="auto" />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Light Theme</h4>
                <div className="space-y-4 p-6 bg-gray-900 rounded-lg">
                  <SmartTaskLogo size="sm" variant="light" />
                  <SmartTaskLogo size="md" variant="light" />
                  <SmartTaskLogo size="lg" variant="light" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Icon Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Icon Variants</CardTitle>
            <CardDescription>Different styles for various use cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { variant: 'default', name: 'Default' },
                { variant: 'gradient', name: 'Gradient' },
                { variant: 'minimal', name: 'Minimal' },
                { variant: 'outline', name: 'Outline' },
                { variant: 'solid', name: 'Solid' },
                { variant: 'glass', name: 'Glass' },
              ].map(({ variant, name }) => (
                <div key={variant} className="text-center space-y-3">
                  <div className="flex justify-center p-4 bg-card rounded-lg border border-border">
                    <SmartTaskIcon variant={variant as any} size="xl" animate />
                  </div>
                  <p className="text-sm font-medium text-foreground">{name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Size Variations */}
        <Card>
          <CardHeader>
            <CardTitle>Size Variations</CardTitle>
            <CardDescription>From favicon to hero sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-6 p-8 bg-white rounded-lg border">
              <div className="text-center space-y-2">
                <SmartTaskIcon size="xs" />
                <p className="text-xs">XS (16px)</p>
              </div>
              <div className="text-center space-y-2">
                <SmartTaskIcon size="sm" />
                <p className="text-xs">SM (20px)</p>
              </div>
              <div className="text-center space-y-2">
                <SmartTaskIcon size="md" />
                <p className="text-xs">MD (24px)</p>
              </div>
              <div className="text-center space-y-2">
                <SmartTaskIcon size="lg" />
                <p className="text-xs">LG (32px)</p>
              </div>
              <div className="text-center space-y-2">
                <SmartTaskIcon size="xl" />
                <p className="text-xs">XL (40px)</p>
              </div>
              <div className="text-center space-y-2">
                <SmartTaskIcon size="2xl" />
                <p className="text-xs">2XL (48px)</p>
              </div>
              <div className="text-center space-y-2">
                <SmartTaskIcon size="3xl" />
                <p className="text-xs">3XL (64px)</p>
              </div>
              <div className="text-center space-y-2">
                <SmartTaskIcon size={128} />
                <p className="text-xs">Custom (128px)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favicon */}
        <Card>
          <CardHeader>
            <CardTitle>Favicon</CardTitle>
            <CardDescription>Optimized for browser tabs and bookmarks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 p-6 bg-white rounded-lg border">
              <SmartTaskFavicon size={16} />
              <SmartTaskFavicon size={32} />
              <SmartTaskFavicon size={48} />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">Favicon sizes: 16px, 32px, 48px</p>
                <p className="text-xs text-gray-600">Simplified design optimized for small sizes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>How to implement in your components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Basic Usage</h4>
              <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
                <div>import {'{ SmartTaskIcon, SmartTaskLogo }'} from '@/components/ui/SmartTaskIcon';</div>
                <br />
                <div>// Basic icon</div>
                <div>&lt;SmartTaskIcon /&gt;</div>
                <br />
                <div>// With custom size and variant</div>
                <div>&lt;SmartTaskIcon size="lg" variant="gradient" animate /&gt;</div>
                <br />
                <div>// Logo with text</div>
                <div>&lt;SmartTaskLogo size="md" variant="dark" /&gt;</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(`import { SmartTaskIcon, SmartTaskLogo } from '@/components/ui/SmartTaskIcon';

// Basic usage
<SmartTaskIcon />

// With props
<SmartTaskIcon size="lg" variant="gradient" animate />

// Logo
<SmartTaskLogo size="md" variant="dark" />`)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Common Use Cases</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border space-y-2">
                  <div className="flex items-center gap-2">
                    <SmartTaskIcon size="sm" />
                    <span className="text-sm font-medium">Navigation Menu</span>
                  </div>
                  <code className="text-xs text-gray-600">size="sm" variant="default"</code>
                </div>
                
                <div className="p-4 bg-white rounded-lg border space-y-2">
                  <div className="flex items-center gap-2">
                    <SmartTaskIcon size="md" variant="gradient" />
                    <span className="text-sm font-medium">Buttons</span>
                  </div>
                  <code className="text-xs text-gray-600">size="md" variant="gradient"</code>
                </div>
                
                <div className="p-4 bg-white rounded-lg border space-y-2">
                  <div className="flex items-center gap-3">
                    <SmartTaskIcon size="xl" variant="gradient" animate />
                    <span className="text-sm font-medium">Hero Section</span>
                  </div>
                  <code className="text-xs text-gray-600">size="xl" variant="glass" animate</code>
                </div>
                
                <div className="p-4 bg-white rounded-lg border space-y-2">
                  <div className="flex items-center gap-2">
                    <SmartTaskIcon size="lg" variant="outline" />
                    <span className="text-sm font-medium">Cards</span>
                  </div>
                  <code className="text-xs text-gray-600">size="lg" variant="outline"</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Customization */}
        <Card>
          <CardHeader>
            <CardTitle>Customization Tips</CardTitle>
            <CardDescription>How to customize colors and styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">CSS Custom Properties</h4>
                <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-xs">
                  <div>/* Custom gradient colors */</div>
                  <div>.custom-icon {'{'}</div>
                  <div>&nbsp;&nbsp;--gradient-start: #your-color;</div>
                  <div>&nbsp;&nbsp;--gradient-end: #your-color;</div>
                  <div>{'}'}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Tailwind Classes</h4>
                <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-xs">
                  <div>&lt;SmartTaskIcon</div>
                  <div>&nbsp;&nbsp;className="text-blue-500"</div>
                  <div>&nbsp;&nbsp;variant="outline"</div>
                  <div>/&gt;</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IconShowcase;
