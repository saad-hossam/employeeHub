
import dns from 'node:dns';
import mongoose from 'mongoose';

// Optional: custom DNS servers to troubleshoot SRV lookup failures
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(
            `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`
        );
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
}

export default connectDB;
