import { Queue, Worker } from "bullmq";
import dotenv from "dotenv";

dotenv.config();
const { REDIS_HOST, REDIS_PORT } = process.env;
const connection = { host: REDIS_HOST, port: REDIS_PORT };

// DEFINE QUEUE
const burgerQueue = new Queue("burger", { connection });

// REGISTER WORKER (Processor)
const burgerWorker = new Worker(
  "burger",
  async (job) => {
    console.log("Preparing the burger!");
    await new Promise((resolve) => setTimeout(resolve, 4000)); // Simulating delay
    console.log("Burger ready!");
  },
  { connection }
);

// ADD JOB TO THE QUEUE
burgerQueue.add("prepare-burger", {
  bun: "🍔",
  cheese: "🧀",
  toppings: ["🍅", "🫒", "🥒", "🌶️"],
});
