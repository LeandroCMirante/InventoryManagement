import { PrismaClient } from "@prisma/client";

// Esta variável global irá armazenar a instância do Prisma.
// Usamos 'globalThis' para garantir que funcione em diferentes ambientes.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Esta função garante que apenas uma instância do PrismaClient seja criada.
// Se já existir uma instância, ela será reutilizada.
// Em produção, uma nova instância é sempre criada.
// Em desenvolvimento, a instância global é usada para evitar recriações pelo hot-reload.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // Opcional: para ver as queries SQL no console.
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
