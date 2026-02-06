import type { FastifyInstance } from "fastify";
import z, { number } from "zod";
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

const UpdateTaskStatusSchema = z.object({
  status: TaskStatusSchema
});

export const CreateTaskSchema = z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(2000),
    priority: TaskPrioritySchema,
    dueDate: z.coerce.date().nullable() // usar coerce para converter string para data
});
export const UpdateTaskSchema = z.object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(2000).optional(),
    priority: TaskPrioritySchema.optional(),
    dueDate: z.coerce.date().nullable().optional() // usar coerce para converter string para data
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

    fastify.get<{ Params: { id: string } }>('/api/tasks/:id', { preHandler: authenticate }, async (request, reply) => {
        const { id } = request.params;
        try {
            const task = await prisma.task.findUnique({
                where: {
                    id: Number(id)
                }
            });
            if (!task) {
                return reply.status(404).send({ error: "Task not found" });
            }
            reply.status(200).send(task);
        } catch (error) {
            return reply.status(500).send({ error: "Failed to retrieve task" });
        }

    });

    fastify.put<{ Params: { id: string }, Body: z.infer<typeof CreateTaskSchema> }>('/api/tasks/:id', { preHandler: authenticate }, async (request, reply) => {
        const { id } = request.params;
        if (!request.body.title || !request.body.description || !request.body.priority || !request.body.dueDate) {
            return reply.status(400).send({ error: "Title, description, priority and dueDate are required" });
        }
        const payload = CreateTaskSchema.parse(request.body);

        try {
            const task = await prisma.task.findUnique({
                where: { id: Number(id) }
            });
            if (!task) {
                return reply.status(404).send({ error: "Task not found" });
            }
            const updatedTask = await prisma.task.update({
                where: { id: Number(id) },
                data: payload
            });
            reply.status(200).send(updatedTask);
        } catch (error) {
            reply.status(500).send({ error: "Failed to update task" });
        }
    });

    fastify.patch<{ Params: { id: string }, Body: z.infer<typeof UpdateTaskSchema> }>('/api/tasks/:id', { preHandler: authenticate }, async (request, reply) => {
        const { id } = request.params;
        const payload = UpdateTaskSchema.parse(request.body);

        try {
            const task = await prisma.task.findUnique({
                where: { id: Number(id) }
            });
            if (!task) {
                return reply.status(404).send({ error: "Task not found" });
            }

            const data: Prisma.TaskUpdateInput = {};
            if (payload.title !== undefined) data.title = payload.title;
            if (payload.description !== undefined) data.description = payload.description;
            if (payload.priority !== undefined) data.priority = payload.priority;
            if (payload.dueDate !== undefined) data.dueDate = payload.dueDate;

            const updatedTask = await prisma.task.update({
                where: { id: Number(id) },
                data: data
            });
            reply.status(200).send(updatedTask);
        } catch (error) {
            reply.status(500).send({ error: "Failed to update task" });
        }
    });

    fastify.patch<{ Params: { id: string }, Body: { status: z.infer<typeof UpdateTaskStatusSchema> } }>('/api/tasks/:id/status', { preHandler: authenticate }, async (request, reply) => {
        const { id } = request.params
        const payload = UpdateTaskStatusSchema.parse(request.body)
        try {
            const task = await prisma.task.findUnique({
                where: { id: Number(id) }
            })
            if (!task) {
                return reply.status(404).send({ error: "Task not found" });
            }
            const updatedTask = await prisma.task.update({
                where: { id: Number(id) },
                data: {
                    status: payload.status,
                    completedAt: payload.status == "DONE" ? new Date() : null
                }
            })
            reply.status(200).send(updatedTask);
        } catch (error) {
            return reply.status(500).send({ error: "Failed to update task status" });
        }
    });

    fastify.patch<{ Params: { id: string } }>('/api/tasks/:id/complete', { preHandler: authenticate }, async (request, reply) => {
        const { id } = request.params
        try {
            const task = await prisma.task.findUnique({
                where: { id: Number(id) }
            })
            if (!task) {
                return reply.status(404).send({ error: "Task not found" });
            }
            const updatedTask = await prisma.task.update({
                where: { id: Number(id) },
                data: {
                    status: "DONE",
                    completedAt: new Date()
                }
            })
            reply.status(200).send(updatedTask);
        } catch (error) {
            return reply.status(500).send({ error: "Failed to mark task as completed" });
        }
    });





}