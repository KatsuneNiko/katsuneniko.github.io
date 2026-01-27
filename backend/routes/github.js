import express from 'express';
import { getGitHubProfile, refreshGitHubCache } from '../services/githubService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get cached GitHub profile data
router.get('/profile', async (req, res) => {
  try {
    const profile = await getGitHubProfile();
    res.json(profile);
  } catch (error) {
    console.error('Error fetching GitHub profile:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub profile' });
  }
});

// Refresh GitHub cache (protected route)
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const profile = await refreshGitHubCache();
    res.json({ message: 'Cache refreshed successfully', profile });
  } catch (error) {
    console.error('Error refreshing GitHub cache:', error);
    res.status(500).json({ error: 'Failed to refresh cache' });
  }
});

export default router;
