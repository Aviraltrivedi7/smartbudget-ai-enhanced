import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log('📍 Connection URI:', process.env.MONGODB_URI.replace(/:([^:@]{8})[^:@]*@/, ':****@'));
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected successfully!');
    console.log(`🏢 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔄 Connection State: ${conn.connection.readyState}`);
    
    // Test creating a simple document
    const testCollection = conn.connection.db.collection('connection_test');
    const testDoc = await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful!'
    });
    
    console.log('📝 Test document created:', testDoc.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: testDoc.insertedId });
    console.log('🧹 Test document cleaned up');
    
    await mongoose.connection.close();
    console.log('👋 Connection closed gracefully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('🔐 Check your username and password in the connection string');
    } else if (error.message.includes('network')) {
      console.error('🌐 Check your network connection and MongoDB Atlas whitelist');
    }
    
    process.exit(1);
  }
};

testConnection();