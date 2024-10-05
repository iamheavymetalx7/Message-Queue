import { Queue, Worker } from "bullmq";
import dotenv from "dotenv";
import { promisify } from "util";
const sleep = promisify(setTimeout);

dotenv.config();
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

// QUEUE OPTIONS
const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
};

// DEFINE QUEUE
const burgerQueue = new Queue("burger", { connection });

// REGISTER WORKER
const worker = new Worker(
  "burger",
  async (job) => {
    try {
      // STEP 1
      console.log("Grill the patty.");
      await job.updateProgress(20);
      await sleep(5000);
      // STEP 2
      if (Math.random() > 0.25) throw new Error("Toast burnt!");
      console.log("Toast the buns.");
      await job.updateProgress(40);
      await sleep(5000);
      // STEP 3
      console.log("Add toppings.");
      await job.updateProgress(60);
      await sleep(5000);
      // STEP 4
      console.log("Assemble layers.");
      await job.updateProgress(80);
      await sleep(5000);
      // STEP 5
      console.log("Burger ready.");
      await job.updateProgress(100);
    } catch (err) {
      throw err; // Rethrow the error to mark the job as failed
    }
  },
  {
    connection,
    attempts: 3, // Number of attempts to retry on failure
  }
);

// ADD JOB TO THE QUEUE
const jobs = [...new Array(1)].map((_) => ({
  bun: "🍔",
  cheese: "🧀",
  toppings: ["🍅", "🫒", "🥒", "🌶️"],
}));

jobs.forEach((job, i) =>
  burgerQueue.add(`Burger#${i + 1}`, job, {
    attempts: 3,
    repeat: { cron: "10 * * * * *" }, // Runs every minute on the 10th second
    removeOnComplete: true,
  })
);
