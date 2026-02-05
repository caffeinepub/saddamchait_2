import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, Users, MessageSquare, FileText, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  currentPath: string;
  onNavigate: (route: any) => void;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/chats', label: 'Chats', icon: MessageSquare },
  { path: '/admin/reports', label: 'Reports', icon: FileText },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

function NavItems({ currentPath, onNavigate, onItemClick }: { currentPath: string; onNavigate: (route: any) => void; onItemClick?: () => void }) {
  return (
    <div className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;
        return (
          <Button
            key={item.path}
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start',
              isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
            onClick={() => {
              onNavigate(item.path);
              onItemClick?.();
            }}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}

export default function AdminLayout({ children, currentPath, onNavigate }: AdminLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-muted/40">
        <ScrollArea className="flex-1 p-4">
          <NavItems currentPath={currentPath} onNavigate={onNavigate} />
        </ScrollArea>
      </aside>

      {/* Mobile Menu */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <div className="mt-4">
              <NavItems 
                currentPath={currentPath} 
                onNavigate={onNavigate}
                onItemClick={() => {
                  // Close sheet after navigation
                  document.body.click();
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
