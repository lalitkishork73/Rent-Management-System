// prisma/extensions.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { Prisma as PrismaExtension } from '@prisma/client/extension';

export const securityExtension = (/* you may inject dependencies here */) => {
  return Prisma.defineExtension({
    name: 'securityExtension',
    query: {
      $allOperations({ args, query, model, operation }) {
        // This hook runs for *all* operations on all models
        // Example: block deleteMany for production
        if (
          process.env.NODE_ENV === 'production' &&
          (operation === 'deleteMany' || operation === 'delete')
        ) {
          throw new Error(
            `Operation ${model}.${operation} blocked in production`,
          );
        }

        // Continue with original query
        return query(args);
      },
      // You can optionally hook specific models
      // user: { update: async ... }
    },
  });
};
