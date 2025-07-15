import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Endpoint /products acessado, lógica a ser refatorada.");
    res.json([]); // Simplesmente retorne um array vazio por enquanto
    // const users = await prisma.users.findMany();
    // res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving users" });
  }
};
