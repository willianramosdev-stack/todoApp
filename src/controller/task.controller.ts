import type { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../client.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticate } from "../utils/authenticate.js";

export const taskController = async (fastify: FastifyInstance) => {
    
    
}