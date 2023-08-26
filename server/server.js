import fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config();

let app = fastify();
app.register(sensible);
app.register(cookie, { secret: process.env.COOKIE_SECRET });

app.register(cors, {
  origin: process.env.CLIENT_URL,
  credentials: true,
});

// middleware in fastify
app.addHook("onRequest", (req, res, done) => {
  if (req.cookies.userId !== CURRENT_USER_ID) {
    req.cookies.userId = CURRENT_USER_ID;
    res.clearCookie("userId");
    res.setCookie("userId", CURRENT_USER_ID);
  }
  done();
});

const prisma = new PrismaClient();

const CURRENT_USER_ID = (
  await prisma.users.findFirst({ where: { name: "Kyle" } })
).id;

const COMMENT_SELECT_FIELDS = {
  id: true,
  message: true,
  parentId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};

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

app.get("/post/:id", async (req, res) => {
  return await commitToDb(
    prisma.posts
      .findUnique({
        where: { id: req.params.id },
        select: {
          body: true,
          title: true,
          comments: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              ...COMMENT_SELECT_FIELDS,
              // get how many likes the comment has
              _count: { select: { likes: true } },
            },
          },
        },
      })
      // get all the likes
      // and if signed in user currently like the comment
      .then(async (post) => {
        // get all my(current logged in user) likes
        const likes = await prisma.likes.findMany({
          where: {
            userId: req.cookies.userId,
            commentId: { in: post.comments.map((comment) => comment.id) },
          },
        });

        return {
          ...post,
          comments: post.comments.map((comment) => {
            const { _count, ...commentFields } = comment;

            return {
              ...commentFields,
              likedByMe: likes.find((like) => like.commentId === comment.id),
              likeCount: _count.likes,
            };
          }),
        };
      })
  );
});

app.post("/post/:id/comment", async (req, res) => {
  if (req.body.message === "" || req.body.message === null) {
    return res.send(app.httpErrors.badRequest("message field cannot be empty"));
  }
  return await commitToDb(
    prisma.comments
      .create({
        data: {
          message: req.body.message,
          userId: req.cookies.userId,
          parentId: req.body.parentId,
          postId: req.params.id,
        },
        select: {
          ...COMMENT_SELECT_FIELDS,
        },
      })
      .then((comment) => {
        return {
          ...comment,
          likeCount: 0,
          likedByMe: false,
        };
      })
  );
});

app.put("/post/:postId/comment/:commentId", async (req, res) => {
  if (req.body.message === "" || req.body.message === null) {
    return res.send(app.httpErrors.badRequest("message field cannot be empty"));
  }

  // get the userId from the comment
  const { userId } = await prisma.comments.findFirst({
    where: { id: req.params.commentId },
    select: { userId: true },
  });

  // if userId from comment not equal to the logged in user< throw an error
  if (userId !== req.cookies.userId) {
    return res.send(app.httpErrors.unauthorized("Cannot edit this post"));
  }

  return await commitToDb(
    prisma.comments.update({
      where: { id: req.params.commentId },
      data: { message: req.body.message },
      select: { message: true },
    })
  );
});

app.delete("/post/:postId/comment/:commentId", async (req, res) => {
  const { userId } = await prisma.comments.findFirst({
    where: { id: req.params.commentId },
    select: { userId: true },
  });

  if (userId !== req.cookies.userId) {
    return res.send(
      app.httpErrors.unauthorized(
        "you do not have the permission to delete this comment"
      )
    );
  }

  return await commitToDb(
    prisma.comments.delete({
      where: { id: req.params.commentId },
      select: { id: true },
    })
  );
});

app.post("/post/:postId/comment/:commentId/toggleLike", async (req, res) => {
  const data = {
    commentId: req.params.commentId,
    userId: req.cookies.userId,
  };

  // using userId_commentId cos the userId and commentId acts as the id of the likestable
  const like = await prisma.likes.findUnique({
    where: { userId_commentId: data },
  });

  if (like == null) {
    return await commitToDb(prisma.likes.create({ data })).then(() => {
      return { addLike: true };
    });
  } else {
    return await commitToDb(
      prisma.likes.delete({ where: { userId_commentId: data } })
    ).then(() => {
      return { addLike: false };
    });
  }
});

// For error handling
// app.to gotten from sensible for better error formatting
async function commitToDb(promise) {
  const [error, data] = await app.to(promise);
  if (error) return app.httpErrors.internalServerError(error.message);
  return data;
}

const start = () => {
  try {
    app.listen({ port: process.env.PORT });
    console.log(`App listening on port: ${process.env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
