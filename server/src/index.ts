import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import salesRoutes from "./routes/salesRoutes";

const corsOptions = {
  // 2. Substitua pela URL real do seu frontend na Vercel!
  origin:
    "https://inventory-management-104b906do-leandro-mirantes-projects.vercel.app",
  optionsSuccessStatus: 200,
};

/*Configuration*/
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors(corsOptions));

// /* routes */
app.use("/api/auth", authRoutes); // http://localhost:8000/api/auth
app.use("/api/dashboard", dashboardRoutes); // http://localhost:8000/dashboard
app.use("/api/products", productRoutes); // http://localhost:8000/products
app.use("/users", userRoutes); // http://localhost:8000/users
app.use("/expenses", expenseRoutes); // http://localhost:8000/expenses
app.use("/api/purchases", purchaseRoutes); // http://localhost:8000/purchases
app.use("/api/sales", salesRoutes); // http://localhost:8000/purchases

/* server */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
