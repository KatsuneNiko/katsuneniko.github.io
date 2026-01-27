import express from 'express';
import { getGitHubProfile } from '../services/githubService.js';

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

export default router;
