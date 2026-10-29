"use client";

import { Suspense } from "react";
import { useActionState } from "react";
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "@/logo.png";
import { forgotPassword } from "../actions";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}

function ForgotPasswordContent() {
  const [state, action, pending] = useActionState(forgotPassword, null);
  const emailSent = state === "EMAIL_SENT";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src={logoImg}
            alt="Maná Sistemas"
            width={100}
            height={100}
            className="rounded-2xl"
          />
        </div>

        {emailSent ? (
          /* ── Sucesso ── */
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-100 mb-3">
              E-mail enviado!
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Se existir uma conta com este e-mail, você receberá um link para
              redefinir sua senha. Verifique também a caixa de spam.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </div>
        ) : (
          /* ── Formulário ── */
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight mb-2">
                Recuperar senha
              </h1>
              <p className="text-zinc-500 text-sm">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            <form action={action} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    required
                    autoFocus
                    className="pl-10"
                  />
                </div>
              </div>

              {state && !emailSent && (
                <div className="p-3 rounded-xl bg-ruby-dim border border-ruby/20">
                  <p className="text-ruby text-sm">{state}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Enviar link de recuperação
                    <Mail className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
