# Backend README

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your MongoDB URI
   - Generate a secure JWT secret (use a password generator)

3. **Start the server:**
   ```bash
   # Production
   npm start

   # Development (with auto-reload)
   npm run dev
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `GITHUB_TOKEN` | GitHub API token (optional) | No |

## API Routes

### Public Routes
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `GET /api/cards?search=` - Get cards (public view)
- `GET /api/github/profile` - Get GitHub profile

### Protected Routes (Require JWT)
- `POST /api/cards` - Add card
- `PATCH /api/cards/:id` - Update card
- `POST /api/cards/:id/increment` - Increment quantity
- `POST /api/cards/:id/decrement` - Decrement quantity
- `DELETE /api/cards/:id` - Delete card
- `POST /api/github/refresh` - Refresh GitHub cache

## Scheduled Jobs

- **Weekly YGOProDeck cache update** - Sunday 2 AM
- **Daily price updates** - Every day 3 AM

## MongoDB Collections

### cards
```javascript
{
  id: Number,           // YGOProDeck card ID
  name: String,         // Card name
  set_code: String,     // Set code (e.g., "LOB-EN001")
  set_rarity: String,   // Rarity (e.g., "Ultra Rare")
  quantity: Number,     // Quantity owned
  set_price: Number,    // TCGPlayer price
  last_updated: Date    // Last price update
}
```

### login
```javascript
{
  username: String,     // Username
  password: String      // Hashed password (bcrypt)
}
```

### yugioh-cardinfo
```javascript
{
  id: Number,           // Card ID
  name: String,         // Card name
  type: String,         // Card type
  desc: String,         // Description
  card_sets: Array,     // Available sets
  card_images: Array,   // Card images
  card_prices: Array,   // Price data
  last_cached: Date     // Cache timestamp
}
```

## Deployment to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy!

Render will automatically:
- Install dependencies (`npm install`)
- Start server (`node server.js`)
- Assign a PORT
- Provide HTTPS URL
