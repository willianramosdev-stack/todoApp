import type { FastifyInstance } from "fastify";
import { authenticate } from "../utils/authenticate.js";
import { prisma } from "../client.js";
import z from "zod";
import bcrypt from 'bcrypt';
import type { Prisma } from "../generated/prisma/browser.js";

const UpdateUserSchema = z.object({
    fullName: z.string().min(3).optional(),
    age: z.number().int().min(0).optional(),
    email: z.string().email().optional()
})

export const UpdatePasswordSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6)
})

export const userController = async (fastify: FastifyInstance) => {

    fastify.get('/api/users/me', { preHandler: authenticate }, async (request, reply) => {
        try {
            const user = await prisma.user.findFirst({
                where: { id: request.user.userId },
            })

            if (!user) {
                return reply.code(404).send({ error: "User not found" });
            }

            return reply.status(200).send({
                ...user,
                password: undefined
            })
        } catch (error) {
            return reply.code(500).send({ error: "Internal server error" });
        }
    })

    fastify.put<{ Body: z.infer<typeof UpdateUserSchema> }>('/api/users/me', { preHandler: authenticate }, async (request, reply) => {
        try {
            const user = await prisma.user.findFirst({
                where: { id: request.user.userId },
            })

            if (!user) {
                return reply.code(404).send({ error: "User not found" });
            }
            const payload = UpdateUserSchema.parse(request.body);

            //Necessario porque o prisma nao quis aceitar o payload diretamente (possivel undefined em alguns campos)
            const data: Prisma.UserUpdateInput = {};
            if (payload.fullName !== undefined) data.fullName = payload.fullName;
            if (payload.email !== undefined) data.email = payload.email;
            if (payload.age !== undefined) data.age = payload.age;

            const updatedUser = await prisma.user.update({
                where: { id: request.user.userId },
                data
            })

            return reply.status(200).send({
                ...updatedUser,
                password: undefined
            })
        } catch (error) {
            return reply.code(500).send({ error: "Internal server error" });
        }
    })

    fastify.patch<{ Body: z.infer<typeof UpdatePasswordSchema> }>('/api/users/me/password', { preHandler: authenticate }, async (request, reply) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: request.user.userId },
            })
            if (!user) {
                return reply.code(404).send({ error: "User not found" });
            }

            const payload = UpdatePasswordSchema.parse(request.body);

            const isPasswordValid = await bcrypt.compare(payload.currentPassword, user.password);

            if (!isPasswordValid) {
                return reply.code(400).send({ error: "Current password is incorrect" });
            }

            const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

            const updatedUser = await prisma.user.update({
                where: { id: request.user.userId },
                data: { password: hashedPassword }
            })

            return reply.status(200).send({
                ...updatedUser,
                password: undefined
            })
        } catch (error) {
            return reply.code(500).send({ error: "Internal server error" });
        }
    })

};