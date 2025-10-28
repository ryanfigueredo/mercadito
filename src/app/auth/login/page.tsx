"use client";
import { useState, InputHTMLAttributes } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AppleIcon,
  GoogleIcon,
} from "@/components/ui/icons";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  remember: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm sol-text-primary">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}

function TextInput(
  props: InputHTMLAttributes<HTMLInputElement> & {
    left?: React.ReactNode;
    right?: React.ReactNode;
    error?: boolean;
  }
) {
  const { left, right, error: hasError, className, ...rest } = props;
  return (
    <div
      className={`relative flex items-center rounded-lg border bg-white transition-all duration-200 ${
        hasError
          ? "border-error focus-within:border-error focus-within:ring-2 focus-within:ring-error focus-within:ring-opacity-20"
          : "border-neutral-200 focus-within:border-sol-orange focus-within:ring-2 focus-within:ring-sol-orange focus-within:ring-opacity-20"
      }`}
    >
      {left && <span className="pl-3 text-sol-gray-medium">{left}</span>}
      <input
        {...rest}
        className={`h-12 w-full bg-transparent outline-none text-sol-gray-dark placeholder:text-neutral-400 ${
          left ? "pl-2" : "pl-3"
        } ${right ? "pr-9" : "pr-3"} rounded-lg ${className ?? ""}`}
      />
      {right && (
        <span className="absolute right-3 text-sol-gray-medium">{right}</span>
      )}
    </div>
  );
}

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const { signIn } = await import("next-auth/react");
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: "/perfil",
      });

      if (res?.error) {
        setError("E-mail ou senha incorretos");
      } else if (res?.ok) {
        window.location.href = "/perfil";
      }
    } catch {
      setError("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh">
      <div className="auth-hero bg-sol-orange">
        <div className="auth-wrap">
          <h1 className="text-4xl font-serif font-semibold mb-3 text-white animate-fade-in">
            mercadito
          </h1>
        </div>
      </div>

      <div className="auth-surface bg-white rounded-t-3xl animate-slide-up">
        <div className="card p-4">
          <h2 className="text-xl font-semibold text-sol-gray-dark mb-3">Login</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <p className="text-red-600 text-sm">❌ {error}</p>
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <Field label="E-mail" id="email" error={errors.email?.message}>
              <TextInput
                id="email"
                type="email"
                placeholder="E-mail"
                left={<MailIcon />}
                error={!!errors.email}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </Field>

            <Field label="Senha" id="password" error={errors.password?.message}>
              <TextInput
                id="password"
                type={show ? "text" : "password"}
                placeholder="Senha"
                left={<LockIcon />}
                right={
                  <button
                    type="button"
                    aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShow((s) => !s)}
                    className="p-1"
                  >
                    {show ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
                error={!!errors.password}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
            </Field>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm sol-text-primary">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-sol-orange focus:ring-sol-orange"
                  {...register("remember")}
                />
                Manter conectado
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm underline hover:text-sol-orange transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            <Button
              variant="default"
              className="w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <div className="mt-4 rounded-xl border border-neutral-200 p-4 text-center animate-fade-in">
          <p className="text-sm sol-text-secondary">Não tem uma conta?</p>
          <Link
            className="mt-1 inline-block font-semibold text-sol-orange hover:text-primary-600 transition-colors"
            href="/auth/register"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}
