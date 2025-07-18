import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// --- Registar um novo utilizador ---
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // 1. Verificar se o utilizador já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "O e-mail já está em uso." });
    }

    // 2. Encriptar a senha por segurança
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Criar o utilizador na base de dados
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Não enviar a senha de volta, nem mesmo o hash
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "Utilizador criado com sucesso!",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erro no registo:", error);
    res.status(500).json({ error: "Falha ao registar o utilizador." });
  }
};

// --- Fazer login de um utilizador existente ---
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Encontrar o utilizador na base de dados pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Se o utilizador não for encontrado, as credenciais são inválidas
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // 2. Comparar a senha fornecida com o hash guardado na base de dados
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    // Se as senhas não corresponderem, as credenciais são inválidas
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // 3. Gerar o Token JWT
    // O token contém informações (payload) que podem ser usadas no frontend e verificadas no backend.
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" } // O token expira em 24 horas
    );

    // 4. Enviar a resposta com o token e os dados do utilizador (sem a senha)
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Login bem-sucedido!",
      token: token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Falha ao fazer login." });
  }
};
