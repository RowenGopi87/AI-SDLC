"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Layout } from "@/components/layout/layout";

interface ConditionalLayoutProps {
  children: ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Show raw content (no layout) only for the home landing page
  if (pathname === '/') {
    return <>{children}</>;
  }
  
  // Use normal layout for all other pages (V1, V2, etc.)
  return <Layout>{children}</Layout>;
}
