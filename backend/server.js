import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // to get cookies from req object and set cookies in res object
import { v2 as cloudinary } from "cloudinary"; //for using cloudinary

import {
  authRoutes,
  userRoutes,
  postRoutes,
  notificationRoutes,
} from "./routes/index.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config({
  path: "././.env",
}); //dotevn file configed

//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//app created
const app = express();

// Middlewares
app.use(express.json({ limit: "5mb" })); // to parse req.body
app.use(urlencoded({ extended: true })); // to parse form data (urlencoded)
app.use(cookieParser()); // to get cookies from req object and set cookies in res object

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// connect the DataBase
connectMongoDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`app is not able to connect :: ${error}`);
      throw error;
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log(`app is listening on port :: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`index.js :: connectDB connection failed  :: ${error}`);
  });
