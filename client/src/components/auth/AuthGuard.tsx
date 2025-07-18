"use client";

import { useEffect, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentToken } from "@/redux/slices/authSlice";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const token = useAppSelector(selectCurrentToken);
  const router = useRouter();

  // Estado para saber se a verificação inicial (após a reidratação do Redux) já foi feita.
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // A verificação só deve acontecer depois de o Redux ter tido tempo de carregar o estado do localStorage.
    // Se o token for nulo DEPOIS da verificação, significa que o utilizador não está logado.
    if (token === null) {
      // Se não houver token, redireciona para a página de login.
      router.push("/login");
    } else {
      // Se houver um token, podemos considerar o utilizador verificado.
      setIsVerified(true);
    }
  }, [token, router]);

  // Se a verificação ainda não terminou e não há token, mostramos um ecrã de carregamento.
  // Isto evita que um utilizador logado veja a página de login por um instante.
  if (!isVerified) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        {/* Pode adicionar um spinner ou um componente de carregamento mais bonito aqui */}
        Carregando...
      </div>
    );
  }

  // Se a verificação terminou e o token existe, renderiza a página protegida.
  return <>{children}</>;
}
