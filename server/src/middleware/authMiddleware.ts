import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // 4. Anexar os dados do utilizador à requisição.
    // Agora, qualquer rota protegida por este middleware terá acesso a 'req.user'.
    req.user = decoded as { userId: string; email: string; role: string };

    // 5. Chamar a próxima função no ciclo da requisição (o controller).
    next();
  } catch (error) {
    // Se o token for inválido (expirado, malformado, etc.), o acesso é negado.
    res.status(403).json({ error: "Token inválido ou expirado." });
  }
};
