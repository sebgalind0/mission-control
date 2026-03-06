import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getPrisma() {
  // Use a dummy URL during build phase (Next.js static analysis)
  // Real DATABASE_URL will be used at runtime
  const connectionString = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

  if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    console.warn('DATABASE_URL not set - using dummy for build phase');
  }

  if (!globalForPrisma.prisma) {
    // Create connection pool
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.pool = pool;
    }
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get: (_target, prop) => {
    return getPrisma()[prop as keyof PrismaClient];
  },
});
