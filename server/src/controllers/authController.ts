import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, poassword } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(poassword, salt);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    res
      .status(201)
      .json({ message: "Usuário criado com sucesso", userId: user.id });
  } catch (error) {
    res.status(400).json({ error: "Não foi possível criar o usuário" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Encontrar o usuário pelo email
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }

  // 2. Comparar a senha fornecida com o hash salvo no banco
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).json({ error: "Senha incorreta." });
  }

  // 3. Gerar o Token JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role }, // Informações que vão no token
    process.env.JWT_SECRET as string, // Chave secreta para assinar o token
    { expiresIn: "24h" } // O token expira em 24 horas
  );

  res.status(200).json({
    message: "Login bem-sucedido!",
    token: token,
    user: { id: user.id, name: user.name, email: user.email },
  });
};
