"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token inválido. Solicite um novo link de recuperação.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validações
    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (!token) {
      setError("Token inválido");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao redefinir senha");
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
                Senha Redefinida!
              </h1>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Sua senha foi alterada com sucesso. Você será redirecionado para
                o login em alguns segundos...
              </p>

              <Link href="/auth/login">
                <Button className="w-full bg-[#F8B075] hover:bg-[#e69a66]">
                  Ir para Login Agora
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
              <LockIcon size={32} className="text-[#F8B075]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Nova Senha
            </h1>
            <p className="text-gray-600">
              Crie uma senha forte para proteger sua conta.
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
                Nova Senha
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                left={<LockIcon />}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading || !token}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                left={<LockIcon />}
                right={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a senha novamente"
                required
                disabled={loading || !token}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !token || !password || !confirmPassword}
              className="w-full bg-[#F8B075] hover:bg-[#e69a66] h-12"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Redefinindo...
                </div>
              ) : (
                "Redefinir Senha"
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

          {/* Dicas de senha */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Dicas para uma senha forte:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✓ Pelo menos 6 caracteres</li>
              <li>✓ Combine letras e números</li>
              <li>✓ Use caracteres especiais (!@#$%)</li>
              <li>✓ Evite informações pessoais</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#F8B075] border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
