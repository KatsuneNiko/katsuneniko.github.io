import express from 'express';
import { getGitHubProfile, getChangeStatus, invalidateCache } from '../services/githubService.js';

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

// Check if profile has changed (for polling)
router.get('/changes', async (req, res) => {
  try {
    const hasChanged = getChangeStatus();
    res.json({ hasChanged });
  } catch (error) {
    console.error('Error checking GitHub profile changes:', error);
    res.status(500).json({ error: 'Failed to check for changes' });
  }
});

// Force refresh profile (bypass cache)
router.post('/refresh', async (req, res) => {
  try {
    // Invalidate cache to force fresh fetch
    invalidateCache();
    const profile = await getGitHubProfile();
    res.json({ 
      success: true, 
      profile,
      message: 'Profile refreshed successfully'
    });
  } catch (error) {
    console.error('Error refreshing GitHub profile:', error);
    res.status(500).json({ error: 'Failed to refresh GitHub profile' });
  }
});

export default router;
