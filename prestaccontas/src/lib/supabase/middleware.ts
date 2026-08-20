import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rotas públicas (não precisam de autenticação)
  const publicPaths = ["/", "/login", "/api/auth", "/checkin"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Rotas de pagamento/assinatura (precisam de auth mas não de assinatura ativa)
  const paymentPaths = ["/assinatura", "/api/payment", "/api/subscription"];
  const isPaymentPath = paymentPaths.some((path) => pathname.startsWith(path));

  // Se não autenticado e não é rota pública, redirecionar para login
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Se autenticado e está no login ou landing, redirecionar para dashboard
  if (user && (pathname === "/login" || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Se autenticado e está no setup ou pagamento, permitir
  if (user && (pathname === "/setup" || isPaymentPath)) {
    return supabaseResponse;
  }

  // Se autenticado e acessando dashboard, verificar assinatura ativa
  if (user && pathname.startsWith("/dashboard")) {
    // Buscar profile para pegar tenant_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      // Sem profile, ir para setup
      const url = request.nextUrl.clone();
      url.pathname = "/setup";
      return NextResponse.redirect(url);
    }

    // Verificar se o tenant tem assinatura ativa
    const { data: tenant } = await supabase
      .from("tenants")
      .select("status, plan")
      .eq("id", profile.tenant_id)
      .single();

    // Se não tem assinatura ativa (nem trial), redirecionar para pagamento
    // Aceitar "active", "trialing" ou plan "free" como válidos
    const hasActiveSubscription = tenant && 
      (tenant.status === "active" || 
       tenant.status === "trialing" || 
       tenant.plan === "free");
    
    if (!hasActiveSubscription) {
      const url = request.nextUrl.clone();
      url.pathname = "/assinatura";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
