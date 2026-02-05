import type { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../client.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticate } from "../utils/authenticate.js";

const Registerschema = z.object({
    fullName: z.string().min(3),
    age: z.number().int().min(0),
    email: z.string().email(),
    password: z.string().min(6)
})

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export const authController = async (fastify: FastifyInstance) => {

    fastify.post<{ Body: z.infer<typeof Registerschema> }>('/api/auth/register', async (request, reply) => {
        const payload = Registerschema.parse(request.body);
        const hashedPassword = await bcrypt.hash(payload.password, 10)
        const user = await prisma.user.create({
            data: {
                ...payload,
                password: hashedPassword
            }
        });
        const accessToken = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET!, { expiresIn: '8h' });
        const refreshToken = jwt.sign({ user_id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
        reply
            .setCookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/api/auth/refresh",
                maxAge: 60 * 60 * 24 * 7 // 7 dias
            })
            .status(201)
            .send({
                user: {
                    ...user,
                    password: undefined
                },
                accessToken
            });

    }
    );

    fastify.post<{ Body: z.infer<typeof LoginSchema> }>('/api/auth/login', async (request, reply) => {
        const payload = LoginSchema.parse(request.body);
        const user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (!user) {
            return reply.status(401).send({ error: "Invalid email or password" });
        }
        const passValidate = await bcrypt.compare(payload.password, user.password);
        if (!passValidate) {
            return reply.status(401).send({ error: "Invalid email or password" });
        }
        const accessToken = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET!, { expiresIn: '8h' });
        const refreshToken = jwt.sign({ user_id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
        reply
            .setCookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/api/auth/refresh",
                maxAge: 60 * 60 * 24 * 7
            })
            .send({ accessToken });
    });


    fastify.post("/api/auth/refresh", async (request, reply) => {
        const refreshToken = request.cookies.refreshToken;

        if (!refreshToken) {
            return reply.status(401).send({ error: "Refresh token required" });
        }

        try {
            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET!
            ) as jwt.JwtPayload;

            const newAccessToken = jwt.sign(
                { user_id: decoded.sub ?? decoded.user_id },
                process.env.JWT_SECRET!,
                { expiresIn: "8h" }
            );

            return reply.send({ accessToken: newAccessToken });
        } catch {
            return reply.status(401).send({ error: "Invalid refresh token" });
        }
    });



    


};
