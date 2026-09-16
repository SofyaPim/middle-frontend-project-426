import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/node';

const app = Fastify({ logger: true });
const prisma = new PrismaClient();
const bugsinkDsn = process.env.BUGSINK_DSN;
const port = Number(process.env.PORT ?? 3000);
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(currentDirectory, '../../frontend/dist');

if (bugsinkDsn) {
  Sentry.init({
    dsn: bugsinkDsn,
    sendDefaultPii: false,
  });
}
// app.get('/api/_monitoring-test-error', async () => {
//   throw new Error('Bugsink backend test');
// });
app.get('/health', async () => ({ status: 'ok' }));

app.get('/api/products', async () => {
  const products = await prisma.product.findMany({
    orderBy: { id: 'asc' },
  });

  return { products };
});

app.addHook('onError', async (_request, _reply, error) => {
  if (bugsinkDsn) {
    Sentry.captureException(error);
    await Sentry.flush(2000);
  }
});

await app.register(fastifyStatic, {
  root: frontendDirectory,
  prefix: '/',
  wildcard: false,
});

app.setNotFoundHandler(async (request, reply) => {
  const requestPath = new URL(request.url, 'http://localhost').pathname;

  if (requestPath === '/api' || requestPath.startsWith('/api/')) {
    return reply.code(404).send({ message: 'Route not found' });
  }

  return reply.sendFile('index.html');
});

await app.listen({ host: '0.0.0.0', port });
