"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { setupTenant } from "./actions";
import Image from "next/image";
import logoImg from "@/logo.png";

export default function SetupPage() {
  const [state, action, pending] = useActionState(setupTenant, null);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <Image
            src={logoImg}
            alt="PrestaContas"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <span className="text-xl font-semibold text-zinc-100">
            PrestaContas
          </span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight mb-2">
            Configurar sua igreja
          </h2>
          <p className="text-zinc-500 text-sm">
            Para começar, precisamos do nome da sua igreja
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Nome da Igreja
            </label>
            <input
              type="text"
              name="churchName"
              placeholder="Ex: Igreja Batista Central"
              required
              autoFocus
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
                Começar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
