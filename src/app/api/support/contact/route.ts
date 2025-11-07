import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  subject: z.string().min(1, { message: "Selecione um assunto válido" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Mensagem deve ter pelo menos 10 caracteres" })
    .max(1000, { message: "Mensagem deve ter no máximo 1000 caracteres" }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = await request.json();
    const { subject, message } = contactSchema.parse(payload);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const toEmail = "contato@seumercadito.com.br";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@seumercadito.com.br";

    const subjectLabel = resolveSubjectLabel(subject);

    const messageHtml = buildSupportEmailHtml({
      userName: user?.name ?? "Cliente Mercadito",
      userEmail: session.user.email,
      userPhone: user?.phone ?? undefined,
      subjectLabel,
      message,
    });

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Ajuda - ${subjectLabel}`,
      html: messageHtml,
      reply_to: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message ?? "Dados inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Erro ao enviar contato de suporte:", error);
    return NextResponse.json(
      { error: "Não foi possível enviar sua mensagem. Tente novamente." },
      { status: 500 }
    );
  }
}

function resolveSubjectLabel(value: string) {
  switch (value) {
    case "problema_pedido":
      return "Problema com pedido";
    case "duvida_pagamento":
      return "Dúvida sobre pagamento";
    case "problema_entrega":
      return "Problema com entrega";
    case "produto_defeito":
      return "Produto com defeito";
    case "outro":
    default:
      return "Outro";
  }
}

function buildSupportEmailHtml({
  userName,
  userEmail,
  userPhone,
  subjectLabel,
  message,
}: {
  userName: string;
  userEmail: string;
  userPhone?: string;
  subjectLabel: string;
  message: string;
}) {
  const escapedMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Nova mensagem de suporte</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 24px;">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 24px; background: linear-gradient(135deg, #F8B075 0%, #e69a66 100%); color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px;">Nova mensagem de suporte</h1>
              <p style="margin: 4px 0 0; font-size: 14px;">Mercadito App</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px; color: #1f2933;">
              <p style="margin: 0 0 12px; font-size: 16px;">Você recebeu uma nova mensagem de suporte.</p>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; width: 120px;">Assunto</td>
                  <td style="padding: 8px 0;">${subjectLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">Nome</td>
                  <td style="padding: 8px 0;">${escapeHtml(userName)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">Email</td>
                  <td style="padding: 8px 0;"><a href="mailto:${userEmail}" style="color: #F8B075;">${userEmail}</a></td>
                </tr>
                ${userPhone ? `<tr><td style="padding: 8px 0; font-weight: 600;">Telefone</td><td style="padding: 8px 0;">${escapeHtml(userPhone)}</td></tr>` : ""}
              </table>

              <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 10px;">
                <h2 style="margin: 0 0 12px; font-size: 16px; color: #111827;">Mensagem</h2>
                <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; font-size: 14px; color: #374151;">${escapedMessage}</p>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

