import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myapp";

const ConnectToMongoDB = async () => {
    try{
        await mongoose.connect(MONGO_URI)
        console.log("Connected to MongoDB successfully");
    }
    catch (error){
        console.log(`Error in (config) connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
}

export default ConnectToMongoDB;