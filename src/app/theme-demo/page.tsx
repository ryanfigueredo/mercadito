import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ThemeDemo() {
  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho */}
      <header className="sol-header">
        <div className="sol-container py-4">
          <h1 className="sol-title-primary text-white">Tema SOL_ORIENTE_POP</h1>
          <p className="text-white/90">Demonstração do sistema de design</p>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="sol-container sol-section">
        {/* Seção de Botões */}
        <section className="mb-12">
          <h2 className="sol-title-secondary mb-6">Botões</h2>
          <div className="sol-grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="default">Primário</Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="accent">Acento</Button>
            <Button variant="highlight">Destaque</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="success">Sucesso</Button>
            <Button variant="destructive">Erro</Button>
          </div>
        </section>

        {/* Seção de Cards */}
        <section className="mb-12">
          <h2 className="sol-title-secondary mb-6">Cards</h2>
          <div className="sol-grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="sol-card">
              <CardHeader>
                <CardTitle className="sol-title-accent">Card Padrão</CardTitle>
                <CardDescription className="sol-text-secondary">
                  Este é um card com o tema SOL_ORIENTE_POP aplicado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="sol-text-primary mb-4">
                  Conteúdo do card com texto principal em cinza escuro para boa
                  legibilidade.
                </p>
                <Button variant="default" size="sm">
                  Ação
                </Button>
              </CardContent>
            </Card>

            <Card className="sol-card sol-glow">
              <CardHeader>
                <CardTitle className="sol-title-accent">
                  Card com Brilho
                </CardTitle>
                <CardDescription className="sol-text-secondary">
                  Card com efeito de brilho laranja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="sol-text-primary mb-4">
                  Este card tem um efeito de brilho sutil para destacar conteúdo
                  importante.
                </p>
                <Button variant="accent" size="sm">
                  Destaque
                </Button>
              </CardContent>
            </Card>

            <Card className="sol-card">
              <CardHeader>
                <CardTitle className="sol-title-accent">
                  Card com Badges
                </CardTitle>
                <CardDescription className="sol-text-secondary">
                  Demonstração de badges coloridos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <span className="sol-badge-primary">Laranja</span>
                    <span className="sol-badge-accent">Amarelo</span>
                    <span className="sol-badge-neutral">Neutro</span>
                  </div>
                  <Button variant="highlight" size="sm">
                    Promoção
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Seção de Formulários */}
        <section className="mb-12">
          <h2 className="sol-title-secondary mb-6">Formulários</h2>
          <Card className="sol-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="sol-title-accent">
                Formulário de Exemplo
              </CardTitle>
              <CardDescription className="sol-text-secondary">
                Demonstração de inputs com tema SOL_ORIENTE_POP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="sol-text-primary text-sm font-medium mb-2 block">
                  Nome
                </label>
                <Input className="sol-input" placeholder="Digite seu nome" />
              </div>
              <div>
                <label className="sol-text-primary text-sm font-medium mb-2 block">
                  Email
                </label>
                <Input
                  className="sol-input"
                  type="email"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="sol-text-primary text-sm font-medium mb-2 block">
                  Mensagem
                </label>
                <Input
                  className="sol-input"
                  placeholder="Sua mensagem aqui..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="default" className="flex-1">
                  Enviar
                </Button>
                <Button variant="secondary" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Seção de Tipografia */}
        <section className="mb-12">
          <h2 className="sol-title-secondary mb-6">Tipografia</h2>
          <Card className="sol-card">
            <CardContent className="space-y-4">
              <div>
                <h1 className="sol-title-primary mb-2">Título Principal</h1>
                <p className="sol-text-secondary">Classe: sol-title-primary</p>
              </div>
              <div>
                <h2 className="sol-title-secondary mb-2">Título Secundário</h2>
                <p className="sol-text-secondary">
                  Classe: sol-title-secondary
                </p>
              </div>
              <div>
                <h3 className="sol-title-accent mb-2">Título de Acento</h3>
                <p className="sol-text-secondary">Classe: sol-title-accent</p>
              </div>
              <div>
                <p className="sol-text-primary mb-2">
                  Este é um texto principal usando a classe sol-text-primary. É
                  usado para conteúdo importante e deve ter boa legibilidade.
                </p>
                <p className="sol-text-secondary mb-2">
                  Este é um texto secundário usando a classe sol-text-secondary.
                  É usado para informações complementares e descrições.
                </p>
                <p className="sol-text-accent">
                  Este é um texto de destaque usando a classe sol-text-accent. É
                  usado para destacar informações importantes.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Seção de Animações */}
        <section className="mb-12">
          <h2 className="sol-title-secondary mb-6">Animações</h2>
          <div className="sol-grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="sol-card sol-fade-in">
              <CardContent className="text-center py-8">
                <h3 className="sol-title-accent mb-2">Fade In</h3>
                <p className="sol-text-secondary">Animação suave de entrada</p>
              </CardContent>
            </Card>
            <Card className="sol-card sol-slide-up">
              <CardContent className="text-center py-8">
                <h3 className="sol-title-accent mb-2">Slide Up</h3>
                <p className="sol-text-secondary">
                  Animação de deslizar para cima
                </p>
              </CardContent>
            </Card>
            <Card className="sol-card sol-bounce-subtle">
              <CardContent className="text-center py-8">
                <h3 className="sol-title-accent mb-2">Bounce Sutil</h3>
                <p className="sol-text-secondary">
                  Animação de bounce discreta
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Seção de Cores */}
        <section className="mb-12">
          <h2 className="sol-title-secondary mb-6">Paleta de Cores</h2>
          <div className="sol-grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-full h-20 bg-sol-orange rounded-lg mb-2"></div>
              <p className="sol-text-primary text-sm font-medium">
                Laranja Principal
              </p>
              <p className="sol-text-secondary text-xs">#D75413</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-sol-yellow rounded-lg mb-2"></div>
              <p className="sol-text-primary text-sm font-medium">
                Amarelo Acento
              </p>
              <p className="sol-text-secondary text-xs">#E7C200</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-sol-gray-dark rounded-lg mb-2"></div>
              <p className="sol-text-primary text-sm font-medium">
                Cinza Escuro
              </p>
              <p className="sol-text-secondary text-xs">#333333</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-sol-gray-medium rounded-lg mb-2"></div>
              <p className="sol-text-primary text-sm font-medium">
                Cinza Médio
              </p>
              <p className="sol-text-secondary text-xs">#666666</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-sol-gray-light rounded-lg mb-2 border border-neutral-200"></div>
              <p className="sol-text-primary text-sm font-medium">
                Cinza Claro
              </p>
              <p className="sol-text-secondary text-xs">#F8F8F8</p>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="bg-sol-gray-light py-8">
        <div className="sol-container text-center">
          <p className="sol-text-secondary">
            Tema SOL_ORIENTE_POP - Vibrante, popular e acolhedor! 🌅✨
          </p>
        </div>
      </footer>
    </div>
  );
}
