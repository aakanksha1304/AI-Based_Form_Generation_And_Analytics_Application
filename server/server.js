import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routes/useroute.js";
import formRouter from "./routes/formroute.js";
import { setBroadcastFunction } from "./controllers/submissioncontroller.js";

// Store SSE connections for real-time updates
const sseConnections = new Map();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.CORS_ORIGIN]
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// SSE endpoint for real-time updates
app.get('/api/events/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Store connection
  sseConnections.set(userId, res);
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Real-time updates connected' })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    sseConnections.delete(userId);
  });
});

// Function to broadcast updates to specific user
export const broadcastToUser = (userId, data) => {
  const connection = sseConnections.get(userId.toString());
  if (connection) {
    connection.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

// Set the broadcast function for the submission controller
setBroadcastFunction(broadcastToUser);

// Routes
app.use("/", userRouter);
app.use("/api", formRouter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err);
});