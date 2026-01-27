# KatsuneNiko Portfolio & Yu-Gi-Oh Binder

A full-stack web application featuring a personal portfolio and Yu-Gi-Oh card collection manager. Built with React, Node.js, Express, and MongoDB.

## 🌟 Features

### Portfolio (Home Page)
- Displays GitHub profile information
- Shows recent repositories with stats
- Recent activity feed
- Responsive design with dark theme

### Yu-Gi-Oh Binder
- View your card collection
- Search cards by name
- Real-time TCGPlayer pricing (cached for 24 hours)
- Card details: ID, name, set code, rarity, quantity, price
- Last updated timestamps

### Binder Editor (Protected)
- Secure login with JWT authentication
- Add new cards from YGOProDeck database
- Increment/decrement card quantities
- Delete cards from collection
- Search through 10,000+ Yu-Gi-Oh cards

## 🏗️ Architecture

- **Frontend**: React (Vite) hosted on GitHub Pages
- **Backend**: Node.js + Express hosted on Render.com
- **Database**: MongoDB Atlas (MongoFree cluster)
- **Authentication**: JWT tokens + bcrypt password hashing
- **Rate Limiting**: 5 login attempts per 15 minutes
- **Caching**: 
  - YGOProDeck database (weekly refresh)
  - TCGPlayer prices (24-hour refresh)
  - GitHub profile data (1-hour refresh)

## 📁 Project Structure

```
katsuneniko.github.io/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # Auth & rate limiting
│   ├── server.js        # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   └── styles/      # CSS files
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- GitHub account
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` with your credentials:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   GITHUB_TOKEN=optional-github-token
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` with backend URL:**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

### Database Setup

1. **Create MongoDB Collections:**

   In your MongoDB Atlas cluster `yugioh-binder` database, create these collections:

   - `cards` - Stores user's card collection
   - `login` - Stores authentication credentials
   - `yugioh-cardinfo` - Caches YGOProDeck data

2. **Create Admin User:**

   You need to manually insert a user document into the `login` collection. The password will be automatically hashed on first save if you use the API, or you can hash it manually:

   ```javascript
   // Use bcrypt to hash your password
   const bcrypt = require('bcryptjs');
   const hashedPassword = await bcrypt.hash('your-password', 10);
   
   // Insert into MongoDB
   {
     "username": "admin",
     "password": hashedPassword
   }
   ```

## 📦 Deployment

### Deploy Backend to Render.com

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render account:**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `katsuneniko-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: `Free`

4. **Add Environment Variables:**
   - Go to "Environment" tab
   - Add all variables from `.env`:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NODE_ENV=production`
     - `FRONTEND_URL=https://katsuneniko.github.io`

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy your backend URL: `https://katsuneniko-backend.onrender.com`

### Deploy Frontend to GitHub Pages

1. **Update frontend `.env` for production:**
   
   Create `.env.production`:
   ```env
   VITE_API_URL=https://katsuneniko-backend.onrender.com
   ```

2. **Update `vite.config.js`:**
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/', // or '/repository-name/' if not using custom domain
     // ... rest of config
   })
   ```

3. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

4. **Deploy to GitHub Pages:**
   
   Option A: Manual deployment
   ```bash
   # Install gh-pages
   npm install -g gh-pages
   
   # Deploy
   gh-pages -d dist
   ```

   Option B: GitHub Actions (recommended)
   
   Create `.github/workflows/deploy.yml` in root:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             
         - name: Install and Build
           run: |
             cd frontend
             npm install
             npm run build
             
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./frontend/dist
   ```

5. **Enable GitHub Pages:**
   - Go to repository settings
   - Navigate to "Pages"
   - Source: Deploy from `gh-pages` branch
   - Save

6. **Visit your site:**
   - `https://katsuneniko.github.io`

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: 24-hour token expiry
- **Rate Limiting**: 
  - 5 login attempts per 15 minutes
- **Environment Variables**: Sensitive data never exposed
- **CORS**: Restricted to frontend domain only
- **Protected Routes**: Editor requires authentication

## 🎨 Customization

### Changing Colors

Edit `frontend/src/styles/global.css`:
```css
:root {
  --primary-color: #6366f1;  /* Main theme color */
  --background: #0f172a;      /* Background color */
  --surface: #1e293b;         /* Card backgrounds */
  /* ... other colors */
}
```

### Changing GitHub Username

Edit `backend/services/githubService.js`:
```javascript
const USERNAME = 'YourGitHubUsername';
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token

### Cards
- `GET /api/cards` - Get all cards (with optional search)
- `POST /api/cards` - Add new card (protected)
- `PATCH /api/cards/:id` - Update card quantity (protected)
- `POST /api/cards/:id/increment` - Increment quantity (protected)
- `POST /api/cards/:id/decrement` - Decrement quantity (protected)
- `DELETE /api/cards/:id` - Delete card (protected)
- `GET /api/cards/search/ygopro` - Search YGOProDeck cache

### GitHub
- `GET /api/github/profile` - Get cached GitHub profile

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string is correct
- Ensure all environment variables are set
- Check port 5000 is not in use

### Frontend can't connect to backend
- Verify `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend
- Ensure backend is running

### Login not working
- Check JWT_SECRET is set in backend
- Verify user exists in MongoDB `login` collection
- Check password is properly hashed

### Cards not loading
- Verify MongoDB connection
- Check YGOProDeck cache has initialized
- Look at backend console for errors

### GitHub profile not showing
- Check GitHub username in `githubService.js`
- Optionally add GITHUB_TOKEN for higher rate limits
- Check network connectivity

## 📄 License

ISC

## 👤 Author

**KatsuneNiko**
- GitHub: [@KatsuneNiko](https://github.com/KatsuneNiko)
- Email: crystallizedlumina@gmail.com

## 🙏 Acknowledgments

- [YGOProDeck API](https://ygoprodeck.com/api-guide/) for Yu-Gi-Oh card data
- [GitHub API](https://docs.github.com/en/rest) for profile information
- MongoDB Atlas for database hosting
- Render.com for backend hosting
- GitHub Pages for frontend hosting
