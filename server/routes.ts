import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBoardSchema, insertLayerSchema, insertStickyNoteSchema, insertStrokeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Board routes
  app.get("/api/boards", async (req, res) => {
    try {
      const boards = await storage.getAllBoards();
      res.json(boards);
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

  return httpServer;
}
