import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export default async function EnderecosPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { addresses: true },
      })
    : null;

  if (!user) {
    return (
      <div className="min-h-dvh">
        <Topbar isLogged={false} />
        <main className="mx-auto max-w-sm px-4 py-6">
          <p className="text-sm">Faça login para gerenciar seus endereços.</p>
          <Link
            href="/auth/login"
            className="mt-2 inline-block font-semibold text-black"
          >
            Login
          </Link>
        </main>
      </div>
    );
  }

  const primaryAddress = user?.addresses[0];
  const addressLine = primaryAddress
    ? `${primaryAddress.street}, ${primaryAddress.city}`
    : undefined;

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={!!user} address={addressLine} />
      <main className="mx-auto max-w-sm px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="h-title">Endereços</h1>
          <Link href="/perfil" className="text-sm text-black font-semibold">
            Voltar
          </Link>
        </div>

        {!user && (
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-muted">Você não está logado.</p>
            <Link
              href="/auth/login"
              className="mt-2 inline-block font-semibold text-black"
            >
              Fazer login
            </Link>
          </div>
        )}

        {user && (
          <div className="space-y-3">
            {user.addresses.length > 0 ? (
              user.addresses.map((addr) => (
                <div key={addr.id} className="card p-4">
                  <p className="text-sm font-medium">{addr.label}</p>
                  <p className="text-sm text-muted">
                    {addr.street}, {addr.city} - {addr.state}, {addr.zip}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">Nenhum endereço cadastrado.</p>
            )}

            {/* Form para adicionar novo endereço (UI) */}
            <form className="card p-4 space-y-3" action={createAddress}>
              <h2 className="font-semibold">Adicionar endereço de entrega</h2>
              <Field label="CEP">
                <input
                  name="zip"
                  className="input"
                  placeholder="00000-000"
                  maxLength={9}
                  required
                />
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Field label="Cidade">
                    <input
                      name="city"
                      className="input"
                      placeholder="Digite a cidade"
                      required
                    />
                  </Field>
                </div>
                <div>
                  <Field label="UF">
                    <input
                      name="state"
                      className="input"
                      placeholder="Ex: SP"
                      maxLength={2}
                      required
                    />
                  </Field>
                </div>
              </div>
              <Field label="Rua">
                <input
                  name="street"
                  className="input"
                  placeholder="Digite o endereço"
                  required
                />
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Field label="Bairro">
                    <input
                      name="district"
                      className="input"
                      placeholder="Digite o bairro"
                    />
                  </Field>
                </div>
                <div>
                  <Field label="Número">
                    <input
                      name="number"
                      className="input"
                      placeholder="Ex: 123"
                    />
                  </Field>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <input type="hidden" name="label" value="Minha Casa" />
                <button
                  className="btn btn-secondary"
                  formAction={createAddress}
                >
                  Adicionar Endereço
                </button>
                <button className="btn" type="submit">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

async function createAddress(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const zip = String(formData.get("zip") || "");
  const city = String(formData.get("city") || "");
  const state = String(formData.get("state") || "");
  const street = String(formData.get("street") || "");
  const label = String(formData.get("label") || "Outros");

  await prisma.address.create({
    data: {
      userId: user.id,
      label,
      street,
      city,
      state,
      zip,
    },
  });
  revalidatePath("/perfil/enderecos");
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-muted">{label}</label>
      {children}
    </div>
  );
}
