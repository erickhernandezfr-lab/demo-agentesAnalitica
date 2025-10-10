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
  FileText,
  FileJson,
  GanttChart,
  BrainCircuit,
  RefreshCw,
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

import type { Analysis, AnalysisStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScreenshotViewer } from './screenshot-viewer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AnalysisHistoryTableProps = {
  analyses: Analysis[];
};

const statusIcons: Record<AnalysisStatus, React.ReactElement> = {
  completed: <CheckCircle2 className="text-green-600" />,
  in_progress: <Loader className="animate-spin text-blue-600" />,
  pending: <CircleDot className="text-muted-foreground" />,
  failed: <AlertCircle className="text-destructive" />,
  not_started: <CircleDot className="text-gray-400" />,
};

const statusColors: Record<AnalysisStatus, string> = {
  completed:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  in_progress:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
  pending:
    'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
  not_started:
    'bg-gray-200 text-gray-500 dark:bg-gray-800/20 dark:text-gray-500',
};

const StatusBadge = ({ status }: { status: AnalysisStatus }) => {
  return (
    <Badge
      variant="outline"
      className={cn('border-0 capitalize', statusColors[status])}
    >
      {React.cloneElement(statusIcons[status], { className: 'mr-1 h-3 w-3' })}
      {status.replace('_', ' ')}
    </Badge>
  );
};

export function AnalysisHistoryTable({ analyses }: AnalysisHistoryTableProps) {
  const [selectedAnalysis, setSelectedAnalysis] =
    React.useState<Analysis | null>(null);
  const [isScreenshotViewerOpen, setScreenshotViewerOpen] =
    React.useState(false);

  const handleViewScreenshots = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setScreenshotViewerOpen(true);
  };

  return (
    <TooltipProvider>
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
                <TableHead>
                  <Tooltip>
                    <TooltipTrigger>Scrapping</TooltipTrigger>
                    <TooltipContent>Website Scrapping</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead>
                  <Tooltip>
                    <TooltipTrigger>Analysis</TooltipTrigger>
                    <TooltipContent>SEO Analysis</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead>
                  <Tooltip>
                    <TooltipTrigger>Report</TooltipTrigger>
                    <TooltipContent>Tagging Report Generation</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses.map(analysis => (
                <TableRow key={analysis.id}>
                  <TableCell>
                    <div className="font-medium">
                      {new URL(analysis.url).hostname}
                    </div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {analysis.url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={analysis.scrappingStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={analysis.analysisStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={analysis.reportStatus} />
                  </TableCell>
                  <TableCell>
                    {analysis.pdfStatus === 'completed' &&
                    analysis.reportPdfUrl ? (
                      <a
                        href={analysis.reportPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ variant: 'link', size: 'sm' }),
                          'h-auto p-0'
                        )}
                      >
                        View PDF
                      </a>
                    ) : (
                      <StatusBadge status={analysis.pdfStatus} />
                    )}
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
                        <DropdownMenuItem>
                          <GanttChart className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={analysis.screenshots.length === 0}
                          onSelect={() => handleViewScreenshots(analysis)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Screenshots
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileJson className="mr-2 h-4 w-4" />
                          View Scrap JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BrainCircuit className="mr-2 h-4 w-4" />
                          View Analysis
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Report
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!analysis.reportPdfUrl}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Re-run
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={e => e.preventDefault()}
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the analysis for{' '}
                                <span className="font-medium">
                                  {analysis.url}
                                </span>
                                .
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className={cn(
                                  buttonVariants({ variant: 'destructive' })
                                )}
                              >
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
    </TooltipProvider>
  );
}
