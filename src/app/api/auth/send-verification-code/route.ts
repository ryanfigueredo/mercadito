import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendCodeSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = sendCodeSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar se email já está cadastrado
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 400 }
      );
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Expirar em 15 minutos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Salvar ou atualizar código de verificação
    await prisma.emailVerification.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        code,
        expiresAt,
        attempts: 0,
      },
      update: {
        code,
        expiresAt,
        attempts: 0, // Resetar tentativas ao gerar novo código
        createdAt: new Date(),
      },
    });

    // Enviar email com código
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@seumercadito.com.br",
        to: normalizedEmail,
        subject: "Código de Verificação - Mercadito",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Código de Verificação</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #F8B075 0%, #e69a66 100%); padding: 40px; text-align: center;">
                          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">Verificação de Email</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                            Olá!
                          </p>
                          
                          <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                            Para completar seu cadastro no <strong>Mercadito</strong>, utilize o código de verificação abaixo:
                          </p>
                          
                          <!-- Code Box -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                            <tr>
                              <td align="center">
                                <div style="display: inline-block; background: linear-gradient(135deg, #F8B075 0%, #e69a66 100%); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(248, 176, 117, 0.3);">
                                  <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    ${code}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          </table>
                          
                          <div style="margin: 30px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                              <strong>Importante:</strong> Este código expira em <strong>15 minutos</strong>.
                            </p>
                          </div>
                          
                          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                            Se você não solicitou este código, ignore este email.
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

      console.log(`Código de verificação enviado para: ${normalizedEmail}`);
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError);
      return NextResponse.json(
        { error: "Erro ao enviar email de verificação" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Código de verificação enviado para seu email",
    });
  } catch (error: unknown) {
    console.error("Erro ao enviar código:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
