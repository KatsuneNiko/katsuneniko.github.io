import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createUser = async () => {
  try {
    console.log('🔐 Admin User Creation Script\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'yugioh-binder' });
    console.log('✅ Connected to MongoDB\n');

    // Get username
    const username = await question('Enter username (default: admin): ');
    const finalUsername = username.trim() || 'admin';

    // Get password
    const password = await question('Enter password: ');
    
    if (!password || password.trim().length < 6) {
      console.error('\n❌ Password must be at least 6 characters long');
      process.exit(1);
    }

    // Hash password
    console.log('\n⏳ Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    // Check if user already exists
    const db = mongoose.connection.db;
    const existingUser = await db.collection('login').findOne({ username: finalUsername });

    if (existingUser) {
      const overwrite = await question(`\n⚠️  User "${finalUsername}" already exists. Overwrite? (y/n): `);
      if (overwrite.toLowerCase() !== 'y') {
        console.log('\n❌ Operation cancelled');
        process.exit(0);
      }
      await db.collection('login').deleteOne({ username: finalUsername });
    }

    // Insert user
    await db.collection('login').insertOne({
      username: finalUsername,
      password: hashedPassword,
      createdAt: new Date()
    });

    console.log('\n✅ User created successfully!');
    console.log(`   Username: ${finalUsername}`);
    console.log('   Password: [hidden]\n');

  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
  } finally {
    rl.close();
    mongoose.connection.close();
    process.exit(0);
  }
};

createUser();
