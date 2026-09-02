import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {

    if(connection.isConnected) {
        console.log("Already Connected to database");
        return;
    }
    
    const Mongo_URI= process.env.Mongo_URI;

    if(!Mongo_URI){
        throw new Error("Mongo_URI is not configured");
    }

    try{
        const db = await mongoose.connect(Mongo_URI);
        
        connection.isConnected = db.connections[0].readyState;

        console.log("DB Connected Successfully");
    } catch(error) {
        console.error("Database connection failed",error);
        throw error;
    }
}

export default dbConnect;