import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TermosPage() {
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
      <main className="mx-auto max-w-sm px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="h-title">Termos e Condições</h1>
          <Link href="/perfil" className="text-sm text-black font-semibold">
            Voltar
          </Link>
        </div>

        <div className="space-y-4">
          {/* Introdução */}
          <section className="card p-4">
            <h2 className="font-semibold text-lg mb-3">
              Termos de Uso e Condições Gerais
            </h2>
            <p className="text-sm text-muted mb-3">
              <strong>Última atualização:</strong>{" "}
              {new Date().toLocaleDateString("pt-BR")}
            </p>
            <p className="text-sm text-muted">
              Bem-vindo ao Mercadito! Estes termos e condições regulam o uso de
              nossa plataforma de e-commerce. Ao utilizar nossos serviços, você
              concorda com todas as condições aqui estabelecidas.
            </p>
          </section>

          {/* 1. Definições */}
          <section className="card p-4">
            <h3 className="font-semibold mb-3">1. Definições</h3>
            <div className="space-y-2 text-sm text-muted">
              <p>
                <strong>Mercadito:</strong> Plataforma de e-commerce
                especializada em produtos alimentícios.
              </p>
              <p>
                <strong>Usuário/Cliente:</strong> Pessoa física ou jurídica que
                utiliza nossa plataforma.
              </p>
              <p>
                <strong>Produtos:</strong> Itens alimentícios comercializados
                através da plataforma.
              </p>
              <p>
                <strong>Pedido:</strong> Solicitação de compra realizada pelo
                usuário.
              </p>
            </div>
          </section>

          {/* 2. Cadastro */}
          <section className="card p-4">
            <h3 className="font-semibold mb-3">
              2. Cadastro e Conta do Usuário
            </h3>
            <div className="space-y-2 text-sm text-muted">
              <p>
                • O cadastro é gratuito e obrigatório para realizar compras.
              </p>
              <p>• O usuário deve fornecer dados verdadeiros e atualizados.</p>
              <p>
                • É de responsabilidade do usuário manter a confidencialidade de
                sua senha.
              </p>
              <p>
                • Menores de 18 anos devem ter autorização dos responsáveis.
              </p>
              <p>
                • Reservamo-nos o direito de suspender contas com dados falsos.
              </p>
            </div>
          </section>

          {/* 3. Produtos e Preços */}
          <section className="card p-4">
            <h3 className="font-semibold mb-3">3. Produtos e Preços</h3>
            <div className="space-y-2 text-sm text-muted">
              <p>
                • Todos os produtos são de fornecedores confiáveis e
                certificados.
              </p>
              <p>• Preços podem ser alterados sem aviso prévio.</p>
              <p>• Imagens são meramente ilustrativas.</p>
              <p>• Produtos perecíveis têm prazo de validade controlado.</p>
              <p>
                • Reservamo-nos o direito de limitar quantidades por cliente.
              </p>
            </div>
          </section>

          {/* 4. Pedidos e Pagamento */}
          <section className="card p-4">
            <h3 className="font-semibold mb-3">
              4. Pedidos e Formas de Pagamento
            </h3>
            <div className="space-y-2 text-sm text-muted">
              <p>• Aceitamos PIX, cartão de crédito e pagamento na entrega.</p>
              <p>• Pedidos são processados após confirmação do pagamento.</p>
              <p>• PIX: processamento instantâneo.</p>
              <p>• Cartão: processamento em até 2 dias úteis.</p>
              <p>• Parcelamento: até 12x no cartão (conforme condições).</p>
            </div>
          </section>

          {/* 5. Entrega */}
          <section className="card p-4">
            <h3 className="font-semibold mb-3">5. Entrega e Frete</h3>
            <div className="space-y-2 text-sm text-muted">
              <p>• Entregas em até 2 horas após confirmação do pagamento.</p>
              <p>• Horário de funcionamento: 8h às 18h (segunda a sábado).</p>
              <p>• Pedidos após 18h são entregues no dia seguinte.</p>
              <p>• Frete calculado conforme distância e peso.</p>
              <p>• Cliente deve estar presente no endereço informado.</p>
            </div>
          </section>

          {/* 6. Troca e Devolução */}
          <section className="card p-4">
            <h3 className="font-semibold mb-3">6. Troca e Devolução</h3>
            <div className="space-y-2 text-sm text-muted">
              <p>• Produtos danificados: troca imediata.</p>
              <p>• Produtos fora do prazo: reembolso integral.</p>
              <p>• Prazo para solicitação: 7 dias após a entrega.</p>
              <p>
                • Produtos perecíveis: troca apenas por defeito de qualidade.
              </p>
              <p>• Reembolso via mesmo método de pagamento utilizado.</p>
            </div>
          </section>

          {/* 7. Responsabilidades */}
          <section className="card p-4">
            <h3 className="font-semibold mb-3">7. Responsabilidades</h3>
            <div className="space-y-2 text-sm text-muted">
              <p>
                <strong>Do Mercadito:</strong>
              </p>
              <p>• Garantir qualidade dos produtos.</p>
              <p>• Cumprir prazos de entrega.</p>
              <p>• Manter dados seguros (LGPD).</p>
              <p>• Oferecer suporte ao cliente.</p>

              <p className="mt-3">
                <strong>Do Cliente:</strong>
              </p>
              <p>• Fornecer dados corretos.</p>
              <p>• Estar presente na entrega.</p>
              <p>• Verificar produtos ao receber.</p>
              <p>• Respeitar prazos para troca.</p>
            </div>
          </section>

          {/* 8. Proteção de Dados */}
          <section className="card p-4">
            <h3 className="font-semibold mb-3">8. Proteção de Dados (LGPD)</h3>
            <div className="space-y-2 text-sm text-muted">
              <p>
                • Seus dados são protegidos conforme Lei Geral de Proteção de
                Dados.
              </p>
              <p>• Coletamos apenas dados necessários para o serviço.</p>
              <p>• Não compartilhamos dados com terceiros sem autorização.</p>
              <p>
                • Você pode solicitar exclusão de seus dados a qualquer momento.
              </p>
              <p>• Utilizamos criptografia SSL para transmissão de dados.</p>
            </div>
          </section>

          {/* 9. Modificações */}
          <section className="card p-4">
            <h3 className="font-semibold mb-3">9. Modificações dos Termos</h3>
            <div className="space-y-2 text-sm text-muted">
              <p>• Estes termos podem ser alterados a qualquer momento.</p>
              <p>
                • Alterações serão comunicadas via email ou notificação no app.
              </p>
              <p>• Uso continuado implica aceitação das novas condições.</p>
              <p>• Versão atual sempre disponível nesta página.</p>
            </div>
          </section>

          {/* 10. Contato */}
          <section className="card p-4">
            <h3 className="font-semibold mb-3">10. Contato e Suporte</h3>
            <div className="space-y-2 text-sm text-muted">
              <p>
                <strong>Dúvidas sobre estes termos:</strong>
              </p>
              <p>• Email: contato@mercadito.com.br</p>
              <p>• WhatsApp: (11) 99999-9999</p>
              <p>• Horário: 8h às 18h (segunda a sábado)</p>
            </div>
          </section>

          {/* Aceite */}
          <section className="card p-4 bg-green-50 border-green-200">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 0116 0zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">
                  Aceite dos Termos
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Ao utilizar nossa plataforma, você confirma que leu,
                  compreendeu e aceita integralmente estes termos e condições.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
