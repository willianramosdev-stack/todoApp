import type { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../client.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticate } from "../utils/authenticate.js";

export const TaskStatusSchema = z.enum([
    "PENDING",
    "IN_PROGRESS",
    "DONE",
    "CANCELED"
]);

export const TaskPrioritySchema = z.enum([
    "LOW",
    "MEDIUM",
    "HIGH"
]);

export const CreateTaskSchema = z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(2000),
    priority: TaskPrioritySchema,
    dueDate: z.coerce.date().nullable() // usar coerce para converter string para data
});

export const taskController = async (fastify: FastifyInstance) => {

    fastify.post<{ Body: z.infer<typeof CreateTaskSchema> }>('/api/tasks', { preHandler: authenticate }, async (request, reply) => {
        const payload = CreateTaskSchema.parse(request.body);
        try {
            const task = await prisma.task.create({
                data: {
                    ...payload,
                    userId: request.user.userId,
                }
            });
            reply.status(201).send(task);
        } catch (error) {
            reply.status(500).send({ error: "Failed to create task" });
        }
    });

}