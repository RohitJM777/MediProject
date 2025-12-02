const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
// const { limiter, helmet } = require('./middleware/security');


dotenv.config();

const authRoutes = require("./src/routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());
// app.use(helmet);
// app.use(limiter);


app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.json({ status: "ok", service: "auth-service" }));

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
  });
