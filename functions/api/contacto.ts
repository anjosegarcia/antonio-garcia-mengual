interface Env {
  RESEND_API_KEY?: string;
  CONTACT_BCC_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

type ContactData = {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
};

const MAX_BODY_BYTES = 12_000;
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$/i;

function json(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

async function readBody(request: Request): Promise<string | null> {
  if (!request.body) return null;

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let byteCount = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    byteCount += value.byteLength;
    if (byteCount > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

function parseContactData(value: unknown): ContactData | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const data = value as Record<string, unknown>;
  if (
    typeof data.name !== "string" ||
    typeof data.email !== "string" ||
    typeof data.message !== "string" ||
    typeof data.turnstileToken !== "string"
  ) {
    return null;
  }

  const name = data.name.trim();
  const email = data.email.trim();
  const message = data.message.trim();
  const turnstileToken = data.turnstileToken;

  if (
    !name ||
    name.length > 100 ||
    /[\u0000-\u001F\u007F]/.test(name) ||
    !EMAIL_PATTERN.test(email) ||
    email.length > 254 ||
    !message ||
    message.length > 5_000 ||
    !turnstileToken ||
    turnstileToken.length > 2_048
  ) {
    return null;
  }

  return { name, email, message, turnstileToken };
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) {
    return json({ error: "Formulario no disponible" }, 503);
  }

  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return json({ error: "Formato no admitido" }, 415);
  }

  let rawBody: string | null;
  try {
    rawBody = await readBody(request);
  } catch {
    return json({ error: "No se pudo leer el mensaje" }, 400);
  }
  if (rawBody === null) {
    return json({ error: "Mensaje demasiado largo" }, 413);
  }

  let data: ContactData | null;
  try {
    data = parseContactData(JSON.parse(rawBody));
  } catch {
    return json({ error: "Datos no válidos" }, 400);
  }
  if (!data) {
    return json({ error: "Datos no válidos" }, 400);
  }

  const bccEmail = env.CONTACT_BCC_EMAIL?.trim();
  const testRequested = data.email
    .toLowerCase()
    .endsWith("+contacto-prueba@gmail.com");
  const testAlias = bccEmail?.replace(
    /@gmail\.com$/i,
    "+contacto-prueba@gmail.com",
  );
  if (
    testRequested &&
    (!bccEmail ||
      !testAlias ||
      data.email.toLowerCase() !== testAlias.toLowerCase())
  ) {
    return json({ error: "Dirección de prueba no configurada" }, 400);
  }

  try {
    const verificationResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: data.turnstileToken,
          remoteip: request.headers.get("CF-Connecting-IP") ?? undefined,
        }),
      },
    );

    if (!verificationResponse.ok) {
      return json({ error: "No se pudo verificar el formulario" }, 502);
    }

    const verification = (await verificationResponse.json()) as {
      success?: boolean;
      hostname?: string;
      action?: string;
    };
    if (
      !verification.success ||
      verification.action !== "contacto" ||
      verification.hostname !== new URL(request.url).hostname
    ) {
      return json({ error: "Verificación no válida" }, 403);
    }

    const html = [
      '<div lang="es" style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px;">',
      "<h2>Nueva consulta recibida</h2>",
      "<p>Se ha recibido un nuevo mensaje a través del formulario de contacto:</p>",
      "<p><strong>Nombre:</strong> " + escapeHtml(data.name) + "</p>",
      "<p><strong>Email:</strong> " + escapeHtml(data.email) + "</p>",
      "<p><strong>Mensaje:</strong></p>",
      '<div style="white-space: pre-wrap;">' +
        escapeHtml(data.message) +
        "</div>",
      '<p style="font-size: 0.85rem; color: #999;">Enviado desde antoniogarciamengual.com</p>',
      "</div>",
    ].join("");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + env.RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "Antonio García Mengual <no-reply@antoniogarciamengual.com>",
        to: [testRequested ? bccEmail : "infogarciamengual@gmail.com"],
        bcc: testRequested ? undefined : bccEmail ? [bccEmail] : undefined,
        reply_to: data.email,
        subject:
          (testRequested ? "[PRUEBA] " : "") +
          "Consulta: " +
          data.name +
          " (vía antoniogarciamengual.com)",
        html,
      }),
    });

    if (!response.ok) {
      return json({ error: "No se pudo enviar el mensaje" }, 502);
    }
    return json({ success: true }, 200);
  } catch {
    return json({ error: "No se pudo enviar el mensaje" }, 502);
  }
}
