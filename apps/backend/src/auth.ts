import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import { Value } from '@sinclair/typebox/value';
import { schema } from '../generated/openapi-schema.js';
import { FormatRegistry } from '@sinclair/typebox/type';

const scryptAsync = promisify(scrypt);

const SESSION_COOKIE = 'session_id';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const hash = (await scryptAsync(password, Buffer.from(saltHex, 'hex'), 64)) as Buffer;
  return timingSafeEqual(hash, Buffer.from(hashHex, 'hex'));
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const equalIndex = part.indexOf('=');
    if (equalIndex === -1) continue;
    result[part.slice(0, equalIndex).trim()] = part.slice(equalIndex + 1).trim();
  }
  return result;
}

function setSessionCookie(reply: any, token: string | null): void {
  const base = `${SESSION_COOKIE}=${token ?? ''}; Path=/; HttpOnly; SameSite=Strict`;
  const maxAge = token === null ? 'Max-Age=0' : `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
  reply.header('set-cookie', `${base}; ${maxAge}`);
}

function toUserDto(user: { id: number; email: string; createdAt: Date; updatedAt: Date }): {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function pickFirstError(errors: Iterable<{ path: string; message: string }>) {
  for (const error of errors) {
    return {
      field: error.path.replace(/^\//, '').split('/')[0],
      message: error.message,
    };
  }
  return undefined;
}

FormatRegistry.Set('email', (value: unknown) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
);

export async function registerAuthRoutes(
  app: FastifyInstance,
  prisma: PrismaClient,
): Promise<void> {
  const SignupBody = schema['/api/auth/signup'].POST.args.properties.body;
const SigninBody = schema['/api/auth/signin'].POST.args.properties.body;

  app.post('/api/auth/signup', async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, unknown>;

    if (!Value.Check(SignupBody, body)) {
      const detail = pickFirstError(Value.Errors(SignupBody, body));
      return reply.code(422).send({
        code: 'INVALID_REQUEST_BODY',
        message: 'Проверьте правильность заполнения полей',
        details: detail ? [detail] : [],
      });
    }

    const email = String(body.email).toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({
        code: 'EMAIL_TAKEN',
        message: 'Пользователь с таким email уже зарегистрирован',
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(String(body.password)),
      },
    });

    const token = randomBytes(32).toString('hex');
    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });

    setSessionCookie(reply, token);
    return reply.code(201).send(toUserDto(user));
  });

  app.post('/api/auth/signin', async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, unknown>;

    if (!Value.Check(SigninBody, body)) {
      const detail = pickFirstError(Value.Errors(SigninBody, body));
      return reply.code(422).send({
        code: 'INVALID_REQUEST_BODY',
        message: 'Проверьте правильность заполнения полей',
        details: detail ? [detail] : [],
      });
    }

    const email = String(body.email).toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(String(body.password), user.passwordHash))) {
      return reply.code(401).send({
        code: 'INVALID_CREDENTIALS',
        message: 'Неверный email или пароль',
      });
    }

    const token = randomBytes(32).toString('hex');
    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });

    setSessionCookie(reply, token);
    return reply.send(toUserDto(user));
  });

  app.post('/api/auth/logout', async (request, reply) => {
    const cookies = parseCookies(request.headers.cookie);
    const token = cookies[SESSION_COOKIE];

    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }

    setSessionCookie(reply, null);
    return reply.code(204).send();
  });

  app.get('/api/auth/me', async (request, reply) => {
    const cookies = parseCookies(request.headers.cookie);
    const token = cookies[SESSION_COOKIE];

    if (!token) {
      return reply.code(401).send({
        code: 'AUTH_REQUIRED',
        message: 'Необходима авторизация',
      });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      return reply.code(401).send({
        code: 'AUTH_REQUIRED',
        message: 'Сессия недействительна или истекла',
      });
    }

    return reply.send(toUserDto(session.user));
  });
}