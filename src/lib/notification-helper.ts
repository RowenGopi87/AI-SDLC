import { useNotificationStore } from '@/store/notification-store';

// Notification helper functions to replace alert() calls
export const notify = {
  success: (title: string, message: string, options?: { duration?: number; autoClose?: boolean }) => {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'success',
      duration: options?.duration || 5000,
      autoClose: options?.autoClose !== false,
    });
  },

  error: (title: string, message: string, options?: { duration?: number; autoClose?: boolean }) => {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'error',
      duration: options?.duration || 8000,
      autoClose: options?.autoClose !== false,
    });
  },

  warning: (title: string, message: string, options?: { duration?: number; autoClose?: boolean }) => {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'warning',
      duration: options?.duration || 6000,
      autoClose: options?.autoClose !== false,
    });
  },

  info: (title: string, message: string, options?: { duration?: number; autoClose?: boolean }) => {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'info',
      duration: options?.duration || 5000,
      autoClose: options?.autoClose !== false,
    });
  },

  // Convenience method for replacing simple alert() calls
  alert: (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    useNotificationStore.getState().addNotification({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message,
      type,
      duration: 5000,
      autoClose: true,
    });
  },

  // Method for requirement generation success
  requirementGenerated: (count: number, metadata: any) => {
    const title = count > 1 ? 'Requirements Generated' : 'Requirement Generated';
    const message = count > 1 
      ? `Successfully generated ${count} requirements in ${metadata.iterationCount} iterations using ${metadata.llmProvider} ${metadata.llmModel}. Processing time: ${Math.round(metadata.processingTime / 1000)}s`
      : `Successfully generated requirement using ${metadata.llmProvider} ${metadata.llmModel}. Processing time: ${Math.round(metadata.processingTime / 1000)}s`;
    
    useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'success',
      duration: 8000,
      autoClose: true,
    });
  },

  // Method for auto-parsing success
  autoParsed: (count: number) => {
    useNotificationStore.getState().addNotification({
      title: 'Auto-parsing Successful',
      message: `Automatically extracted ${count} individual feature cards from OpenAI JSON response. No manual re-parsing needed!`,
      type: 'success',
      duration: 8000,
      autoClose: true,
    });
  },
}; 