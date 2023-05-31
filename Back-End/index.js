import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/Database.js";
import router from "./routes/index.js";
import addSwagger from "./swagger.js";

dotenv.config();
const app = express();

try {
  await db.authenticate();
  console.log('Database Connected');
} catch (error) {
  console.error(error);
}

app.use(cors({ credentials: true, origin: 'http://localhost:5000' }));
app.use(cookieParser());
app.use(express.json());

addSwagger(app);

app.use(router);

app.listen(5000, () => console.log('Server running at port 5000'));
