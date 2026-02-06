import "dotenv/config";
import Fastify from 'fastify'
import cookie from "@fastify/cookie";
import { authController } from './controller/auth.controller.js'
import { userController } from './controller/user.controller.js';


const fastify = Fastify({ logger: false })

await fastify.register(userController)
await fastify.register(authController)
await fastify.register(cookie, { secret: process.env.COOKIE_SECRET! });
await fastify.listen({ port: 3000, host: '0.0.0.0' })

