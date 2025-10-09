import Link from 'next/link';
import {
  Home,
  Bot,
  Menu,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserNav } from '@/components/layout/user-nav';
import { SidebarTrigger } from '../ui/sidebar';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="sm:hidden">
        <SidebarTrigger />
      </div>
      
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Search can be added here if needed */}
      </div>
      <UserNav />
    </header>
  );
}
