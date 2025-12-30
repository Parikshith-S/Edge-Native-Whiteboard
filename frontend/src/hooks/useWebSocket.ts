// frontend/src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import type { DrawStroke } from '../types';

export const useWebSocket = (roomId: string) => {
  const ws = useRef<WebSocket | null>(null);
  const [remoteStrokes, setRemoteStrokes] = useState<DrawStroke[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Determine WebSocket URL (handling dev vs prod)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the Vite proxy path '/ws' we set up earlier
    const wsUrl = `${protocol}//${window.location.host}/ws/${roomId}`;

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Assuming the data is a stroke object
        if (data.points) {
          setRemoteStrokes((prev) => [...prev, data]);
        }
      } catch (e) {
        console.error('Failed to parse message', e);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [roomId]);

  const sendStroke = (stroke: DrawStroke) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(stroke));
    } else {
      console.warn('WebSocket is not connected. Current state:', ws.current?.readyState);
    }
  };

  return { remoteStrokes, sendStroke, isConnected };
};
