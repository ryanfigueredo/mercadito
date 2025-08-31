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
  FacebookIcon,
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
      <label htmlFor={id} className="mb-1 block text-sm text-muted">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
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
      className={`relative flex items-center rounded-2xl border bg-white ${
        hasError ? "border-red-500" : "border-gray-300"
      }`}
    >
      {left && <span className="pl-3 text-muted">{left}</span>}
      <input
        {...rest}
        className={`h-12 w-full bg-transparent outline-none placeholder:text-muted ${
          left ? "pl-2" : "pl-3"
        } ${right ? "pr-9" : "pr-3"} rounded-2xl ${className ?? ""}`}
      />
      {right && <span className="absolute right-3 text-muted">{right}</span>}
    </div>
  );
}

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = async (data: FormData) => {
    const { signIn } = await import("next-auth/react");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: true,
      callbackUrl: "/perfil",
    });
    return res;
  };

  return (
    <div className="min-h-dvh">
      {/* Hero Peach */}
      <div className="auth-hero">
        <div className="auth-wrap">
          <h1 className="text-4xl font-serif font-semibold mb-3 text-white">
            mercadito
          </h1>
        </div>
      </div>

      {/* Superfície branca sobreposta */}
      <div className="auth-surface">
        <div className="card p-4">
          <h2 className="h-title mb-3">Login</h2>

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
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  {...register("remember")}
                />
                Manter conectado
              </label>
              <Link href="#" className="text-sm underline">
                Esqueci minha senha
              </Link>
            </div>

            <Button className="w-full" type="submit">
              Entrar
            </Button>

            {/* Separador */}
            <div className="sep">
              <div className="sep-line" />
              <span className="sep-text">ou acessar com</span>
              <div className="sep-line" />
            </div>

            {/* Sociais */}
            <div className="flex justify-center gap-3">
              <Button
                type="button"
                variant="accent"
                size="icon"
                aria-label="Apple"
              >
                <AppleIcon />
              </Button>
              <Button
                type="button"
                variant="accent"
                size="icon"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </Button>
              <Button
                type="button"
                variant="accent"
                size="icon"
                aria-label="Google"
              >
                <GoogleIcon />
              </Button>
            </div>
          </form>
        </div>

        {/* CTA inferior (card outline) */}
        <div className="mt-4 rounded-2xl border border-brand-500 p-4 text-center">
          <p className="text-sm text-muted">Não tem uma conta?</p>
          <Link
            className="mt-1 inline-block font-semibold text-brand-600"
            href="/auth/register"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}
