import BullMQ from "bullmq";
import dotenv from "dotenv";
import { promisify } from "util";

const sleep = promisify(setTimeout);

dotenv.config();
const { REDIS_HOST, REDIS_PORT } = process.env;

// QUEUE OPTIONS
const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

const { Queue, Worker, QueueScheduler } = BullMQ;
const queueOptions = {
  limiter: {
    max: 1,
    duration: 1000,
  },
};

// DEFINE QUEUE
const burgerQueue = new Queue("burger", {
  connection,
  ...queueOptions,
});

// REGISTER WORKER (Processor)
const burgerWorker = new Worker(
  "burger",
  async (job) => {
    try {
      // STEP 1
      console.log("Grill the patty.");
      job.updateProgress(20);
      await sleep(5000);

      // STEP 2: 25% chance that it will pass, else fail
      if (Math.random() > 0.25) throw new Error("Toast burnt!");
      console.log("Toast the buns.");
      job.updateProgress(40);
      await sleep(5000);

      // STEP 3
      console.log("Add toppings.");
      job.updateProgress(60);
      await sleep(5000);

      // STEP 4
      console.log("Assemble layers.");
      job.updateProgress(80);
      await sleep(5000);

      // STEP 5
      console.log("Burger ready.");
      await job.updateProgress(100);
    } catch (err) {
      throw err; // Throw the error for retrying
    }
  },
  {
    connection,
    attempts: 3, // Number of attempts to retry on failure
  }
);

// ADD JOBS TO THE QUEUE
const jobs = [...new Array(10)].map((_) => ({
  bun: "🍔",
  cheese: "🧀",
  toppings: ["🍅", "🫒", "🥒", "🌶️"],
}));

jobs.forEach((job) => burgerQueue.add("prepare-burger", job));
