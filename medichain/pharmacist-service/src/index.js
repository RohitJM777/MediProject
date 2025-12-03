const express = require("express");
require("dotenv").config();
const connectDB = require("./utils/db");
const { connectRabbitMQ } = require("./rabbit/rabbit");
const orderConsumer = require("./consumers/order.consumer");

const app = express();
app.use(express.json());

app.use("/api/pharmacist", require("./routes/pharmacist.routes"));

app.get("/", (req, res) => res.send("Pharmacist Service running"));

const start = async () => {
  await connectDB();
  await connectRabbitMQ();
  await orderConsumer();

  app.listen(process.env.PORT, () =>
    console.log("Pharmacist Service running on", process.env.PORT)
  );
};

start();
