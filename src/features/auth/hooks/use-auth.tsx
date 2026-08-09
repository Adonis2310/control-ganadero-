"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { authService } from "@/services/auth.service";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: typeof authService.signInWithPassword;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Fuente centralizada del estado de sesión en el cliente (sección 11 de la
 * Fase 13). La protección real de rutas ya la hace el middleware
 * (`supabase.auth.getUser()` server-side, ver `src/lib/supabase/middleware.ts`)
 * — este provider no la duplica; su función es distinta: detectar cuándo una
 * sesión que SÍ existía se cae inesperadamente (token expirado/revocado) para
 * mostrar el aviso de la sección 22 y centralizar `signOut` para que
 * cualquier componente cliente lo dispare igual (usado por `UserMenu`).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const teniaSesionRef = useRef(false);
  const cerrandoSesionRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      teniaSesionRef.current = Boolean(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_OUT" && teniaSesionRef.current && !cerrandoSesionRef.current) {
        toast.error("Tu sesión ha expirado. Inicia sesión nuevamente.");
        router.push("/login");
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      teniaSesionRef.current = Boolean(nextSession);
      cerrandoSesionRef.current = false;
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function signOut() {
    cerrandoSesionRef.current = true;
    await authService.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn: authService.signInWithPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return context;
}
