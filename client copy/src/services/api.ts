// src/services/api.ts
const API_URL = "http://localhost:8000/api"; // A URL base do seu backend

export const api = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Falha no login");
    }

    return res.json();
  },

  register: async (name: string, email: string, password: string) => {
    // Lógica para registro aqui...
  },
};
