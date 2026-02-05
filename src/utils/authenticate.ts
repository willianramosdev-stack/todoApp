import type { FastifyReply, FastifyRequest } from "fastify"
import jwt from "jsonwebtoken";

declare module 'fastify' {
    interface FastifyRequest {
        user: { userId: string }
    }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token!, process.env.JWT_SECRET!);

    if (typeof decoded !== "object" || decoded === null || typeof (decoded as any).user_id !== "string") {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    request.user = { userId: (decoded as any).user_id };
  } catch {
    return reply.code(401).send({ error: "Unauthorized" });
  }
};
