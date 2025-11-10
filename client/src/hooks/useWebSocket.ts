import { useEffect, useRef, useState } from 'react';

interface WSMessage {
  type: string;
  boardId?: string;
  data?: any;
  userId?: string;
}

export function useWebSocket(boardId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    if (!boardId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      // Join the board
      ws.send(JSON.stringify({
        type: 'join_board',
        boardId,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        
        // Handle user list updates
        if (message.type === 'users_list' && message.data) {
          setActiveUsers(message.data);
        } else if (message.type === 'user_joined' && message.userId) {
          setActiveUsers(prev => [...prev, message.userId!]);
        } else if (message.type === 'user_left' && message.userId) {
          setActiveUsers(prev => prev.filter(id => id !== message.userId));
        }

        // Call registered handlers
        const handler = messageHandlers.current.get(message.type);
        if (handler && message.data) {
          handler(message.data);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [boardId]);

  const send = (type: string, data?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    }
  };

  const on = (type: string, handler: (data: any) => void) => {
    messageHandlers.current.set(type, handler);
  };

  const off = (type: string) => {
    messageHandlers.current.delete(type);
  };

  return {
    isConnected,
    activeUsers,
    send,
    on,
    off,
  };
}
