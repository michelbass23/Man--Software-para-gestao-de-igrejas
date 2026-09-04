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
  const publicPaths = ["/", "/login", "/api/auth", "/checkin", "/termos", "/privacidade"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Rotas de API (não redirecionar, retornar JSON)
  const isApiPath = pathname.startsWith("/api/");

  // Se não autenticado e é rota de API, deixar a própria API tratar o erro
  if (!user && isApiPath) {
    return supabaseResponse;
  }

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

  // Se autenticado e está no setup, permitir
  if (user && pathname === "/setup") {
    return supabaseResponse;
  }

  // Se autenticado e acessando dashboard, verificar apenas se tem profile
  if (user && pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = "/setup";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
