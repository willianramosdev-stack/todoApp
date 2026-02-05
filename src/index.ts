import Fastify from 'fastify'
import cookie from "@fastify/cookie";
import { authController } from './controller/auth.controller.js'
import { userController } from './controller/user.controller.js';

const fastify = Fastify({ logger: false })

await fastify.register(userController, { prefix: '/api/users' })
await fastify.register(authController, { prefix: '/api/auth' })
await fastify.register(cookie, {
  secret: "peixefritocomarroz", 
});
await fastify.listen({ port: 3000, host: '0.0.0.0' })

