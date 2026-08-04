import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Devuelve el usuario autenticado o redirige al home si no hay sesión. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  return session.user;
}
