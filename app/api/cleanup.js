/**
 * Database and File Cleanup Script
 * Removes all data from MongoDB and deletes uploaded audio files
 * 
 * Usage: node cleanup.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

async function cleanup() {
  try {
    console.log('🧹 Starting cleanup process...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get all collections
    const collections = await mongoose.connection.db.collections();
    
    if (collections.length === 0) {
      console.log('ℹ️  No collections found in database\n');
    } else {
      console.log(`📊 Found ${collections.length} collection(s):\n`);
      
      // Drop each collection
      for (const collection of collections) {
        const count = await collection.countDocuments();
        await collection.drop();
        console.log(`  ✓ Dropped "${collection.collectionName}" (${count} documents)`);
      }
      console.log('');
    }

    // Clean up uploaded files
    console.log('📁 Cleaning up uploaded files...');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('ℹ️  Uploads directory does not exist\n');
    } else {
      const files = fs.readdirSync(uploadsDir);
      const audioFiles = files.filter(f => f !== '.gitkeep');
      
      if (audioFiles.length === 0) {
        console.log('ℹ️  No files to delete\n');
      } else {
        let totalSize = 0;
        
        for (const file of audioFiles) {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          fs.unlinkSync(filePath);
        }
        
        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        console.log(`  ✓ Deleted ${audioFiles.length} file(s) (~${sizeMB} MB)\n`);
      }
    }

    console.log('✅ Cleanup complete!\n');
    console.log('Summary:');
    console.log('  • All MongoDB collections dropped');
    console.log('  • All uploaded audio files deleted');
    console.log('  • Database is now empty and ready for fresh data\n');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run cleanup
cleanup();

