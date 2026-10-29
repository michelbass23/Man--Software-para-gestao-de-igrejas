"use client";

import { Suspense, useState } from "react";
import { useActionState } from "react";
import { Loader2, Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "@/logo.png";
import { updatePassword } from "../actions";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const [state, action, pending] = useActionState(updatePassword, null);
  const [showPassword, setShowPassword] = useState(false);

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

        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-gold" />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight mb-2">
            Definir nova senha
          </h1>
          <p className="text-zinc-500 text-sm">
            Escolha uma senha forte para proteger sua conta.
          </p>
        </div>

        <form action={action} className="space-y-4">
          {/* Nova senha */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Nova senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
                minLength={6}
                autoFocus
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

          {/* Confirmar senha */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Confirmar nova senha
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {state && (
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
                Salvar nova senha
                <KeyRound className="w-4 h-4" />
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
      </div>
    </div>
  );
}
