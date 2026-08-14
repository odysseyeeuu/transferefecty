"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Refresco automático del chat en vivo.
 *
 * La v1 hacía polling contra `api.php`. Aquí se usa `router.refresh()`, que
 * vuelve a ejecutar el Server Component y reconcilia sólo lo que cambió — sin
 * necesidad de un endpoint JSON aparte ni de duplicar la lógica de permisos.
 *
 * Se pausa cuando la pestaña no está visible para no gastar recursos ni
 * consultas a la base de datos en pestañas de fondo.
 */
export function ChatAutoRefresh({ intervalMs = 7000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer !== null) return;
      timer = setInterval(() => router.refresh(), intervalMs);
    };
    const stop = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh(); // ponerse al día de inmediato al volver
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router, intervalMs]);

  return null;
}
