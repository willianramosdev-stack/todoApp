import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";


declare module "fastify" {
    interface FastifyRequest {
        user: { userId: string };
    }
}

function isJwtPayload(value: unknown): value is JwtPayload {
    return typeof value === "object" && value !== null;
}

export async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return reply.code(401).send({ error: "Unauthorized" });
    }

    const token = authHeader.slice("Bearer ".length).trim();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        if (!isJwtPayload(decoded) || typeof decoded.sub !== "string") {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        request.user = { userId: decoded.sub };
    } catch {
        return reply.code(401).send({ error: "Unauthorized" });
    }
}
