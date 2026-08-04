import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginGoogle } from "./auth-actions";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-8 text-center">
        <h1 className="text-2xl font-bold text-ink">Generador BPMN</h1>
        <p className="mt-2 text-sm text-ink-2">
          Diagramas de proceso a partir de un prompt. Inicia sesión para ver
          tus diagramas.
        </p>
        <form action={loginGoogle} className="mt-6">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Iniciar sesión con Google
          </button>
        </form>
      </div>
    </main>
  );
}
