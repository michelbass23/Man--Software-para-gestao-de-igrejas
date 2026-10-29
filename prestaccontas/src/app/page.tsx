"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  QrCode,
  Users,
  CalendarDays,
  Wallet,
  Shield,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Smartphone,
  Loader2,
  Star,
  TrendingUp,
  HeartHandshake,
  ArrowRight,
  X,
} from "lucide-react";
import logoImg from "@/logo.png";
import bannerImg from "@/banner.png";
import mobileImg from "@/mobile.png";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { loginDemo } from "@/app/login/demo-actions";

/* ─── Hook: Intersection Observer para animações ao scroll ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Animated counter ─── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useScrollReveal(0.3);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemo = async () => {
    setIsDemoLoading(true);
    const result = await loginDemo();
    if ("redirectTo" in result && result.redirectTo) {
      router.push(result.redirectTo);
    } else {
      setIsDemoLoading(false);
    }
  };

  /* ─── Data ─── */
  const features = [
    {
      icon: Wallet,
      title: "Gestão Financeira",
      description:
        "Controle total de dízimos, ofertas e despesas com categorias automáticas e relatórios claros.",
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      icon: QrCode,
      title: "Check-in por QR Code",
      description:
        "Presença digital via celular. Sem papel, sem cadastro. Funciona para qualquer evento.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      icon: Users,
      title: "Gestão de Membros",
      description:
        "Cadastro completo com ministérios, telefones e aniversários. Integração com WhatsApp.",
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
      icon: FileText,
      title: "Relatórios em PDF",
      description:
        "Relatórios profissionais gerados com um clique. Pronto para prestação de contas.",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      icon: Shield,
      title: "Dados Seguros",
      description:
        "Cada igreja com dados isolados. Criptografia, backups automáticos e controle de acesso.",
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
        "Defina título, data, horário e local. O sistema gera o QR Code automaticamente.",
      icon: CalendarDays,
    },
    {
      number: "02",
      title: "Projete o QR Code",
      description:
        "Mostre na tela da igreja ou imprima. Qualquer celular escaneia.",
      icon: QrCode,
    },
    {
      number: "03",
      title: "Membros confirmam",
      description:
        "Sem app, sem cadastro. Nome, membro ou visitante, confirmar. Pronto!",
      icon: Smartphone,
    },
    {
      number: "04",
      title: "Acompanhe em tempo real",
      description:
        "Veja quem está presente, estatísticas e relatórios instantaneamente.",
      icon: TrendingUp,
    },
  ];

  const testimonials = [
    {
      name: "Pr. Marcos Oliveira",
      role: "Igreja Batista Renovação",
      text: "O Maná Sistemas transformou nossa gestão financeira. Antes perdíamos horas com planilhas, agora em minutos temos tudo organizado e pronto para prestação de contas.",
      rating: 5,
    },
    {
      name: "Ana Beatriz Costa",
      role: "Secretária - Igreja Fonte da Vida",
      text: "O check-in por QR Code foi um divisor de águas. Sabemos exatamente quem comparece aos cultos e eventos. Os relatórios são excelentes!",
      rating: 5,
    },
    {
      name: "Diácono Roberto Silva",
      role: "Igreja Presbiteriana Central",
      text: "A transparência que o sistema proporciona é incrível. Os membros ficaram mais confiantes ao ver os relatórios detalhados de todas as entradas e saídas.",
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

  const stats = [
    { value: 500, suffix: "+", label: "Igrejas confiam no Maná" },
    { value: 50, suffix: "K+", label: "Check-ins realizados" },
    { value: 99, suffix: "%", label: "Uptime garantido" },
    { value: 4.9, suffix: "", label: "Nota média dos clientes" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ═══ JSON-LD (SEO) ═══ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Maná Sistemas",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Sistema completo de gestão financeira e administrativa para igrejas. Controle dízimos, ofertas, despesas, membros e eventos com check-in por QR Code.",
            url: process.env.NEXT_PUBLIC_SITE_URL || "https://manasistemas.com.br",
            offers: [
              {
                "@type": "Offer",
                name: "Plano Essencial",
                price: "59.00",
                priceCurrency: "BRL",
                description: "Até 150 membros",
              },
              {
                "@type": "Offer",
                name: "Plano Completo",
                price: "147.00",
                priceCurrency: "BRL",
                description: "Membros ilimitados",
              },
            ],
            author: {
              "@type": "Organization",
              name: "MRS Tecnologia",
              url: "https://manasistemas.com.br",
            },
            publisher: {
              "@type": "Organization",
              name: "MRS Tecnologia",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "500",
            },
          }),
        }}
      />

      {/* ═══ Header / Navbar ═══ */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src={logoImg}
                alt="Maná Sistemas"
                width={36}
                height={36}
                className="rounded-xl"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gold leading-none">
                  Maná
                </span>
                <span className="text-[10px] text-zinc-500 tracking-wider uppercase">
                  Sistemas
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Funcionalidades
              </a>
              <a
                href="#pricing"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Preços
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Como Funciona
              </a>
              <a
                href="#faq"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                FAQ
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-white/5 transition-all"
              >
                Entrar
              </Link>
              <Link
                href="/login?mode=signup"
                className="px-4 py-2 rounded-lg bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-all"
              >
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ Hero — Banner Full Section ═══ */}
      <section className="relative">
        {/* Mobile */}
        <Image
          src={mobileImg}
          alt="Maná Sistemas - Gestão Financeira para Igrejas"
          className="w-full h-auto block md:hidden"
          priority
        />
        {/* Desktop */}
        <Image
          src={bannerImg}
          alt="Maná Sistemas - Gestão Financeira para Igrejas"
          className="w-full h-auto hidden md:block"
          priority
        />
      </section>

      {/* ═══ Stats Bar ═══ */}
      <section className="py-16 md:py-20 border-y border-border bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((stat, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-gold mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* CTA after stats */}
          <RevealSection delay={300}>
            <div className="mt-12 text-center">
              <button
                onClick={handleDemo}
                disabled={isDemoLoading}
                className="px-8 py-3.5 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-all inline-flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-gold/20"
              >
                {isDemoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Ver Demonstração Gratuita
              </button>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Pain Points Section ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-ruby mb-4 px-3 py-1 rounded-full bg-ruby/10 border border-ruby/20">
                Problemas comuns
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
                Cansado de{" "}
                <span className="text-ruby">planilhas confusas</span>?
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Sua igreja merece um sistema profissional. Chega de perder
                tempo com controle manual.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {painPoints.map((point, i) => (
              <RevealSection key={i} delay={i * 80}>
                <div className="glass-card p-6 rounded-xl hover:border-ruby/30 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-ruby-dim flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <X className="w-5 h-5 text-ruby" />
                    </div>
                    <div>
                      <p className="text-zinc-300 font-medium mb-2">
                        {point.problem}
                      </p>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{point.solution}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section id="features" className="py-20 md:py-28 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-gold mb-4 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                Funcionalidades
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
                Tudo que sua igreja{" "}
                <span className="text-gold">precisa</span>
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Um sistema completo para gestão financeira, eventos e membros.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <RevealSection key={i} delay={i * 80}>
                <div className="glass-card p-7 rounded-xl hover:border-border-light transition-all group h-full">
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* CTA after features */}
          <RevealSection delay={400}>
            <div className="mt-14 text-center">
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gold/30 text-gold text-sm font-semibold hover:bg-gold/10 transition-all"
              >
                Começar agora
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ How it Works ═══ */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-4 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                Simples e rápido
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
                Check-in{" "}
                <span className="text-emerald-400">em segundos</span>
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Sem papel, sem cadastro complicado. Qualquer celular escaneia e
                confirma presença.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20" />

            {steps.map((step, i) => (
              <RevealSection key={i} delay={i * 120}>
                <div className="text-center relative">
                  <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-5 relative z-10 group-hover:scale-110 transition-transform">
                    <step.icon className="w-8 h-8 text-gold" />
                  </div>
                  <span className="text-xs font-bold text-gold/60 tracking-widest uppercase mb-2 block">
                    Passo {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* QR Code visual */}
          <RevealSection className="mt-16" delay={300}>
            <div className="flex justify-center">
              <div className="glass-card p-8 md:p-10 rounded-2xl max-w-sm text-center">
                <div className="w-48 h-48 bg-zinc-900 rounded-xl mx-auto mb-5 flex items-center justify-center border border-border">
                  <QrCode className="w-24 h-24 text-gold" />
                </div>
                <p className="text-base font-medium text-zinc-200 mb-1">
                  Escaneie e confirme presença
                </p>
                <p className="text-sm text-zinc-500">
                  Sem app, sem cadastro, sem complicação
                </p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section id="testimonials" className="py-20 md:py-28 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-amber-400 mb-4 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                Depoimentos
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
                Quem usa,{" "}
                <span className="text-amber-400">recomenda</span>
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Veja o que líderes de igrejas dizem sobre o Maná Sistemas.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div className="glass-card p-7 rounded-xl h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm text-zinc-300 leading-relaxed mb-6 flex-1">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-gold">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">
                        {t.name}
                      </p>
                      <p className="text-xs text-zinc-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* CTA after testimonials */}
          <RevealSection delay={300}>
            <div className="mt-14 text-center">
              <button
                onClick={handleDemo}
                disabled={isDemoLoading}
                className="px-8 py-3.5 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-all inline-flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-gold/20"
              >
                {isDemoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Experimentar Grátis
              </button>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-gold mb-4 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                Preços
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
                Planos que <span className="text-gold">crescem</span> com sua igreja
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Comece pequeno e faça upgrade quando precisar. Sem surpresas,
                sem taxas ocultas.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Plano Essencial */}
            <RevealSection delay={100}>
              <div className="glass-card rounded-2xl p-8 h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                    Essencial
                  </h3>
                  <p className="text-zinc-500 text-sm mb-4">
                    Para igrejas pequenas
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-zinc-500">R$</span>
                    <span className="text-5xl font-bold text-zinc-100">59</span>
                    <span className="text-zinc-500 text-base">,00/mês</span>
                  </div>
                  <p className="text-zinc-400 text-sm mt-2 font-medium">
                    Até 150 membros
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Controle financeiro completo",
                    "Gestão de membros",
                    "Eventos e agenda",
                    "Check-in por QR Code",
                    "Relatórios em PDF",
                  ].map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="/login?mode=signup"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-gold/30 text-gold text-sm font-semibold hover:bg-gold/10 transition-all"
                >
                  Começar agora
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </RevealSection>

            {/* Plano Completo */}
            <RevealSection delay={200}>
              <div className="glass-card rounded-2xl p-8 border-gold/30 relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-b-xl bg-gold text-black text-xs font-bold tracking-wider uppercase">
                  Mais popular
                </div>

                <div className="mb-6 mt-4">
                  <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                    Completo
                  </h3>
                  <p className="text-zinc-500 text-sm mb-4">
                    Para igrejas em crescimento
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-zinc-500">R$</span>
                    <span className="text-5xl font-bold text-gold">147</span>
                    <span className="text-zinc-500 text-base">,00/mês</span>
                  </div>
                  <p className="text-emerald-400 text-sm mt-2 font-medium">
                    Membros ilimitados
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Tudo do plano Essencial",
                    "Membros ilimitados",
                    "Equipe com múltiplos usuários",
                    "Convites via WhatsApp",
                    "Relatório de faltosos",
                    "Suporte prioritário",
                  ].map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="/login?mode=signup"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-all shadow-lg shadow-gold/25"
                >
                  Começar agora
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </RevealSection>
          </div>

          <RevealSection delay={300}>
            <p className="text-center text-xs text-zinc-600 mt-8">
              7 dias grátis em todos os planos · Cancele quando quiser · Anual com 2 meses grátis
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-20 md:py-28 bg-zinc-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-4 px-3 py-1 rounded-full bg-zinc-400/10 border border-zinc-400/20">
                Dúvidas
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
                Perguntas{" "}
                <span className="text-gold">Frequentes</span>
              </h2>
            </div>
          </RevealSection>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <RevealSection key={i} delay={i * 60}>
                <div className="glass-card rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-sm font-medium text-zinc-200 pr-4">
                      {faq.question}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        openFaq === i
                          ? "bg-gold/10 rotate-0"
                          : "bg-white/5 rotate-0"
                      }`}
                    >
                      {openFaq === i ? (
                        <ChevronUp className="w-4 h-4 text-gold" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed">
                      {faq.response}
                    </p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA Final ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="glass-card p-10 md:p-16 rounded-2xl relative overflow-hidden text-center">
              {/* Background gradients */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.08] via-transparent to-transparent" />
              <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(212,168,67,0.06),transparent_60%)]" />

              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
                  <HeartHandshake className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
                  Pronto para transformar
                  <br />
                  <span className="text-gold">a gestão da sua igreja?</span>
                </h2>
                <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                  Conheça todas as funcionalidades na demonstração completa.
                  Sem compromisso, sem cartão de crédito.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/login?mode=signup"
                    className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gold text-black text-base font-semibold hover:bg-gold/90 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:-translate-y-0.5"
                  >
                    Criar conta grátis
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleDemo}
                    disabled={isDemoLoading}
                    className="w-full sm:w-auto px-10 py-4 rounded-xl border border-border-light text-zinc-300 text-base font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDemoLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                    Ver Demonstração
                  </button>
                  <a
                    href="https://wa.me/5571999445787"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-10 py-4 rounded-xl border border-border-light text-zinc-300 text-base font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    Falar com suporte
                  </a>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-14 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={logoImg}
                  alt="Maná Sistemas"
                  width={36}
                  height={36}
                  className="rounded-xl"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gold">Maná</span>
                  <span className="text-[10px] text-zinc-500 tracking-wider uppercase">
                    Sistemas
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Sistema completo de gestão financeira e administrativa para
                igrejas.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-4">
                Produto
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: "#features", label: "Funcionalidades" },
                  { href: "#pricing", label: "Preços" },
                  { href: "#how-it-works", label: "Como Funciona" },
                  { href: "#faq", label: "FAQ" },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/termos"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacidade"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-4">
                Suporte
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login?mode=signup"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Criar conta
                  </Link>
                </li>
                <li>
                  <a
                    href="https://wa.me/5571999445787"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    WhatsApp: (71) 99944-5787
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col items-center gap-3 text-center">
            <p className="text-xs text-zinc-600">
              &copy; 2026 Maná Sistemas. Todos os direitos reservados.
            </p>
            <p className="text-xs text-zinc-600">
              Desenvolvido por{" "}
              <span className="text-zinc-400 font-medium">MRS Tecnologia</span>
              {" "}· CNPJ 26.785.748/0001-30
            </p>
            <div className="flex items-center gap-1 text-xs text-zinc-600">
              <span>Feito com</span>
              <Heart className="w-3 h-3 text-ruby fill-ruby" />
              <span>para igrejas</span>
            </div>
          </div>
        </div>
      </footer>

      <WhatsAppFloatButton />
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

function Heart(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}