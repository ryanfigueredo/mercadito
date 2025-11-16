import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ContactSupportForm from "@/components/ContactSupportForm";

export default async function AjudaPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { addresses: true },
      })
    : null;

  if (!user) {
    redirect("/auth/login");
  }

  const primaryAddress = user?.addresses[0];
  const addressLine = primaryAddress
    ? `${primaryAddress.street}, ${primaryAddress.city}`
    : undefined;

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={!!user} address={addressLine} />
      <main className="mx-auto max-w-sm px-4 py-6 pb-28">
        <div className="flex items-center justify-between mb-3">
          <h1 className="h-title">Ajuda e Suporte</h1>
          <Link href="/perfil" className="text-sm text-black font-semibold">
            Voltar
          </Link>
        </div>

        <section className="card p-4">
          <h2 className="font-semibold mb-3">Entre em contato</h2>
          <p className="text-sm text-muted mb-4">
            Não encontrou sua dúvida? Escreva abaixo e nossa equipe te ajudará
            em até 2 horas.
          </p>
          <p className="text-xs text-muted mb-4">
            Mercadito • contato@mercadito.com.br • WhatsApp: (75) 99945-6200
          </p>

          <ContactSupportForm userEmail={user.email} userName={user.name} />

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Resposta rápida garantida!
                </p>
                <p className="text-xs text-blue-700">
                  Respondemos em até 2 horas durante horário comercial (8h às
                  18h)
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border p-4">
          <h2 className="font-semibold mb-4">Dúvidas frequentes</h2>
          <div className="space-y-3">
            {/* Pedidos e Entrega */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                Pedidos e Entrega
              </h3>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Como faço um pedido?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  É simples! Navegue pelos produtos, adicione ao carrinho,
                  escolha seu endereço de entrega, selecione a forma de
                  pagamento e finalize. Você receberá um QR Code para PIX ou
                  pode pagar com cartão.
                </p>
              </details>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Qual o prazo de entrega?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Nossas entregas são feitas em até 2 horas após a confirmação
                  do pagamento. Para pedidos feitos após as 18h, a entrega será
                  no dia seguinte.
                </p>
              </details>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Posso alterar meu pedido após confirmar?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Sim! Você pode alterar ou cancelar seu pedido até 10 minutos
                  após a confirmação. Após esse período, o pedido já estará
                  sendo preparado.
                </p>
              </details>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Como acompanho meu pedido?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Após confirmar o pagamento, você receberá atualizações por
                  WhatsApp sobre o status: "Preparando", "Saiu para entrega" e
                  "Entregue".
                </p>
              </details>
            </div>

            {/* Pagamento */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                Pagamento
              </h3>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Quais formas de pagamento vocês aceitam?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Aceitamos PIX (com QR Code), cartão de crédito (até 12x com
                  juros) e pagamento na entrega. O PIX é processado
                  instantaneamente!
                </p>
              </details>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  O PIX é seguro?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Sim! O PIX é uma das formas mais seguras de pagamento.
                  Utilizamos criptografia SSL e processamento via Mercado Pago,
                  líder em pagamentos no Brasil.
                </p>
              </details>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Posso parcelar no cartão?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Sim! Oferecemos parcelamento em até 12x no cartão de crédito.
                  Até 3x sem juros, de 4x a 6x com juros de 2% ao mês, e de 7x a
                  12x com juros de 4% ao mês.
                </p>
              </details>
            </div>

            {/* Produtos */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                Produtos
              </h3>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Os produtos são frescos?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Sim! Trabalhamos apenas com fornecedores confiáveis e todos os
                  produtos são selecionados diariamente para garantir a máxima
                  qualidade e frescor.
                </p>
              </details>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Posso devolver um produto?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Sim! Se o produto chegar danificado ou fora do prazo de
                  validade, entre em contato conosco que faremos a troca ou
                  reembolso.
                </p>
              </details>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Vocês têm produtos orgânicos?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Temos uma seção especial de produtos orgânicos! Procure pela
                  categoria "Orgânicos" no menu principal.
                </p>
              </details>
            </div>

            {/* Conta e Perfil */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                Conta e Perfil
              </h3>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Como altero meus dados pessoais?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Acesse "Meu Perfil" &gt; "Editar Perfil" e atualize suas
                  informações. Lembre-se de manter seu CPF atualizado para
                  facilitar os pagamentos.
                </p>
              </details>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Como adiciono um novo endereço?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Vá em "Meu Perfil" &gt; "Endereços" &gt; "Adicionar Novo
                  Endereço". Você pode ter vários endereços cadastrados e
                  escolher na hora do pedido.
                </p>
              </details>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Esqueci minha senha, e agora?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Na tela de login, clique em "Esqueci minha senha" e siga as
                  instruções. Enviaremos um link de recuperação para seu email.
                </p>
              </details>
            </div>

            {/* Problemas Técnicos */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                Problemas Técnicos
              </h3>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  O app está travando, o que fazer?
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Tente fechar e abrir o app novamente. Se o problema persistir,
                  verifique se há atualizações disponíveis na loja de
                  aplicativos.
                </p>
              </details>

              <details className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer text-sm">
                  Não consigo finalizar o pedido
                </summary>
                <p className="text-muted mt-2 text-sm">
                  Verifique se todos os campos estão preenchidos corretamente,
                  especialmente o endereço de entrega e os dados do cartão. Se o
                  problema persistir, tente outro método de pagamento.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
