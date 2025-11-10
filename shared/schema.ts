import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const boards = pgTable("boards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  thumbnail: text("thumbnail"),
  width: integer("width").notNull().default(1920),
  height: integer("height").notNull().default(1080),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBoardSchema = createInsertSchema(boards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBoard = z.infer<typeof insertBoardSchema>;
export type Board = typeof boards.$inferSelect;

export const layers = pgTable("layers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  boardId: varchar("board_id").notNull().references(() => boards.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  visible: boolean("visible").notNull().default(true),
  opacity: integer("opacity").notNull().default(100),
  order: integer("order").notNull().default(0),
});

export const insertLayerSchema = createInsertSchema(layers).omit({
  id: true,
});

export type InsertLayer = z.infer<typeof insertLayerSchema>;
export type Layer = typeof layers.$inferSelect;

export const strokes = pgTable("strokes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  layerId: varchar("layer_id").notNull().references(() => layers.id, { onDelete: 'cascade' }),
  boardId: varchar("board_id").notNull().references(() => boards.id, { onDelete: 'cascade' }),
  tool: text("tool").notNull(),
  color: text("color").notNull(),
  width: integer("width").notNull(),
  points: jsonb("points").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStrokeSchema = createInsertSchema(strokes).omit({
  id: true,
  createdAt: true,
});

export type InsertStroke = z.infer<typeof insertStrokeSchema>;
export type Stroke = typeof strokes.$inferSelect;

export const stickyNotes = pgTable("sticky_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  boardId: varchar("board_id").notNull().references(() => boards.id, { onDelete: 'cascade' }),
  content: text("content").notNull().default(''),
  color: text("color").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull().default(192),
  height: integer("height").notNull().default(192),
});

export const insertStickyNoteSchema = createInsertSchema(stickyNotes).omit({
  id: true,
});

export type InsertStickyNote = z.infer<typeof insertStickyNoteSchema>;
export type StickyNote = typeof stickyNotes.$inferSelect;
