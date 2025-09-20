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
  UserIcon,
  AppleIcon,
  FacebookIcon,
  GoogleIcon,
} from "@/components/ui/icons";
import { IdIcon } from "@/components/ui/icons";
import { isValidCPF, stripCpfNonDigits } from "@/lib/cpf";

const schema = z
  .object({
    firstName: z.string().min(2, "Informe seu nome"),
    lastName: z.string().min(2, "Informe seu sobrenome"),
    email: z.string().email("E-mail inválido"),
    cpf: z
      .string()
      .transform((v) => stripCpfNonDigits(v))
      .refine((v) => v.length === 11, { message: "CPF deve ter 11 dígitos" })
      .refine((v) => isValidCPF(v), { message: "CPF inválido" }),
    phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirm: z.string().min(6, "Confirme a senha"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
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

export default function RegisterPage() {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta");
      }

      setSuccess(true);

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        window.location.href =
          "/auth/login?message=Conta criada com sucesso! Faça login.";
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
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

      {/* Superfície branca */}
      <div className="auth-surface">
        <div className="card p-4">
          <h2 className="h-title mb-3">Cadastre-se</h2>

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">
                ✅ Conta criada com sucesso! Redirecionando...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">❌ {error}</p>
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <Field label="CPF" id="cpf" error={errors.cpf?.message}>
              <TextInput
                id="cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                left={<IdIcon />}
                maxLength={14}
                onInput={(e) => {
                  const input = e.currentTarget as HTMLInputElement;
                  const digits = input.value.replace(/\D+/g, "").slice(0, 11);
                  const masked = digits
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                  setValue("cpf", masked as unknown as string, {
                    shouldValidate: true,
                  });
                  input.value = masked;
                }}
                error={!!errors.cpf}
                aria-invalid={!!errors.cpf}
                {...register("cpf")}
              />
            </Field>
            <Field
              label="Nome"
              id="firstName"
              error={errors.firstName?.message}
            >
              <TextInput
                id="firstName"
                placeholder="Nome"
                left={<UserIcon />}
                error={!!errors.firstName}
                aria-invalid={!!errors.firstName}
                {...register("firstName")}
              />
            </Field>

            <Field
              label="Sobrenome"
              id="lastName"
              error={errors.lastName?.message}
            >
              <TextInput
                id="lastName"
                placeholder="Sobrenome"
                left={<UserIcon />}
                error={!!errors.lastName}
                aria-invalid={!!errors.lastName}
                {...register("lastName")}
              />
            </Field>

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

            <Field label="Telefone" id="phone" error={errors.phone?.message}>
              <TextInput
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                left={<span className="text-muted">📱</span>}
                maxLength={15}
                onInput={(e) => {
                  const input = e.currentTarget as HTMLInputElement;
                  const digits = input.value.replace(/\D+/g, "").slice(0, 11);
                  const masked = digits
                    .replace(/(\d{2})(\d)/, "($1) $2")
                    .replace(/(\d{5})(\d)/, "$1-$2");
                  setValue("phone", masked as unknown as string, {
                    shouldValidate: true,
                  });
                  input.value = masked;
                }}
                error={!!errors.phone}
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </Field>

            <Field
              label="Digite sua senha"
              id="password"
              error={errors.password?.message}
            >
              <TextInput
                id="password"
                type={show1 ? "text" : "password"}
                placeholder="Digite sua senha"
                left={<LockIcon />}
                right={
                  <button
                    type="button"
                    aria-label={show1 ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShow1((s) => !s)}
                    className="p-1"
                  >
                    {show1 ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
                error={!!errors.password}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
            </Field>

            <Field
              label="Repita sua senha"
              id="confirm"
              error={errors.confirm?.message}
            >
              <TextInput
                id="confirm"
                type={show2 ? "text" : "password"}
                placeholder="Repita sua senha"
                left={<LockIcon />}
                right={
                  <button
                    type="button"
                    aria-label={show2 ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShow2((s) => !s)}
                    className="p-1"
                  >
                    {show2 ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
                error={!!errors.confirm}
                aria-invalid={!!errors.confirm}
                {...register("confirm")}
              />
            </Field>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
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

        {/* CTA inferior (outline) */}
        <div className="mt-4 rounded-2xl border border-black-500 p-4 text-center">
          <p className="text-sm text-muted">Já tem uma conta?</p>
          <Link
            className="mt-1 inline-block font-semibold text-black"
            href="/auth/login"
          >
            Faça Login
          </Link>
        </div>
      </div>
    </div>
  );
}
