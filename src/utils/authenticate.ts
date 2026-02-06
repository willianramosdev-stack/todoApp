import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";


declare module "fastify" {
    interface FastifyRequest {
        user: { userId: string };
    }
}

type TokenPayload = { user_id: string };

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies?.accessToken;
    if (!token) return reply.code(401).send({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
        request.user = { userId: decoded.user_id };
    } catch {
        return reply.code(401).send({ error: "Unauthorized" });
    }
}


