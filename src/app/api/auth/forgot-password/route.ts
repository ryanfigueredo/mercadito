import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Por segurança, sempre retornamos sucesso mesmo se o email não existir
    // Isso evita que hackers descubram quais emails estão cadastrados
    if (!user) {
      return NextResponse.json({
        message:
          "Se o email existir, você receberá um link para redefinir sua senha.",
      });
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Expira em 1 hora

    // Salvar token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpiry,
      },
    });

    // URL de reset
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // Enviar email com Resend
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@seumercadito.com.br",
        to: email,
        subject: "Redefinir Senha - Mercadito",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Redefinir Senha</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #F8B075 0%, #e69a66 100%); padding: 40px; text-align: center;">
                          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">🔐 Redefinir Senha</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                            Olá, <strong>${user.name}</strong>!
                          </p>
                          
                          <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                            Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Mercadito</strong>.
                          </p>
                          
                          <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                            Clique no botão abaixo para criar uma nova senha:
                          </p>
                          
                          <!-- Button -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #F8B075 0%, #e69a66 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(248, 176, 117, 0.3);">
                                  Redefinir Minha Senha
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="margin: 30px 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                            Ou copie e cole este link no seu navegador:
                          </p>
                          
                          <p style="margin: 0 0 30px 0; padding: 12px; background-color: #f3f4f6; border-radius: 8px; word-break: break-all; font-size: 14px; color: #374151;">
                            ${resetUrl}
                          </p>
                          
                          <div style="margin: 30px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                              ⚠️ <strong>Importante:</strong> Este link expira em <strong>1 hora</strong>.
                            </p>
                          </div>
                          
                          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                            Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                            © ${new Date().getFullYear()} Mercadito. Todos os direitos reservados.
                          </p>
                          <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                            Este é um email automático, por favor não responda.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });

      console.log(`Email de reset enviado para: ${email}`);
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError);
      // Não retornamos erro para o usuário por segurança
      // Apenas logamos no servidor
    }

    return NextResponse.json({
      message:
        "Se o email existir, você receberá um link para redefinir sua senha.",
    });
  } catch (error) {
    console.error("Erro ao processar reset de senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
