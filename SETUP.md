# 🚀 Quick Setup Guide

## Step-by-Step Setup Instructions

### 1️⃣ Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 2️⃣ Configure Backend Environment

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `backend/.env` with your actual values:
   ```env
   MONGODB_URI=mongodb+srv://Katsune:REMOVED@mongofree.lr76rax.mongodb.net/
   JWT_SECRET=generate-a-random-secret-here-use-a-password-generator
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   GITHUB_TOKEN=
   ```

   **To generate a secure JWT_SECRET:**
   ```bash
   # In PowerShell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

### 3️⃣ Configure Frontend Environment

1. Copy the example environment file:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### 4️⃣ Set Up MongoDB Database

1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Navigate to your cluster
3. Click "Browse Collections"
4. Create database: `yugioh-binder`
5. Create collections:
   - `cards`
   - `login`
   - `yugioh-cardinfo`

### 5️⃣ Create Admin User

You need to create an admin user in the `login` collection:

**Option A: Using MongoDB Compass or Atlas UI**
1. Open the `login` collection
2. Insert document:
   ```json
   {
     "username": "admin",
     "password": "your-password-here"
   }
   ```
3. The password will be automatically hashed when you first login via the API

**Option B: Using Node.js script**
Create `backend/scripts/createUser.js`:
```javascript
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const createUser = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'yugioh-binder' });
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('your-password', salt);
  
  const db = mongoose.connection.db;
  await db.collection('login').insertOne({
    username: 'admin',
    password: hashedPassword
  });
  
  console.log('User created successfully!');
  process.exit(0);
};

createUser();
```

Then run:
```bash
cd backend
node scripts/createUser.js
```

### 6️⃣ Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The app should now be running at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 7️⃣ Test the Application

1. Open http://localhost:3000
2. Navigate through the burger menu
3. Go to Login page
4. Enter your admin credentials
5. Try adding cards to your binder!

---

## 🐛 Common Issues

### "Cannot connect to MongoDB"
- Check your MongoDB connection string in `backend/.env`
- Ensure your IP is whitelisted in MongoDB Atlas
- Check if MongoDB cluster is running

### "Backend connection refused"
- Make sure backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env`
- Verify no firewall blocking the connection

### "Login not working"
- Verify admin user exists in `login` collection
- Check JWT_SECRET is set in `backend/.env`
- Look at browser console for error messages

### "Cards not loading"
- The first load takes time (downloading YGOProDeck database)
- Check backend console logs
- Verify MongoDB collections exist

---

## 📋 Next Steps

### Local Development
- ✅ Application is now running locally
- Add some cards to test the functionality
- Customize colors in `frontend/src/styles/global.css`

### Deployment
1. **Deploy Backend to Render** (see main README)
2. **Deploy Frontend to GitHub Pages** (see main README)
3. Update environment variables with production URLs

### Optional Enhancements
- Add more authentication features (password reset, registration)
- Implement card statistics and analytics
- Add export functionality (CSV, PDF)
- Create additional pages (About, Contact)
- Add card images to the binder view

---

## 📞 Need Help?

Check the main README.md for detailed documentation, or review the troubleshooting section.

**Your application is ready! Happy coding! 🎉**
