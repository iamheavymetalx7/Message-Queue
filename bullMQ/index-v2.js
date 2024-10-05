import { Queue, Worker } from "bullmq";
import dotenv from "dotenv";
import { promisify } from "util";

const sleep = promisify(setTimeout);

dotenv.config();
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;
const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
};

// DEFINE QUEUE
const burgerQueue = new Queue("burger", { connection });

// REGISTER WORKER (Processor)
const burgerWorker = new Worker(
  "burger",
  async (job) => {
    try {
      // STEP 1
      console.log("Grill the patty.");
      job.updateProgress(20);
      await sleep(5000);
      // STEP 2
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
      job.updateProgress(100);
    } catch (err) {
      throw err;
    }
  },
  { connection }
);

// ADD JOB TO THE QUEUE
burgerQueue.add("prepare-burger", {
  bun: "🍔",
  cheese: "🧀",
  toppings: ["🍅", "🫒", "🥒", "🌶️"],
});
