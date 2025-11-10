import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertBoardSchema, insertLayerSchema, insertStickyNoteSchema, insertStrokeSchema } from "@shared/schema";

interface WSMessage {
  type: string;
  boardId?: string;
  data?: any;
  userId?: string;
}

interface UserConnection {
  ws: WebSocket;
  boardId: string | null;
  userId: string;
}

const connections = new Map<WebSocket, UserConnection>();
const boardUsers = new Map<string, Set<string>>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Board routes
  app.get("/api/boards", async (req, res) => {
    try {
      const boards = await storage.getAllBoards();
      
      // Add active user count to each board
      const boardsWithUsers = boards.map(board => ({
        ...board,
        activeUsers: boardUsers.get(board.id)?.size || 0,
      }));
      
      res.json(boardsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch boards" });
    }
  });

  app.get("/api/boards/:id", async (req, res) => {
    try {
      const board = await storage.getBoard(req.params.id);
      if (!board) {
        return res.status(404).json({ error: "Board not found" });
      }
      res.json(board);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch board" });
    }
  });

  app.post("/api/boards", async (req, res) => {
    try {
      const validatedData = insertBoardSchema.parse(req.body);
      const board = await storage.createBoard(validatedData);
      res.status(201).json(board);
    } catch (error) {
      res.status(400).json({ error: "Invalid board data" });
    }
  });

  app.patch("/api/boards/:id", async (req, res) => {
    try {
      const board = await storage.updateBoard(req.params.id, req.body);
      if (!board) {
        return res.status(404).json({ error: "Board not found" });
      }
      res.json(board);
    } catch (error) {
      res.status(500).json({ error: "Failed to update board" });
    }
  });

  app.delete("/api/boards/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBoard(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Board not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete board" });
    }
  });

  // Layer routes
  app.get("/api/boards/:boardId/layers", async (req, res) => {
    try {
      const layers = await storage.getLayersByBoard(req.params.boardId);
      res.json(layers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch layers" });
    }
  });

  app.post("/api/boards/:boardId/layers", async (req, res) => {
    try {
      const validatedData = insertLayerSchema.parse({
        ...req.body,
        boardId: req.params.boardId,
      });
      const layer = await storage.createLayer(validatedData);
      res.status(201).json(layer);
    } catch (error) {
      res.status(400).json({ error: "Invalid layer data" });
    }
  });

  app.patch("/api/layers/:id", async (req, res) => {
    try {
      const layer = await storage.updateLayer(req.params.id, req.body);
      if (!layer) {
        return res.status(404).json({ error: "Layer not found" });
      }
      res.json(layer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update layer" });
    }
  });

  app.delete("/api/layers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLayer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Layer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete layer" });
    }
  });

  // Stroke routes
  app.get("/api/boards/:boardId/strokes", async (req, res) => {
    try {
      const strokes = await storage.getStrokesByBoard(req.params.boardId);
      res.json(strokes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch strokes" });
    }
  });

  app.post("/api/boards/:boardId/strokes", async (req, res) => {
    try {
      const validatedData = insertStrokeSchema.parse({
        ...req.body,
        boardId: req.params.boardId,
      });
      const stroke = await storage.createStroke(validatedData);
      res.status(201).json(stroke);
    } catch (error) {
      res.status(400).json({ error: "Invalid stroke data" });
    }
  });

  // Sticky note routes
  app.get("/api/boards/:boardId/notes", async (req, res) => {
    try {
      const notes = await storage.getNotesByBoard(req.params.boardId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/boards/:boardId/notes", async (req, res) => {
    try {
      const validatedData = insertStickyNoteSchema.parse({
        ...req.body,
        boardId: req.params.boardId,
      });
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const note = await storage.updateNote(req.params.id, req.body);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteNote(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  function broadcastToBoard(boardId: string, message: WSMessage, exclude?: WebSocket) {
    connections.forEach((conn, ws) => {
      if (conn.boardId === boardId && ws !== exclude && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  wss.on('connection', (ws: WebSocket) => {
    const userId = Math.random().toString(36).substring(7);
    
    connections.set(ws, {
      ws,
      boardId: null,
      userId,
    });

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        const conn = connections.get(ws);
        if (!conn) return;

        switch (message.type) {
          case 'join_board':
            if (message.boardId) {
              // Leave previous board
              if (conn.boardId) {
                const prevUsers = boardUsers.get(conn.boardId);
                if (prevUsers) {
                  prevUsers.delete(conn.userId);
                  broadcastToBoard(conn.boardId, {
                    type: 'user_left',
                    userId: conn.userId,
                  });
                }
              }

              // Join new board
              conn.boardId = message.boardId;
              if (!boardUsers.has(message.boardId)) {
                boardUsers.set(message.boardId, new Set());
              }
              boardUsers.get(message.boardId)!.add(conn.userId);

              // Notify others
              broadcastToBoard(message.boardId, {
                type: 'user_joined',
                userId: conn.userId,
              }, ws);

              // Send current users to new joiner
              const currentUsers = Array.from(boardUsers.get(message.boardId)!);
              ws.send(JSON.stringify({
                type: 'users_list',
                data: currentUsers,
              }));
            }
            break;

          case 'draw_stroke':
            if (conn.boardId && message.data) {
              // Save stroke to storage
              await storage.createStroke({
                ...message.data,
                boardId: conn.boardId,
              });

              // Broadcast to other users
              broadcastToBoard(conn.boardId, {
                type: 'draw_stroke',
                data: message.data,
                userId: conn.userId,
              }, ws);
            }
            break;

          case 'laser_pointer':
            if (conn.boardId && message.data) {
              broadcastToBoard(conn.boardId, {
                type: 'laser_pointer',
                data: message.data,
                userId: conn.userId,
              }, ws);
            }
            break;

          case 'note_update':
            if (conn.boardId && message.data) {
              if (message.data.id) {
                await storage.updateNote(message.data.id, message.data);
              } else {
                await storage.createNote({
                  ...message.data,
                  boardId: conn.boardId,
                });
              }

              broadcastToBoard(conn.boardId, {
                type: 'note_update',
                data: message.data,
                userId: conn.userId,
              }, ws);
            }
            break;

          case 'layer_update':
            if (conn.boardId && message.data) {
              if (message.data.id) {
                await storage.updateLayer(message.data.id, message.data);
              }

              broadcastToBoard(conn.boardId, {
                type: 'layer_update',
                data: message.data,
                userId: conn.userId,
              }, ws);
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      const conn = connections.get(ws);
      if (conn && conn.boardId) {
        const users = boardUsers.get(conn.boardId);
        if (users) {
          users.delete(conn.userId);
          broadcastToBoard(conn.boardId, {
            type: 'user_left',
            userId: conn.userId,
          });
        }
      }
      connections.delete(ws);
    });
  });

  return httpServer;
}
