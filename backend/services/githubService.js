import axios from 'axios';
import crypto from 'crypto';

const GITHUB_API = 'https://api.github.com';
const USERNAME = 'KatsuneNiko';

// Cache for GitHub data
let cachedProfile = null;
let lastCacheTime = null;
let lastProfileHash = null;
let hasChanges = false;

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Check if cache is still valid
const isCacheValid = () => {
  if (!lastCacheTime) return false;
  return (Date.now() - lastCacheTime) < CACHE_DURATION;
};

// Generate hash of profile data to detect changes
const generateProfileHash = (profile) => {
  const dataToHash = JSON.stringify({
    name: profile.name,
    bio: profile.bio,
    public_repos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    location: profile.location,
    blog: profile.blog,
    twitter_username: profile.twitter_username,
    avatar_url: profile.avatar_url,
    repos: profile.repos.map(r => ({
      name: r.name,
      description: r.description,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      language: r.language
    }))
  });
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
};

// Check if profile has changed since last fetch
const checkForChanges = (newHash) => {
  if (!lastProfileHash) {
    lastProfileHash = newHash;
    hasChanges = false;
    return false;
  }
  
  const changed = newHash !== lastProfileHash;
  if (changed) {
    console.log('🔔 GitHub profile changes detected!');
    hasChanges = true;
    lastProfileHash = newHash;
  }
  return changed;
};

// Get change status and reset flag
export const getChangeStatus = () => {
  const status = hasChanges;
  hasChanges = false; // Reset after reading
  return status;
};

// Force refresh by invalidating cache
export const invalidateCache = () => {
  lastCacheTime = null;
  console.log('🔄 Cache invalidated, will force fetch on next request');
};

// Fetch GitHub profile data
export const getGitHubProfile = async () => {
  try {
    if (isCacheValid() && cachedProfile) {
      console.log('✅ Returning cached GitHub profile');
      return cachedProfile;
    }

    console.log('🔄 Fetching GitHub profile...');

    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch user profile
    const profileResponse = await axios.get(`${GITHUB_API}/users/${USERNAME}`, { headers });
    const profile = profileResponse.data;

    // Fetch repositories
    const reposResponse = await axios.get(`${GITHUB_API}/users/${USERNAME}/repos?sort=updated&per_page=6`, { headers });
    const repos = reposResponse.data;

    // Fetch recent events (contributions)
    const eventsResponse = await axios.get(`${GITHUB_API}/users/${USERNAME}/events/public?per_page=10`, { headers });
    const events = eventsResponse.data;

    // Process data
    cachedProfile = {
      name: profile.name || profile.login,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      html_url: profile.html_url,
      public_repos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      location: profile.location,
      blog: profile.blog,
      twitter_username: profile.twitter_username,
      repos: repos.map(repo => ({
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at
      })),
      recentActivity: events.slice(0, 5).map(event => ({
        type: event.type,
        repo: event.repo.name,
        created_at: event.created_at
      }))
    };

    // Check for changes and generate hash
    const profileHash = generateProfileHash(cachedProfile);
    const changed = checkForChanges(profileHash);

    lastCacheTime = Date.now();
    console.log('✅ GitHub profile cached successfully');

    return {
      ...cachedProfile,
      hasChanged: changed
    };
  } catch (error) {
    console.error('❌ Error fetching GitHub profile:', error.message);
    
    // Return cached data if available, even if expired
    if (cachedProfile) {
      console.log('⚠️  Returning stale cache due to API error');
      return cachedProfile;
    }

    throw error;
  }
};

