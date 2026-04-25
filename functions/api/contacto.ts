interface Env {
  RESEND_API_KEY: string;
  CONTACT_BCC_EMAIL?: string;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    const data: any = await context.request.json();
    const { name, email, message } = data;

    const RESEND_API_KEY = context.env.RESEND_API_KEY;
    const CONTACT_BCC_EMAIL = context.env.CONTACT_BCC_EMAIL;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "API Key missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Antonio García Mengual <no-reply@antoniogarciamengual.com>",
        to: ["infogarciamengual@gmail.com"],
        bcc: CONTACT_BCC_EMAIL ? [CONTACT_BCC_EMAIL] : undefined,
        reply_to: email,
        subject: `Consulta: ${name} (vía antoniogarciamengual.com)`,
        html: `
          <div lang="es" style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
            <h2 style="font-weight: 300; border-bottom: 1px solid #eee; padding-bottom: 15px;">Nueva consulta recibida</h2>
            <p>Se ha recibido un nuevo mensaje a través del formulario de contacto:</p>
            
            <div style="background: #fdfdfd; border: 1px solid #eee; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Nombre:</strong> ${name}</p>
              <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
            </div>

            <p><strong>Mensaje:</strong></p>
            <div style="background: #fdfdfd; border: 1px solid #eee; padding: 20px; border-radius: 8px; white-space: pre-wrap; color: #555;">${message}</div>
            
            <p style="font-size: 0.85rem; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              Este es un mensaje automático enviado desde el formulario de antoniogarciamengual.com
            </p>
          </div>
        `,
      }),
    });

    if (response.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const errorData = await response.json();
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
