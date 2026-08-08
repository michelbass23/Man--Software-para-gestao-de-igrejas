"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Eye, EyeOff, ArrowRight, UserPlus } from "lucide-react";
import { signIn, signUp } from "./actions";
import Image from "next/image";
import logoImg from "@/logo.png";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    null
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    null
  );

  const error = isSignUp ? signUpState : signInState;
  const isLoading = isSignUp ? signUpPending : signInPending;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,67,0.15),transparent_70%)]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Image
              src={logoImg}
              alt="Logo"
              width={240}
              height={240}
              className="rounded-2xl"
            />
          </div>

          <div>
            <h1 className="text-4xl font-semibold text-zinc-100 tracking-tight leading-tight mb-4">
              Gestão financeira
              <br />
              com transparência
              <br />
              e elegância.
            </h1>
            <p className="text-zinc-400 text-lg max-w-md">
              Controle dízimos, ofertas e despesas da sua igreja em um único
              lugar. Relatórios claros para prestação de contas.
            </p>
          </div>

          <p className="text-zinc-600 text-sm">
            &copy; 2026 Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image
              src={logoImg}
              alt="Logo"
              width={140}
              height={140}
              className="rounded-2xl"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight mb-2">
              {isSignUp ? "Criar conta" : "Entrar"}
            </h2>
            <p className="text-zinc-500 text-sm">
              {isSignUp
                ? "Cadastre sua igreja"
                : "Acesse o painel da sua igreja"}
            </p>
          </div>

          <form
            action={isSignUp ? signUpAction : signInAction}
            className="space-y-4"
          >
            {/* Nome da igreja (apenas no cadastro) */}
            {isSignUp && (
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Nome da Igreja
                </label>
                <input
                  type="text"
                  name="churchName"
                  placeholder="Ex: Igreja Batista Central"
                  required
                  autoFocus={isSignUp}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
                required
                autoFocus={!isSignUp}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-ruby-dim border border-ruby/20">
                <p className="text-ruby text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Criar conta" : "Entrar"}
                  {isSignUp ? (
                    <UserPlus className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>
          </form>

          {/* Toggle between login and sign up */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-background text-zinc-600 text-xs">
                ou
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-zinc-400 text-sm font-medium hover:text-zinc-200 hover:border-border-light transition-colors"
          >
            {isSignUp
              ? "Já tenho uma conta — Entrar"
              : "Criar uma nova conta"}
          </button>

          {/* Footer links */}
          <div className="mt-8 text-center">
            <p className="text-zinc-600 text-xs">
              {!isSignUp && (
                <>
                  Não tem uma conta?{" "}
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="text-gold hover:text-gold/80 transition-colors"
                  >
                    Cadastre-se
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
