"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Esta variável global irá armazenar a instância do Prisma.
// Usamos 'globalThis' para garantir que funcione em diferentes ambientes.
const globalForPrisma = globalThis;
// Esta função garante que apenas uma instância do PrismaClient seja criada.
// Se já existir uma instância, ela será reutilizada.
// Em produção, uma nova instância é sempre criada.
// Em desenvolvimento, a instância global é usada para evitar recriações pelo hot-reload.
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new client_1.PrismaClient({
    log: ["query"], // Opcional: para ver as queries SQL no console.
});
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
