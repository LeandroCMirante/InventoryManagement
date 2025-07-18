"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// --- Registar um novo utilizador ---
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // 1. Verificar se o utilizador já existe
        const existingUser = yield prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "O e-mail já está em uso." });
        }
        // 2. Encriptar a senha por segurança
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        // 3. Criar o utilizador na base de dados
        const user = yield prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        // Não enviar a senha de volta, nem mesmo o hash
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(201).json({
            message: "Utilizador criado com sucesso!",
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error("Erro no registo:", error);
        res.status(500).json({ error: "Falha ao registar o utilizador." });
    }
});
exports.registerUser = registerUser;
// --- Fazer login de um utilizador existente ---
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // 1. Encontrar o utilizador na base de dados pelo e-mail
        const user = yield prisma_1.prisma.user.findUnique({
            where: { email },
        });
        // Se o utilizador não for encontrado, as credenciais são inválidas
        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }
        // 2. Comparar a senha fornecida com o hash guardado na base de dados
        const isPasswordCorrect = yield bcrypt_1.default.compare(password, user.password);
        // Se as senhas não corresponderem, as credenciais são inválidas
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }
        // 3. Gerar o Token JWT
        // O token contém informações (payload) que podem ser usadas no frontend e verificadas no backend.
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" } // O token expira em 24 horas
        );
        // 4. Enviar a resposta com o token e os dados do utilizador (sem a senha)
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(200).json({
            message: "Login bem-sucedido!",
            token: token,
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: "Falha ao fazer login." });
    }
});
exports.loginUser = loginUser;
