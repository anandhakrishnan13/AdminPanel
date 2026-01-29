import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

// Route to breadcrumb mapping
const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Dashboard' }],
  '/users': [{ label: 'Dashboard', path: '/' }, { label: 'User Management' }],
  '/users/create': [{ label: 'Dashboard', path: '/' }, { label: 'User Management', path: '/users' }, { label: 'Add User' }],
  '/departments': [{ label: 'Dashboard', path: '/' }, { label: 'Departments' }],
  '/departments/create': [{ label: 'Dashboard', path: '/' }, { label: 'Departments', path: '/departments' }, { label: 'Add Department' }],
  '/roles': [{ label: 'Dashboard', path: '/' }, { label: 'Roles & Permissions' }],
  '/roles/create': [{ label: 'Dashboard', path: '/' }, { label: 'Roles & Permissions', path: '/roles' }, { label: 'Create Role' }],
  '/reports': [{ label: 'Dashboard', path: '/' }, { label: 'Reports' }],
  '/reports/generate': [{ label: 'Dashboard', path: '/' }, { label: 'Reports', path: '/reports' }, { label: 'Generate Report' }],
  '/settings': [{ label: 'Dashboard', path: '/' }, { label: 'Settings' }],
  '/settings/security': [{ label: 'Dashboard', path: '/' }, { label: 'Settings', path: '/settings' }, { label: 'Security' }],
  '/settings/notifications': [{ label: 'Dashboard', path: '/' }, { label: 'Settings', path: '/settings' }, { label: 'Notifications' }],
  '/audit': [{ label: 'Dashboard', path: '/' }, { label: 'Audit Logs' }],
};

const ChevronRight = (): ReactNode => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="text-muted-foreground"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const HomeIcon = (): ReactNode => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps): ReactNode => {
  const location = useLocation();
  
  // Use provided items or derive from current route
  const breadcrumbItems = items ?? routeBreadcrumbs[location.pathname] ?? [{ label: 'Dashboard', path: '/' }];

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-4', className)}>
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2">
                  <ChevronRight />
                </span>
              )}
              
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground',
                    isFirst && 'font-medium'
                  )}
                >
                  {isFirst && <HomeIcon />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1.5',
                    isLast ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isFirst && <HomeIcon />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
