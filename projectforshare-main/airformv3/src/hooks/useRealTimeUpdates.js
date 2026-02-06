import { useEffect, useRef } from 'react';
import { getUserData } from '../utils/auth';

export const useRealTimeUpdates = (onUpdate) => {
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const userData = getUserData();
    if (!userData?.userId) return;

    // Create EventSource connection
    const eventSource = new EventSource(`http://localhost:5000/api/events/${userData.userId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Real-time updates connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📡 Real-time update received:', data);
        
        if (onUpdate && data.type !== 'connected') {
          onUpdate(data);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      // Reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log('🔄 Attempting to reconnect...');
          // The useEffect will handle reconnection when component re-renders
        }
      }, 5000);
    };

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [onUpdate]);

  return {
    disconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  };
};