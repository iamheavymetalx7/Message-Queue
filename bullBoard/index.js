import express from "express";
import dotenv from "dotenv";
import { Queue } from "bullmq";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter.js";
import { ExpressAdapter } from "@bull-board/express";

(async () => {
  dotenv.config();

  // Define the Redis connection options
  const connection = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  };

  // Create a new queue with the Redis connection options
  const queuesList = ["burger"];

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/admin/queues");

  const queues = queuesList.map((qs) => new Queue(qs, { connection }));
  const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: queues.map((q) => new BullAdapter(q)),
    serverAdapter: serverAdapter,
  });

  const app = express();

  app.use("/admin/queues", serverAdapter.getRouter());

  // other configurations of your server

  const { PORT } = process.env;
  app.listen(PORT, () => {
    console.info(`Running on ${PORT}...`);
    console.info(`For the UI, open http://localhost:${PORT}/admin/queues`);
    console.info("Make sure Redis is running on port 6379 by default");
  });
})();
