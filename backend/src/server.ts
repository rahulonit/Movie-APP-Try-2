import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from 'express';

// Load environment variables as early as possible so other modules (auth, mux, etc.)
// can read `process.env` during their initialization.
dotenv.config();
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database';
import { errorHandler, notFound } from './middleware/error';

// Routes
import authRoutes from './routes/authRoutes';
import contentRoutes from './routes/contentRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';

// (dotenv already configured above)

// Connect to MongoDB
connectDB();

// Initialize Express app
const app: Application = express();

// ===== Security Middleware =====
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ===== CORS =====
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

// In development allow all origins (makes working with Expo/dev servers easier).
// In production, use the explicit ALLOWED_ORIGINS list for security.
const corsOptions = process.env.NODE_ENV === 'development'
  ? { origin: true, credentials: true }
  : {
      origin: (origin: any, callback: any) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    };

app.use(cors(corsOptions));

// ===== Body Parsers =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== Compression =====
app.use(compression());

// ===== Logging =====
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ===== Rate Limiting =====
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// ===== Health Check =====
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// ===== API Routes =====
app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);

// ===== 404 Handler =====
app.use(notFound);

// ===== Error Handler =====
app.use(errorHandler);

// ===== Start Server =====
// Default to 5002 to avoid conflicts with other local services
const PORT = process.env.PORT || 5002;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   OTT Streaming Platform Server      ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   Port: ${PORT}                         ║
║   Status: Running ✓                   ║
╚═══════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;
