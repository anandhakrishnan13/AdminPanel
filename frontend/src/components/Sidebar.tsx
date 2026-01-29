import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

// Icons - using inline SVGs for simplicity (can be replaced with lucide-react)
const icons: Record<string, ReactNode> = {
  LayoutDashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  ),
  Users: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Building2: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  ),
  Shield: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  ),
  FileText: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  ),
  Settings: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  ClipboardList: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  ),
  ChevronDown: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  ChevronRight: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
};

// Navigation data
const navigationItems: NavItem[] = [
  {
    id: 'nav_dashboard',
    title: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/',
    permission: 'dashboard',
    children: [],
  },
  {
    id: 'nav_users',
    title: 'User Management',
    icon: 'Users',
    path: '/users',
    permission: 'users',
    children: [
      { id: 'nav_users_list', title: 'All Users', path: '/users', permission: 'users.view' },
      { id: 'nav_users_create', title: 'Add User', path: '/users/create', permission: 'users.create' },
    ],
  },
  {
    id: 'nav_departments',
    title: 'Departments',
    icon: 'Building2',
    path: '/departments',
    permission: 'departments',
    children: [
      { id: 'nav_departments_list', title: 'All Departments', path: '/departments', permission: 'departments.view' },
      { id: 'nav_departments_create', title: 'Add Department', path: '/departments/create', permission: 'departments.create' },
    ],
  },
  {
    id: 'nav_roles',
    title: 'Roles & Permissions',
    icon: 'Shield',
    path: '/roles',
    permission: 'roles',
    children: [
      { id: 'nav_roles_list', title: 'All Roles', path: '/roles', permission: 'roles.view' },
      { id: 'nav_roles_create', title: 'Create Role', path: '/roles/create', permission: 'roles.create' },
    ],
  },
  {
    id: 'nav_reports',
    title: 'Reports',
    icon: 'FileText',
    path: '/reports',
    permission: 'reports',
    children: [
      { id: 'nav_reports_view', title: 'View Reports', path: '/reports', permission: 'reports.view' },
      { id: 'nav_reports_generate', title: 'Generate Report', path: '/reports/generate', permission: 'reports.generate' },
    ],
  },
  {
    id: 'nav_settings',
    title: 'Settings',
    icon: 'Settings',
    path: '/settings',
    permission: 'settings',
    children: [
      { id: 'nav_settings_general', title: 'General', path: '/settings', permission: 'settings.general' },
      { id: 'nav_settings_security', title: 'Security', path: '/settings/security', permission: 'settings.security' },
      { id: 'nav_settings_notifications', title: 'Notifications', path: '/settings/notifications', permission: 'settings.notifications' },
    ],
  },
  {
    id: 'nav_audit',
    title: 'Audit Logs',
    icon: 'ClipboardList',
    path: '/audit',
    permission: 'audit',
    children: [],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
}

const SidebarItem = ({ item, collapsed }: SidebarItemProps): ReactNode => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const hasChildren = item.children && item.children.length > 0;
  
  const isActive = location.pathname === item.path || 
    (hasChildren && item.children?.some(child => location.pathname === child.path));
  
  const isChildActive = (childPath: string): boolean => location.pathname === childPath;

  const handleClick = (): void => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="mb-1">
      {hasChildren ? (
        <button
          onClick={handleClick}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          )}
        >
          {item.icon && icons[item.icon] ? icons[item.icon] : null}
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              <span className={cn('transition-transform', isOpen && 'rotate-180')}>
                {icons.ChevronDown}
              </span>
            </>
          )}
        </button>
      ) : (
        <Link
          to={item.path}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          )}
        >
          {item.icon && icons[item.icon] ? icons[item.icon] : null}
          {!collapsed && <span>{item.title}</span>}
        </Link>
      )}
      
      {/* Subsections */}
      {hasChildren && isOpen && !collapsed && (
        <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
          {item.children?.map((child) => (
            <Link
              key={child.id}
              to={child.path}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isChildActive(child.path) 
                  ? 'bg-accent/50 text-accent-foreground font-medium' 
                  : 'text-muted-foreground'
              )}
            >
              {icons.ChevronRight}
              <span>{child.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ collapsed = false }: SidebarProps): ReactNode => {
  return (
    <aside
      className={cn(
        'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <SidebarItem key={item.id} item={item} collapsed={collapsed} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className={cn(
            'flex items-center gap-3',
            collapsed && 'justify-center'
          )}>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">SA</span>
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">Super Admin</p>
                <p className="truncate text-xs text-muted-foreground">superadmin@company.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
