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
  IdIcon,
} from "@/components/ui/icons";
import { isValidCPF, stripCpfNonDigits } from "@/lib/cpf";

// Schema para verificação de email
const emailSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

// Schema para código de verificação
const codeSchema = z.object({
  code: z.string().length(6, "Código deve ter 6 dígitos"),
});

// Schema para formulário completo
const registerSchema = z
  .object({
    firstName: z.string().min(2, "Informe seu nome"),
    lastName: z.string().min(2, "Informe seu sobrenome"),
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

type EmailData = z.infer<typeof emailSchema>;
type CodeData = z.infer<typeof codeSchema>;
type RegisterData = z.infer<typeof registerSchema>;

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
  // Estados para controle do fluxo
  const [step, setStep] = useState<"email" | "code" | "register">("email");
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Form para email
  const emailForm = useForm<EmailData>({
    resolver: zodResolver(emailSchema),
  });

  // Form para código
  const codeForm = useForm<CodeData>({
    resolver: zodResolver(codeSchema),
  });

  // Form para registro
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  // Enviar código de verificação
  const onSendCode = async (data: EmailData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar código");
      }

      setVerifiedEmail(data.email.toLowerCase().trim());
      setCodeSent(true);
      setStep("code");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar código");
    } finally {
      setLoading(false);
    }
  };

  // Verificar código
  const onVerifyCode = async (data: CodeData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verifiedEmail,
          code: data.code,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao verificar código");
      }

      setStep("register");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao verificar código");
    } finally {
      setLoading(false);
    }
  };

  // Finalizar cadastro
  const onRegister = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          email: verifiedEmail,
        }),
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

          {/* Indicador de progresso */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <div
              className={`h-2 w-12 rounded-full ${
                step === "email" ? "bg-primary" : "bg-green-500"
              }`}
            />
            <div
              className={`h-2 w-12 rounded-full ${
                step === "code"
                  ? "bg-primary"
                  : step === "register"
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
            <div
              className={`h-2 w-12 rounded-full ${
                step === "register" ? "bg-primary" : "bg-gray-300"
              }`}
            />
          </div>

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">
                {step === "code"
                  ? "Código enviado! Verifique seu email."
                  : step === "register"
                  ? "Email verificado! Complete seu cadastro."
                  : "Conta criada com sucesso! Redirecionando..."}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Etapa 1: Email */}
          {step === "email" && (
            <form
              className="space-y-3"
              onSubmit={emailForm.handleSubmit(onSendCode)}
            >
              <Field
                label="E-mail"
                id="email"
                error={emailForm.formState.errors.email?.message}
              >
                <TextInput
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  left={<MailIcon />}
                  error={!!emailForm.formState.errors.email}
                  {...emailForm.register("email")}
                />
              </Field>

              <p className="text-sm text-muted text-center">
                Enviaremos um código de verificação para este email
              </p>

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar código"}
              </Button>
            </form>
          )}

          {/* Etapa 2: Código */}
          {step === "code" && (
            <form
              className="space-y-3"
              onSubmit={codeForm.handleSubmit(onVerifyCode)}
            >
              <div className="mb-4 text-center">
                <p className="text-sm text-muted">
                  Código enviado para:
                  <br />
                  <strong className="text-black">{verifiedEmail}</strong>
                </p>
              </div>

              <Field
                label="Código de verificação"
                id="code"
                error={codeForm.formState.errors.code?.message}
              >
                <TextInput
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  error={!!codeForm.formState.errors.code}
                  {...codeForm.register("code")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    codeForm.setValue("code", value);
                  }}
                />
              </Field>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep("email");
                  setCodeSent(false);
                  codeForm.reset();
                }}
              >
                Alterar email
              </Button>

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Verificando..." : "Verificar código"}
              </Button>

              {codeSent && (
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      const response = await fetch(
                        "/api/auth/send-verification-code",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: verifiedEmail }),
                        }
                      );
                      const result = await response.json();
                      if (!response.ok) {
                        throw new Error(
                          result.error || "Erro ao reenviar código"
                        );
                      }
                      setSuccess(true);
                      setTimeout(() => setSuccess(false), 3000);
                    } catch (err: unknown) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Erro ao reenviar código"
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full text-sm text-primary underline"
                  disabled={loading}
                >
                  Reenviar código
                </button>
              )}
            </form>
          )}

          {/* Etapa 3: Registro completo */}
          {step === "register" && (
            <form
              className="space-y-3"
              onSubmit={registerForm.handleSubmit(onRegister)}
            >
              <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  Email verificado: <strong>{verifiedEmail}</strong>
                </p>
              </div>

              <Field
                label="CPF"
                id="cpf"
                error={registerForm.formState.errors.cpf?.message}
              >
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
                    registerForm.setValue("cpf", masked as any, {
                      shouldValidate: true,
                    });
                    input.value = masked;
                  }}
                  error={!!registerForm.formState.errors.cpf}
                  {...registerForm.register("cpf")}
                />
              </Field>

              <Field
                label="Nome"
                id="firstName"
                error={registerForm.formState.errors.firstName?.message}
              >
                <TextInput
                  id="firstName"
                  placeholder="Nome"
                  left={<UserIcon />}
                  error={!!registerForm.formState.errors.firstName}
                  {...registerForm.register("firstName")}
                />
              </Field>

              <Field
                label="Sobrenome"
                id="lastName"
                error={registerForm.formState.errors.lastName?.message}
              >
                <TextInput
                  id="lastName"
                  placeholder="Sobrenome"
                  left={<UserIcon />}
                  error={!!registerForm.formState.errors.lastName}
                  {...registerForm.register("lastName")}
                />
              </Field>

              <Field
                label="Telefone"
                id="phone"
                error={registerForm.formState.errors.phone?.message}
              >
                <TextInput
                  id="phone"
                  type="tel"
                  placeholder="(75)99945-6200"
                  left={<span className="text-muted">📱</span>}
                  maxLength={15}
                  onInput={(e) => {
                    const input = e.currentTarget as HTMLInputElement;
                    const digits = input.value.replace(/\D+/g, "").slice(0, 11);
                    const masked = digits
                      .replace(/(\d{2})(\d)/, "($1) $2")
                      .replace(/(\d{5})(\d)/, "$1-$2");
                    registerForm.setValue("phone", masked as any, {
                      shouldValidate: true,
                    });
                    input.value = masked;
                  }}
                  error={!!registerForm.formState.errors.phone}
                  {...registerForm.register("phone")}
                />
              </Field>

              <Field
                label="Digite sua senha"
                id="password"
                error={registerForm.formState.errors.password?.message}
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
                  error={!!registerForm.formState.errors.password}
                  {...registerForm.register("password")}
                />
              </Field>

              <Field
                label="Repita sua senha"
                id="confirm"
                error={registerForm.formState.errors.confirm?.message}
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
                  error={!!registerForm.formState.errors.confirm}
                  {...registerForm.register("confirm")}
                />
              </Field>

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          )}
        </div>

        {/* CTA inferior */}
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
