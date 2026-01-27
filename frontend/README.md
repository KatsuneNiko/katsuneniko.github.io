# Frontend README

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Set `VITE_API_URL` to your backend URL

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

## Project Structure

```
src/
├── components/
│   ├── Layout/         # Header, Footer, BurgerMenu
│   ├── AddCardModal.jsx
│   └── ProtectedRoute.jsx
├── pages/              # Home, Binder, BinderEdit, Login
├── services/
│   └── api.js          # API client & services
└── styles/             # CSS files
```

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Routing

| Route | Component | Protected |
|-------|-----------|-----------|
| `/` | Home | No |
| `/binder` | Binder | No |
| `/login` | Login | No |
| `/binder/edit` | BinderEdit | Yes |

## Features

### Home Page
- GitHub profile display
- Recent repositories
- Activity feed

### Binder Page
- View card collection
- Search by name
- Price information

### Binder Edit Page (Protected)
- Add new cards
- Increment/decrement quantities
- Delete cards
- Search YGOProDeck database

### Login Page
- JWT authentication
- Redirects to editor on success

## Styling

- Dark theme
- Responsive design
- CSS variables for easy customization
- Mobile-friendly burger menu

## Deployment to GitHub Pages

### Option 1: Manual

```bash
npm run build
gh-pages -d dist
```

### Option 2: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml` - see main README for full config.

Push to main branch → Automatic deployment!

## Customization

Edit `src/styles/global.css` to change:
- Colors (--primary-color, --background, etc.)
- Fonts
- Spacing
- Shadows

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
