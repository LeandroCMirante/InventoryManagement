"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res
            .status(401)
            .json({ error: "Acesso negado. Nenhum token fornecido." });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        // Se o token não existir após o "Bearer", o acesso é negado.
        return res
            .status(401)
            .json({ error: "Acesso negado. Token mal formatado." });
    }
    try {
        // 3. Verificar se o token é válido usando a sua chave secreta.
        // O jwt.verify irá descodificar o token se for válido ou lançar um erro se não for.
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 4. Anexar os dados do utilizador à requisição.
        // Agora, qualquer rota protegida por este middleware terá acesso a 'req.user'.
        req.user = decoded;
        // 5. Chamar a próxima função no ciclo da requisição (o controller).
        next();
    }
    catch (error) {
        // Se o token for inválido (expirado, malformado, etc.), o acesso é negado.
        res.status(403).json({ error: "Token inválido ou expirado." });
    }
};
exports.authMiddleware = authMiddleware;
