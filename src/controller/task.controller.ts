import type { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../client.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticate } from "../utils/authenticate.js";
import type { Prisma } from "../generated/prisma/client.js";

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

const QuerySchema = z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    due_date: z.coerce.date().optional(),
    sort: z.enum(["dueDate", "createdAt"]).optional().default("createdAt"),
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

    fastify.get<{ Querystring: z.infer<typeof QuerySchema>; }>('/api/tasks', { preHandler: authenticate }, async (request, reply) => {
        try {
            const query = QuerySchema.parse(request.query);

            const filters: Prisma.TaskWhereInput = {
                userId: request.user.userId,
            }
            if (query.status) {
                filters.status = query.status;
            }
            if (query.priority) {
                filters.priority = query.priority;
            }
            if (query.due_date) {
                filters.dueDate = query.due_date;
            }
            const getAllTask = await prisma.task.findMany({
                where: filters,
                orderBy: {
                    [query.sort]: 'desc'
                }
            });
            reply.status(200).send(getAllTask);
        } catch (error) {
            reply.status(500).send({ error: "Tasks not found!" });
        }
    });


}