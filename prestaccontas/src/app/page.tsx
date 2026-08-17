"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  QrCode,
  BarChart3,
  Users,
  CalendarDays,
  Wallet,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Heart,
  FileText,
  Smartphone,
  Menu,
  X,
} from "lucide-react";
import logoImg from "@/logo.png";
import { SubscribeButton } from "@/components/SubscribeButton";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determinar se rolou o suficiente para mudar o estado
      if (currentScrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Mostrar/esconder baseado na direção do scroll
      if (currentScrollY < 100) {
        // No topo, sempre visível
        setVisible(true);
      } else if (currentScrollY > lastScrollY + 5) {
        // Rolando para baixo - esconder
        setVisible(false);
      } else if (currentScrollY < lastScrollY - 5) {
        // Rolando para cima - mostrar
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const features = [
    {
      icon: Wallet,
      title: "Gestão Financeira",
      description:
        "Controle total de dízimos, ofertas e despesas. Relatórios claros para prestação de contas.",
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      icon: QrCode,
      title: "Check-in por QR Code",
      description:
        "Presença digital via celular. Sem papel, sem cadastro complicado. Funciona para qualquer evento.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      icon: Users,
      title: "Gestão de Membros",
      description:
        "Cadastro completo com ministerios, telefones e aniversários. Integração com WhatsApp.",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      icon: CalendarDays,
      title: "Agenda de Eventos",
      description:
        "Crie eventos, envie convites por WhatsApp e acompanhe a presença em tempo real.",
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description:
        "Relatórios financeiros e de presença. Saiba quem compareceu e quem faltou.",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      icon: Shield,
      title: "Multi-tenant Seguro",
      description:
        "Cada igreja com seus dados isolados. Controle de acesso por perfil (admin, editor, visualizador).",
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
  ];

  const painPoints = [
    {
      problem: "Planilhas confusas para controlar dízimos e ofertas",
      solution: "Dashboard financeiro com categorias automáticas",
    },
    {
      problem: "Lista de presença em papel que se perde",
      solution: "Check-in digital por QR Code em tempo real",
    },
    {
      problem: "Não saber quem faltou nos cultos",
      solution: "Relatório de faltosos automático por evento",
    },
    {
      problem: "Relatórios manuais para prestação de contas",
      solution: "PDF profissional gerado com um clique",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Crie seu evento",
      description:
        "Defina titulo, data, horário e local. O sistema gera o QR Code automaticamente.",
    },
    {
      number: "02",
      title: "Projete o QR Code",
      description:
        "Mostre na tela da igreja ou imprima. Qualquer celular escaneia.",
    },
    {
      number: "03",
      title: "Membros confirmam",
      description:
        "Sem app, sem cadastro. Nome, membro ou visitante, confirmar. Pronto!",
    },
    {
      number: "04",
      title: "Acompanhe em tempo real",
      description:
        "Veja quem está presente, estatísticas e relatórios instantaneamente.",
    },
  ];

  const testimonials = [
    {
      name: "Pr. Marcos Silva",
      church: "Igreja Comunidade da Graça",
      text: "O Maná Sistemas transformou nossa prestação de contas. Antes levávamos dias para preparar relatórios, agora é instantâneo.",
      rating: 5,
    },
    {
      name: "Ana Beatriz",
      church: "Igreja Batista Central",
      text: "O check-in por QR Code é incrível! Nossos membros adoraram a praticidade. Nunca mais perdemos lista de presença.",
      rating: 5,
    },
    {
      name: "Pr. João Oliveira",
      church: "Assembleia de Deus",
      text: "Sistema completo e fácil de usar. A gestão financeira ficou transparente e os relatórios são profissionais.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "Preciso instalar algum aplicativo?",
      response:
        "Não! O Maná Sistemas funciona 100% no navegador. Acesse de qualquer dispositivo com internet.",
    },
    {
      question: "O check-in por QR Code funciona em qualquer celular?",
      response:
        "Sim! Qualquer smartphone com câmera escaneia o QR Code. Não precisa baixar nada.",
    },
    {
      question: "Quantos membros posso cadastrar?",
      response:
        "Ilimitado! Cadastre quantos membros precisar sem custo adicional.",
    },
    {
      question: "Os dados ficam seguros?",
      response:
        "Sim! Cada igreja tem seus dados isolados. Usamos criptografia e backups automáticos.",
    },
    {
      question: "Posso exportar os relatórios?",
      response:
        "Sim! Gere relatórios em PDF profissional para prestação de contas.",
    },
    {
      question: "Funciona para igrejas pequenas?",
      response:
        "Perfeitamente! O sistema se adapta a qualquer tamanho de igreja.",
    },
  ];

  const pricingPlans = [
    {
      name: "Plano Completo",
      price: "R$147,00",
      period: "/mês",
      description: "Tudo que sua igreja precisa em um único plano",
      features: [
        "Membros ilimitados",
        "Gestão financeira completa",
        "Eventos ilimitados",
        "Check-in por QR Code",
        "Relatórios avançados em PDF",
        "Gestão de membros completa",
        "Convites via WhatsApp",
        "Relatório de faltosos",
        "Multi-usuário com perfis",
        "Suporte prioritário",
      ],
      cta: "Ver Demonstração",
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled 
            ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-lg shadow-black/10" 
            : "bg-transparent"
        } ${visible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Image
                src={logoImg}
                alt="Maná Sistemas"
                width={100}
                height={100}
                className="rounded-xl object-contain"
                priority
              />
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Funcionalidades
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Como Funciona
              </a>
              <a
                href="#pricing"
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Preços
              </a>
              <a
                href="#faq"
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                FAQ
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-gold text-black text-sm font-medium hover:bg-gold/90 transition-colors"
              >
                Ver Demonstração
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile menu - Full screen overlay */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 top-0 left-0 right-0 bottom-0 z-40 animate-fade-in">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Menu panel */}
              <div className="relative mt-20 mx-4 bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-border-light shadow-2xl shadow-black/50 overflow-hidden animate-slide-down">
                {/* Navigation links */}
                <nav className="p-6 space-y-1">
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-200 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    <span className="text-sm font-medium">Funcionalidades</span>
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-200 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    <span className="text-sm font-medium">Como Funciona</span>
                  </a>
                  <a
                    href="#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-200 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    <span className="text-sm font-medium">Preços</span>
                  </a>
                  <a
                    href="#faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-200 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    <span className="text-sm font-medium">FAQ</span>
                  </a>
                </nav>

                {/* Divider */}
                <div className="mx-6 border-t border-border" />

                {/* Action buttons */}
                <div className="p-6 space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-xl border border-border text-zinc-200 text-sm font-medium hover:bg-white/[0.05] transition-all"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-all"
                  >
                    Ver Demonstração
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,rgba(212,168,67,0.15),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-8">
              <Zap className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold font-medium">
                Sistema completo para igrejas
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-zinc-100 tracking-tight leading-[1.1] mb-6">
              Gestão financeira
              <br />
              <span className="text-gold">com transparência</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Controle dízimos, ofertas e despesas da sua igreja em um único
              lugar. Check-in por QR Code, relatórios profissionais e gestão
              completa de membros.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center">
              <Link
                href="/login"
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gold text-black text-base font-semibold hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Ver Demonstração
              </Link>
            </div>


          </div>

          {/* Hero visual - Dashboard preview */}
          <div className="mt-16 md:mt-24 relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-gold/20 via-transparent to-gold/20 blur-3xl opacity-50" />
            <div className="relative glass-card rounded-2xl border border-border-light overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-ruby/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="ml-4 text-xs text-zinc-500">
                    Maná Sistemas - Dashboard
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="glass-card p-4">
                    <p className="text-xs text-zinc-500 mb-1">Total Entradas</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      R$ 45.280
                    </p>
                    <p className="text-xs text-emerald-400 mt-1">
                      +12% este mês
                    </p>
                  </div>
                  <div className="glass-card p-4">
                    <p className="text-xs text-zinc-500 mb-1">Total Despesas</p>
                    <p className="text-2xl font-bold text-ruby">
                      R$ 28.450
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      8 categorias
                    </p>
                  </div>
                  <div className="glass-card p-4">
                    <p className="text-xs text-zinc-500 mb-1">Saldo</p>
                    <p className="text-2xl font-bold text-gold">R$ 16.830</p>
                    <p className="text-xs text-gold mt-1">Positivo</p>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-zinc-200">
                      Últimas Transações
                    </p>
                    <p className="text-xs text-zinc-500">Este mês</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Dízimo - João Silva",
                        amount: "R$ 500,00",
                        type: "entrada",
                      },
                      {
                        name: "Oferta Domingo",
                        amount: "R$ 2.340,00",
                        type: "entrada",
                      },
                      {
                        name: "Conta de Energia",
                        amount: "R$ 850,00",
                        type: "saida",
                      },
                      {
                        name: "Dízimo - Maria Santos",
                        amount: "R$ 350,00",
                        type: "entrada",
                      },
                    ].map((t, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <span className="text-sm text-zinc-300">{t.name}</span>
                        <span
                          className={`text-sm font-mono ${t.type === "entrada" ? "text-emerald-400" : "text-ruby"}`}
                        >
                          {t.type === "entrada" ? "+" : "-"}
                          {t.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Cansado de{" "}
              <span className="text-ruby">planilhas confusas</span>?
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Sua igreja merece um sistema profissional. Chega de perder tempo
              com controle manual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {painPoints.map((point, i) => (
              <div
                key={i}
                className="glass-card p-6 rounded-xl hover:border-ruby/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-ruby-dim flex items-center justify-center flex-shrink-0">
                    <X className="w-5 h-5 text-ruby" />
                  </div>
                  <div>
                    <p className="text-zinc-300 font-medium mb-2">
                      {point.problem}
                    </p>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{point.solution}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Tudo que sua igreja{" "}
              <span className="text-gold">precisa</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Um sistema completo para gestão financeira, eventos e membros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass-card p-6 rounded-xl hover:border-border-light transition-colors group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - QR Code */}
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Check-in <span className="text-emerald-400">em segundos</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Sem papel, sem cadastro complicado. Qualquer celular escaneia e
              confirma presença.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-gold">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400">{step.description}</p>
              </div>
            ))}
          </div>

          {/* QR Code visual */}
          <div className="mt-16 flex justify-center">
            <div className="glass-card p-8 rounded-2xl max-w-sm">
              <div className="w-48 h-48 bg-zinc-900 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <QrCode className="w-24 h-24 text-gold" />
              </div>
              <p className="text-center text-sm text-zinc-400">
                Escaneie e confirme presença
              </p>
              <p className="text-center text-xs text-zinc-600 mt-1">
                Sem app, sem cadastro
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              O que dizem <span className="text-gold">nossos clientes</span>
            </h2>
            <p className="text-zinc-400 text-lg">
              Mais de 500 igrejas já confiam no Maná Sistemas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="glass-card p-6 rounded-xl">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-gold fill-gold"
                    />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm mb-4 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div>
                  <p className="text-zinc-200 font-medium text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-zinc-500 text-xs">{testimonial.church}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Plano <span className="text-gold">Completo</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Tudo incluso por um preço justo. Sem surpresas, sem taxas ocultas.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-8 border-gold/50 relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-gold text-black text-sm font-medium">
                  Plano Único
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-zinc-500 text-sm mb-6">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gold">
                      {plan.price}
                    </span>
                    <span className="text-zinc-500 text-lg">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <SubscribeButton />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-32 bg-zinc-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Perguntas <span className="text-gold">Frequentes</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium text-zinc-200">
                    {faq.question}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-zinc-400">{faq.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-8 md:p-12 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
                Pronto para transformar a gestão da sua igreja?
              </h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
                Conheça todas as funcionalidades na demonstração completa.
              </p>
              <div className="flex items-center justify-center">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gold text-black text-base font-semibold hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Ver Demonstração
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src={logoImg}
                alt="Maná Sistemas"
                width={36}
                height={36}
                className="rounded-xl"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gold">Maná</span>
                <span className="text-xs text-zinc-500 -mt-1">Sistemas</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a
                href="#features"
                className="hover:text-zinc-300 transition-colors"
              >
                Funcionalidades
              </a>
              <a
                href="#pricing"
                className="hover:text-zinc-300 transition-colors"
              >
                Preços
              </a>
              <a
                href="#faq"
                className="hover:text-zinc-300 transition-colors"
              >
                FAQ
              </a>
              <Link
                href="/login"
                className="hover:text-zinc-300 transition-colors"
              >
                Entrar
              </Link>
            </div>

            <p className="text-xs text-zinc-600">
              &copy; 2026 Maná Sistemas. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}
