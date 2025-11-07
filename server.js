import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import router from "./Routes/AuthROutes.js";
import cookieParser from "cookie-parser";
import AdminRouter from "./Routes/AdminRoutes.js";
import UserRouter from "./Routes/UserRoutes.js";
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/auth", router);
app.use("/api/admin", AdminRouter);
app.use("/api/user", UserRouter);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
