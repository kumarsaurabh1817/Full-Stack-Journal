import express from "express";
import dotenv from "dotenv";
import ConnectToMongoDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import cors from "cors";

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

try {
  console.log("Before DB Connection");

  await ConnectToMongoDB();

  console.log("After DB Connection");
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
} catch (error) {
  console.log(`Error in connecting to MongoDB: ${error.message}`);
}
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  }),
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/journals", journalRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});
