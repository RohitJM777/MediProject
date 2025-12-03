const express = require("express");
require("dotenv").config();
const connectDB = require("./utils/db");
const { connectRabbitMQ } = require("./rabbit/rabbit");

const app = express();
app.use(express.json());

app.use("/api/ai", require("./routes/ai.routes"));

app.get("/", (req, res) => res.send("AI Service Running"));

const start = async () => {
  await connectDB();
  await connectRabbitMQ();

  app.listen(process.env.PORT, () =>
    console.log("🚀 AI Service running on port", process.env.PORT)
  );
};

start();
