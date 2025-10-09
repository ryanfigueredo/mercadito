"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MailIcon } from "@/components/ui/icons";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao enviar email");
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl">✅</div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Email Enviado!
              </h1>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Se o email <strong>{email}</strong> estiver cadastrado, você
                receberá um link para redefinir sua senha.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-900">
                  💡 <strong>Dica:</strong> Verifique também sua caixa de spam.
                  O email pode levar alguns minutos para chegar.
                </p>
              </div>

              <Link href="/auth/login">
                <Button className="w-full bg-[#F8B075] hover:bg-[#e69a66]">
                  Voltar para Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#F8B075] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MailIcon size={32} className="text-[#F8B075]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Esqueceu sua senha?
            </h1>
            <p className="text-gray-600">
              Sem problemas! Digite seu email e enviaremos um link para
              redefinir.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                left={<MailIcon />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#F8B075] hover:bg-[#e69a66] h-12"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Enviando...
                </div>
              ) : (
                "Enviar Link de Recuperação"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Voltar para Login
              </Link>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                🔒 <strong>Segurança:</strong> O link de recuperação expira em 1
                hora. Por segurança, não informamos se o email existe em nossa
                base.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
