import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Obter tenant_id do usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tenantId = formData.get("tenantId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Verificar se o tenantId corresponde ao do usuário
    if (tenantId !== profile.tenant_id) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 403 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split(".").pop();
    const fileName = `${tenantId}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Fazer upload para o Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro no upload:", uploadError);
      
      // Verificar se o erro é porque o bucket não existe
      if (uploadError.message?.includes('Bucket not found') || 
          uploadError.message?.includes('NoSuchBucket')) {
        return NextResponse.json(
          { error: "Bucket 'receipts' não encontrado. Execute o script de setup primeiro." },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: "Erro ao fazer upload do arquivo" },
        { status: 500 }
      );
    }

    // Obter URL pública (ou signed URL se bucket privado)
    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: fileName,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
