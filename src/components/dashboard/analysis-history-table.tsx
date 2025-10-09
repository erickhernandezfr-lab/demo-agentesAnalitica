'use client';

import * as React from 'react';
import {
  FileDown,
  MoreHorizontal,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader,
  CircleDot,
} from 'lucide-react';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import type { Analysis } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScreenshotViewer } from './screenshot-viewer';

type AnalysisHistoryTableProps = {
  analyses: Analysis[];
};

const statusIcons = {
  completed: <CheckCircle2 className="text-green-600" />,
  in_progress: <Loader className="animate-spin text-blue-600" />,
  pending: <CircleDot className="text-muted-foreground" />,
  failed: <AlertCircle className="text-destructive" />,
};

const statusColors: { [key in Analysis['status']]: string } = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
};

export function AnalysisHistoryTable({ analyses }: AnalysisHistoryTableProps) {
  const [selectedAnalysis, setSelectedAnalysis] = React.useState<Analysis | null>(null);
  const [isScreenshotViewerOpen, setScreenshotViewerOpen] = React.useState(false);

  const handleViewScreenshots = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setScreenshotViewerOpen(true);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>
            An overview of your recent website analyses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">SEO Score</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses.map((analysis) => (
                <TableRow key={analysis.id}>
                  <TableCell>
                    <div className="font-medium">{new URL(analysis.url).hostname}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {analysis.url}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className={cn("border-0 capitalize", statusColors[analysis.status])}>
                       {React.cloneElement(statusIcons[analysis.status], { className: "mr-1 h-3 w-3"})}
                      {analysis.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {analysis.seoScore !== null ? `${analysis.seoScore}/100` : 'N/A'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {format(new Date(analysis.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={analysis.screenshots.length === 0}
                          onSelect={() => handleViewScreenshots(analysis)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Screenshots
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!analysis.guidePdfUrl}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the analysis for <span className="font-medium">{analysis.url}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className={cn(buttonVariants({variant: 'destructive'}))}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedAnalysis && (
        <ScreenshotViewer
          isOpen={isScreenshotViewerOpen}
          onOpenChange={setScreenshotViewerOpen}
          analysis={selectedAnalysis}
        />
      )}
    </>
  );
}
