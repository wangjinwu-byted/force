import {
  type User,
  type InsertUser,
  type Board,
  type InsertBoard,
  type Layer,
  type InsertLayer,
  type Stroke,
  type InsertStroke,
  type StickyNote,
  type InsertStickyNote,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Board methods
  getAllBoards(): Promise<Board[]>;
  getBoard(id: string): Promise<Board | undefined>;
  createBoard(board: InsertBoard): Promise<Board>;
  updateBoard(id: string, board: Partial<InsertBoard>): Promise<Board | undefined>;
  deleteBoard(id: string): Promise<boolean>;

  // Layer methods
  getLayersByBoard(boardId: string): Promise<Layer[]>;
  getLayer(id: string): Promise<Layer | undefined>;
  createLayer(layer: InsertLayer): Promise<Layer>;
  updateLayer(id: string, layer: Partial<InsertLayer>): Promise<Layer | undefined>;
  deleteLayer(id: string): Promise<boolean>;

  // Stroke methods
  getStrokesByBoard(boardId: string): Promise<Stroke[]>;
  getStrokesByLayer(layerId: string): Promise<Stroke[]>;
  createStroke(stroke: InsertStroke): Promise<Stroke>;
  deleteStroke(id: string): Promise<boolean>;
  deleteStrokesByLayer(layerId: string): Promise<void>;

  // Sticky note methods
  getNotesByBoard(boardId: string): Promise<StickyNote[]>;
  getNote(id: string): Promise<StickyNote | undefined>;
  createNote(note: InsertStickyNote): Promise<StickyNote>;
  updateNote(id: string, note: Partial<InsertStickyNote>): Promise<StickyNote | undefined>;
  deleteNote(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private boards: Map<string, Board>;
  private layers: Map<string, Layer>;
  private strokes: Map<string, Stroke>;
  private stickyNotes: Map<string, StickyNote>;

  constructor() {
    this.users = new Map();
    this.boards = new Map();
    this.layers = new Map();
    this.strokes = new Map();
    this.stickyNotes = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Board methods
  async getAllBoards(): Promise<Board[]> {
    return Array.from(this.boards.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getBoard(id: string): Promise<Board | undefined> {
    return this.boards.get(id);
  }

  async createBoard(insertBoard: InsertBoard): Promise<Board> {
    const id = randomUUID();
    const now = new Date();
    const board: Board = {
      id,
      name: insertBoard.name,
      thumbnail: insertBoard.thumbnail ?? null,
      width: insertBoard.width ?? 1920,
      height: insertBoard.height ?? 1080,
      createdAt: now,
      updatedAt: now,
    };
    this.boards.set(id, board);
    
    // Create a default layer for the new board
    await this.createLayer({
      boardId: id,
      name: 'Layer 1',
      visible: true,
      opacity: 100,
      order: 0,
    });
    
    return board;
  }

  async updateBoard(id: string, update: Partial<InsertBoard>): Promise<Board | undefined> {
    const board = this.boards.get(id);
    if (!board) return undefined;

    const updated: Board = {
      ...board,
      ...update,
      updatedAt: new Date(),
    };
    this.boards.set(id, updated);
    return updated;
  }

  async deleteBoard(id: string): Promise<boolean> {
    const deleted = this.boards.delete(id);
    if (deleted) {
      // Delete associated layers
      const layers = Array.from(this.layers.values()).filter(l => l.boardId === id);
      for (const layer of layers) {
        await this.deleteLayer(layer.id);
      }
      // Delete associated notes
      Array.from(this.stickyNotes.values())
        .filter(n => n.boardId === id)
        .forEach(n => this.stickyNotes.delete(n.id));
    }
    return deleted;
  }

  // Layer methods
  async getLayersByBoard(boardId: string): Promise<Layer[]> {
    return Array.from(this.layers.values())
      .filter(l => l.boardId === boardId)
      .sort((a, b) => a.order - b.order);
  }

  async getLayer(id: string): Promise<Layer | undefined> {
    return this.layers.get(id);
  }

  async createLayer(insertLayer: InsertLayer): Promise<Layer> {
    const id = randomUUID();
    const layer: Layer = {
      id,
      boardId: insertLayer.boardId,
      name: insertLayer.name,
      visible: insertLayer.visible ?? true,
      opacity: insertLayer.opacity ?? 100,
      order: insertLayer.order ?? 0,
    };
    this.layers.set(id, layer);
    return layer;
  }

  async updateLayer(id: string, update: Partial<InsertLayer>): Promise<Layer | undefined> {
    const layer = this.layers.get(id);
    if (!layer) return undefined;

    const updated: Layer = { ...layer, ...update };
    this.layers.set(id, updated);
    return updated;
  }

  async deleteLayer(id: string): Promise<boolean> {
    const deleted = this.layers.delete(id);
    if (deleted) {
      await this.deleteStrokesByLayer(id);
    }
    return deleted;
  }

  // Stroke methods
  async getStrokesByBoard(boardId: string): Promise<Stroke[]> {
    return Array.from(this.strokes.values())
      .filter(s => s.boardId === boardId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getStrokesByLayer(layerId: string): Promise<Stroke[]> {
    return Array.from(this.strokes.values())
      .filter(s => s.layerId === layerId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createStroke(insertStroke: InsertStroke): Promise<Stroke> {
    const id = randomUUID();
    const stroke: Stroke = {
      ...insertStroke,
      id,
      createdAt: new Date(),
    };
    this.strokes.set(id, stroke);
    return stroke;
  }

  async deleteStroke(id: string): Promise<boolean> {
    return this.strokes.delete(id);
  }

  async deleteStrokesByLayer(layerId: string): Promise<void> {
    Array.from(this.strokes.values())
      .filter(s => s.layerId === layerId)
      .forEach(s => this.strokes.delete(s.id));
  }

  // Sticky note methods
  async getNotesByBoard(boardId: string): Promise<StickyNote[]> {
    return Array.from(this.stickyNotes.values())
      .filter(n => n.boardId === boardId);
  }

  async getNote(id: string): Promise<StickyNote | undefined> {
    return this.stickyNotes.get(id);
  }

  async createNote(insertNote: InsertStickyNote): Promise<StickyNote> {
    const id = randomUUID();
    const note: StickyNote = {
      id,
      boardId: insertNote.boardId,
      content: insertNote.content ?? '',
      color: insertNote.color,
      x: insertNote.x,
      y: insertNote.y,
      width: insertNote.width ?? 192,
      height: insertNote.height ?? 192,
    };
    this.stickyNotes.set(id, note);
    return note;
  }

  async updateNote(id: string, update: Partial<InsertStickyNote>): Promise<StickyNote | undefined> {
    const note = this.stickyNotes.get(id);
    if (!note) return undefined;

    const updated: StickyNote = { ...note, ...update };
    this.stickyNotes.set(id, updated);
    return updated;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.stickyNotes.delete(id);
  }
}

export const storage = new MemStorage();
