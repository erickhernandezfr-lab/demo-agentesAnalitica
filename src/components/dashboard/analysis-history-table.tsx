'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  Loader,
  AlertCircle,
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

import type { Job, JobStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClientOnly } from '@/components/ui/client-only';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import Link from 'next/link';

const statusIcons: Record<JobStatus, React.ReactElement> = {
  insight_forge_pending: <Loader className="animate-spin text-blue-600" />,
  insight_forge_completed: <CheckCircle2 className="text-green-600" />,
  analytic_core_pending: <Loader className="animate-spin text-blue-600" />,
  analytic_core_completed: <CheckCircle2 className="text-green-600" />,
  tagops_hub_pending: <Loader className="animate-spin text-blue-600" />,
  tagops_hub_completed: <CheckCircle2 className="text-green-600" />,
  failed: <AlertCircle className="text-destructive" />,
};

const statusColors: Record<string, string> = {
  pending:
    'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-400',
  completed:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
};

const getStatusDisplay = (status: JobStatus) => {
    const parts = status.split('_');
    const stage = parts.slice(0, -1).join(' ');
    const state = parts[parts.length - 1];
    
    let colorClass = '';
    if (state === 'pending') colorClass = statusColors.pending;
    if (state === 'completed') colorClass = statusColors.completed;
    if (status === 'failed') colorClass = statusColors.failed;

    return {
        text: status.replace(/_/g, ' '),
        colorClass,
        icon: statusIcons[status] || <AlertCircle className="text-gray-400" />
    };
}


const StatusBadge = ({ status }: { status: JobStatus }) => {
  const { text, colorClass, icon } = getStatusDisplay(status);
  return (
    <Badge
      variant="outline"
      className={cn('border-0 capitalize', colorClass)}
    >
      {React.cloneElement(icon, { className: 'mr-1 h-3 w-3' })}
      {text}
    </Badge>
  );
};

export function AnalysisHistoryTable() {
  const [snapshot, loading, error] = useCollection(
    query(collection(getFirestore(app), 'jobs'), orderBy('createdAt', 'desc'))
  );

  const analyses = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job & {id: string})) || [];

  return (
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
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading history...
                  </TableCell>
                </TableRow>
              )}
              {error && (
                 <TableRow>
                  <TableCell colSpan={4} className="text-center text-destructive">
                    Error loading history: {error.message}
                  </TableCell>
                </TableRow>
              )}
              {!loading && analyses.map(analysis => (
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
                    <StatusBadge status={analysis.status} />
                  </TableCell>
                 
                  <TableCell className="hidden lg:table-cell">
                    <ClientOnly>
                      {analysis.createdAt ? format(analysis.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}
                    </ClientOnly>
                  </TableCell>
                  <TableCell>
                     <Link href={`/dashboard/jobs/${analysis.id}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                        View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );
}
