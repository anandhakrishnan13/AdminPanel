import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/common';

export const NotFound = (): ReactNode => {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
      <p className="mt-2 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
