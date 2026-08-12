import "server-only";

/**
 * Envío de correo — puerto de `MailService.php`, que usaba `mail()` del
 * hosting (poco confiable). Aquí queda un adaptador con el mismo nombre de
 * función que usará el resto del código; hoy solo hace `console.log` en vez
 * de enviar de verdad.
 *
 * Para conectar un proveedor real (Resend recomendado):
 *   1. `npm install resend`
 *   2. Agregar `RESEND_API_KEY` a `.env.local` / Vercel
 *   3. Reemplazar el cuerpo de `sendMail` por la llamada al SDK de Resend
 * Nada más en el código necesita cambiar — todo lo que necesita mandar un
 * correo (reset de contraseña, etc.) ya llama a `sendMail()`.
 */
export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Fallback de desarrollo: no hay proveedor conectado todavía.
    // No lanza error — el flujo que llama a sendMail() no debe romperse
    // solo porque el correo no salió; sólo se registra para depurar.
    console.warn(
      `[mail] RESEND_API_KEY no configurado — correo NO enviado.\n  Para: ${to}\n  Asunto: ${subject}\n  Cuerpo:\n${html}`
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? "support@transferefecty.com",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    console.error(`[mail] Resend respondió ${res.status}: ${await res.text()}`);
  }
}
