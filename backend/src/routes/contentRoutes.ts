import { Router } from 'express';
import {
  getHomeFeed,
  getMovieById,
  getSeriesById,
  searchContent,
  getMoviesByGenre,
  getRelatedContent
} from '../controllers/contentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All content routes require authentication
router.use(authenticate);

// Routes
router.get('/home', getHomeFeed);
router.get('/search', searchContent);
router.get('/movies/genre/:genre', getMoviesByGenre);
// Related content route - must come before specific ID routes
router.get('/:id/related', getRelatedContent);
router.get('/movies/:id', getMovieById);
router.get('/series/:id', getSeriesById);

export default router;
