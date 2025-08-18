import { ReactNode } from 'react';
import { Metadata } from 'next';
import { APP_CONFIG } from '@/lib/config/app-config';

export const metadata: Metadata = {
  title: `${APP_CONFIG.APP_NAME} - ${APP_CONFIG.APP_DESCRIPTION}`,
  description: APP_CONFIG.APP_DESCRIPTION,
};

interface AuraV2LayoutProps {
  children: ReactNode;
}

export default function AuraV2Layout({ children }: AuraV2LayoutProps) {
  return (
    <>
      {children}
    </>
  );
}
