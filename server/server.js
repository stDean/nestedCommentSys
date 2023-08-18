import fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config();

let app = fastify();
app.register(sensible);

app.register(cors, {
  origin: process.env.CLIENT_URL,
  credentials: true,
});

const prisma = new PrismaClient();

app.get("/posts", async (req, res) => {
  return await commitToDb(
    prisma.posts.findMany({
      select: {
        id: true,
        title: true,
      },
    })
  );
});

// For error handling
// app.to gotten from sensible for better error formatting
async function commitToDb(promise) {
  const [error, data] = await app.to(promise);
  if (error) return app.httpErrors.internalServerError(error.message);
  return data;
}

const start = async () => {
  try {
    await app.listen({ port: process.env.PORT });
    console.log(`App listening on port: ${process.env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
