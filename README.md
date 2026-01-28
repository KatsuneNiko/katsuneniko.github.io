# Yu-Gi-Oh Binder & Portfolio

A full-stack web application for managing a Yu-Gi-Oh card collection with real-time pricing. Built with React, Node.js, and MongoDB.

## ✨ Features

- **View & Search**: Browse your card collection with search functionality
- **Manage Cards**: Add cards from the YGOProDeck database (10,000+ cards)
- **Track Pricing**: Real-time TCGPlayer pricing for all cards
- **Create Lists**: Build custom lists and export/import as CSV
- **Secure Access**: JWT-authenticated card editor for authorized users
- **Portfolio**: Display GitHub profile and recent activity

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### Setup Instructions

**1. Clone and install dependencies:**
```bash
git clone https://github.com/KatsuneNiko/katsuneniko.github.io.git
cd katsuneniko.github.io

# Backend
cd backend && npm install
cd ../frontend && npm install
```

**2. Configure environment variables:**

Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/yugioh-binder
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:3000
FIXER_API_KEY=your-fixer-api-key
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

**3. Start the application:**

Terminal 1 (Backend):
```bash
cd backend && npm start
```

Terminal 2 (Frontend):
```bash
cd frontend && npm run dev
```

The app opens at `http://localhost:3000`

### Database Setup

Create a MongoDB database named `yugioh-binder` with a `login` collection. Add an admin user:

```javascript
{
  "username": "admin",
  "password": "$2a$10$..." // Use bcrypt to hash your password
}
```

**Fixer.io API key setup:**
- Create a free account at https://fixer.io and generate an API key.
- Add the key to `backend/.env` as `FIXER_API_KEY`.
- Restart the backend after updating `.env`.

## 📦 Project Structure

```
├── backend/          # Express API server
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   └── server.js     # Server entry point
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── vite.config.js
```

## 🔐 Security

- JWT authentication with 24-hour expiry
- bcrypt password hashing
- Rate limiting on login attempts
- Protected routes for card editor

## 🌐 Deployment

**Backend** (Render.com):
- Create a Web Service on Render
- Connect your GitHub repository
- Set environment variables
- Deploy from the `main` branch

**Frontend** (GitHub Pages):
- Build: `cd frontend && npm run build`
- Push the `frontend/dist` folder to GitHub Pages
- Update `VITE_API_URL` in `.env` to your backend URL

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/cards` | Get all cards (optional `search` query) |
| POST | `/api/cards` | Add new card (protected) |
| PATCH | `/api/cards/:id` | Update card quantity (protected) |
| POST | `/api/cards/:id/increment` | Increment card quantity (protected) |
| POST | `/api/cards/:id/decrement` | Decrement card quantity (protected) |
| DELETE | `/api/cards/:id` | Delete card (protected) |
| GET | `/api/cards/search/ygopro` | Search cached YGOProDeck data (requires `name` query) |
| GET | `/api/cards/exchange-rate/usd-aud` | Get USD→AUD exchange rate |
| GET | `/api/github/profile` | Get cached GitHub profile |
| GET | `/api/github/changes` | Check if GitHub profile changed |
| POST | `/api/github/refresh` | Force refresh GitHub profile |

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcrypt
- **APIs**: YGOProDeck, GitHub API, TCGPlayer, Fixer.io

## 📝 License

ISC

## 👤 Author

**KatsuneNiko** - [GitHub](https://github.com/KatsuneNiko)

