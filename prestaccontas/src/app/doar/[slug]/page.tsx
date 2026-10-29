import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { generatePixPayload, pixKeyTypeLabel, formatPixKey } from "@/lib/pix";
import PixDisplay from "./PixDisplay";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("slug", slug)
    .single();

  return {
    title: tenant ? `Doação - ${tenant.name}` : "Doação PIX",
    description: "Contribua com sua doação via PIX",
  };
}

export default async function DoarPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, pix_key, pix_key_type, logo_url")
    .eq("slug", slug)
    .single();

  if (!tenant || !tenant.pix_key || !tenant.pix_key_type) {
    notFound();
  }

  const payload = generatePixPayload({
    key: tenant.pix_key,
    keyType: tenant.pix_key_type,
    merchantName: tenant.name,
    merchantCity: "SAO PAULO",
  });

  return (
    <PixDisplay
      payload={payload}
      churchName={tenant.name}
      pixKey={formatPixKey(tenant.pix_key, tenant.pix_key_type)}
      pixKeyType={pixKeyTypeLabel(tenant.pix_key_type)}
      logoUrl={tenant.logo_url}
    />
  );
}