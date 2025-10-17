import { Dispatch, SetStateAction } from 'react';
import {
  Menu,
} from 'lucide-react';
import { UserNav } from '@/components/layout/user-nav';
import { SidebarTrigger } from '../ui/sidebar';
import { NewAnalysisDialog } from '@/components/dashboard/new-analysis-dialog';

interface HeaderProps {
  setJobId: (jobId: string) => void;
}

export function Header({ setJobId }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="sm:hidden">
        <SidebarTrigger />
      </div>
      
      <div className="relative ml-auto flex-1 md:grow-0">
        <NewAnalysisDialog setJobId={setJobId} />
      </div>
      <UserNav />
    </header>
  );
}
