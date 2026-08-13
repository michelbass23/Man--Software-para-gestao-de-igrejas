"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const DEMO_EMAIL = "demo@prestaccontas.com";
const DEMO_PASSWORD = "demo2024";
const DEMO_CHURCH = "Igreja Comunidade da Graça";

// Gerar datas relativas a hoje
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

// Seed completo do demo
export async function seedDemo() {
  const admin = createAdminClient();

  // 1. Verificar se demo já existe e limpar
  const { data: existingUser } = await admin.auth.admin.listUsers();
  const demoUser = existingUser?.users?.find((u) => u.email === DEMO_EMAIL);

  if (demoUser) {
    // Buscar tenant do demo
    const { data: profile } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", demoUser.id)
      .single();

    if (profile) {
      // Deletar dados antigos (cascade cuida do resto)
      await admin.from("tenants").delete().eq("id", profile.tenant_id);
    }

    // Deletar usuário
    await admin.auth.admin.deleteUser(demoUser.id);
  }

  // 2. Criar usuário demo
  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    console.error("Erro ao criar usuário demo:", authError);
    return { error: "Erro ao criar conta demo" };
  }

  const userId = authData.user.id;

  // 3. Criar tenant (igreja)
  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({
      name: DEMO_CHURCH,
      slug: `demo-${Date.now().toString(36)}`,
      plan: "pro",
      status: "active",
    })
    .select()
    .single();

  if (tenantError || !tenant) {
    console.error("Erro ao criar tenant demo:", tenantError);
    return { error: "Erro ao criar igreja demo" };
  }

  const tenantId = tenant.id;

  // 4. Criar profile
  await admin.from("profiles").insert({
    id: userId,
    tenant_id: tenantId,
    name: "Pastor Demo",
    role: "admin",
  });

  // 5. Criar membros
  const members = [
    { name: "João Silva", phone: "(11) 99901-0001", status: "ativo", ministry: "Diaconato", marital_status: "casado" },
    { name: "Maria Santos", phone: "(11) 99901-0002", status: "ativo", ministry: "Louvor", marital_status: "casado" },
    { name: "Pedro Oliveira", phone: "(11) 99901-0003", status: "ativo", ministry: "Mídia", marital_status: "solteiro" },
    { name: "Ana Costa", phone: "(11) 99901-0004", status: "ativo", ministry: "Infantil", marital_status: "casado" },
    { name: "Lucas Souza", phone: "(11) 99901-0005", status: "ativo", ministry: "Louvor", marital_status: "solteiro" },
    { name: "Juliana Lima", phone: "(11) 99901-0006", status: "ativo", ministry: "Recepção", marital_status: "solteiro" },
    { name: "Carlos Ferreira", phone: "(11) 99901-0007", status: "ativo", ministry: "Diaconato", marital_status: "casado" },
    { name: "Fernanda Alves", phone: "(11) 99901-0008", status: "ativo", ministry: "Ensino", marital_status: "casado" },
    { name: "Rafael Martins", phone: "(11) 99901-0009", status: "ativo", ministry: "Evangelismo", marital_status: "solteiro" },
    { name: "Camila Rocha", phone: "(11) 99901-0010", status: "ativo", ministry: "Louvor", marital_status: "casado" },
    { name: "Bruno Carvalho", phone: "(11) 99901-0011", status: "ativo", ministry: "Mídia", marital_status: "solteiro" },
    { name: "Leticia Mendes", phone: "(11) 99901-0012", status: "ativo", ministry: "Infantil", marital_status: "casado" },
    { name: "Gabriel Pereira", phone: "(11) 99901-0013", status: "ativo", ministry: "Diaconato", marital_status: "solteiro" },
    { name: "Amanda Ribeiro", phone: "(11) 99901-0014", status: "ativo", ministry: "Recepção", marital_status: "solteiro" },
    { name: "Thiago Gomes", phone: "(11) 99901-0015", status: "ativo", ministry: "Louvor", marital_status: "casado" },
    { name: "Beatriz Barbosa", phone: "(11) 99901-0016", status: "inativo", ministry: null, marital_status: "solteiro" },
    { name: "Diego Nascimento", phone: "(11) 99901-0017", status: "ativo", ministry: "Ensino", marital_status: "casado" },
    { name: "Patricia Cardoso", phone: "(11) 99901-0018", status: "ativo", ministry: "Evangelismo", marital_status: "casado" },
    { name: "Marcos Teixeira", phone: "(11) 99901-0019", status: "visitante", ministry: null, marital_status: "solteiro" },
    { name: "Renata Dias", phone: "(11) 99901-0020", status: "ativo", ministry: "Louvor", marital_status: "solteiro" },
    { name: "Roberto Campos", phone: "(11) 99901-0021", status: "ativo", ministry: "Diaconato", marital_status: "casado" },
    { name: "Daniela Freitas", phone: "(11) 99901-0022", status: "ativo", ministry: "Infantil", marital_status: "casado" },
    { name: "Felipe Araujo", phone: "(11) 99901-0023", status: "ativo", ministry: "Mídia", marital_status: "solteiro" },
    { name: "Priscila Correia", phone: "(11) 99901-0024", status: "ativo", ministry: "Recepção", marital_status: "casado" },
    { name: "Leonardo Pinto", phone: "(11) 99901-0025", status: "ativo", ministry: "Louvor", marital_status: "solteiro" },
    { name: "Vanessa Moura", phone: "(11) 99901-0026", status: "inativo", ministry: null, marital_status: "divorciado" },
    { name: "Rodrigo Lopes", phone: "(11) 99901-0027", status: "ativo", ministry: "Ensino", marital_status: "casado" },
    { name: "Tatiane Cunha", phone: "(11) 99901-0028", status: "ativo", ministry: "Evangelismo", marital_status: "solteiro" },
    { name: "Anderson Reis", phone: "(11) 99901-0029", status: "visitante", ministry: null, marital_status: "solteiro" },
    { name: "Cristina Machado", phone: "(11) 99901-0030", status: "ativo", ministry: "Louvor", marital_status: "casado" },
  ];

  const memberRecords = members.map((m) => ({
    tenant_id: tenantId,
    name: m.name,
    phone: m.phone,
    status: m.status,
    ministry: m.ministry,
    marital_status: m.marital_status,
    birth_date: `${1960 + Math.floor(Math.random() * 40)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
  }));

  await admin.from("members").insert(memberRecords);

  // 6. Criar eventos
  const events = [
    { title: "Culto de Domingo", event_type: "culto", event_date: daysAgo(30), event_time: "09:00", location: "Templo Principal", responsible_name: "Pastor Demo", status: "concluido" },
    { title: "Culto de Quarta", event_type: "culto", event_date: daysAgo(28), event_time: "19:30", location: "Templo Principal", responsible_name: "Pastor Demo", status: "concluido" },
    { title: "Culto de Domingo", event_type: "culto", event_date: daysAgo(23), event_time: "09:00", location: "Templo Principal", responsible_name: "Pastor Demo", status: "concluido" },
    { title: "Encontro de Jovens", event_type: "encontro", event_date: daysAgo(21), event_time: "19:00", location: "Salão Social", responsible_name: "Lucas Souza", status: "concluido" },
    { title: "Culto de Domingo", event_type: "culto", event_date: daysAgo(16), event_time: "09:00", location: "Templo Principal", responsible_name: "Pastor Demo", status: "concluido" },
    { title: "Culto de Quarta", event_type: "culto", event_date: daysAgo(14), event_time: "19:30", location: "Templo Principal", responsible_name: "Pastor Demo", status: "concluido" },
    { title: "Batismo nas Águas", event_type: "batismo", event_date: daysAgo(10), event_time: "10:00", location: "Templo Principal", responsible_name: "Pastor Demo", status: "concluido" },
    { title: "Culto de Domingo", event_type: "culto", event_date: daysAgo(9), event_time: "09:00", location: "Templo Principal", responsible_name: "Pastor Demo", status: "concluido" },
    { title: "Workshop de Louvor", event_type: "workshop", event_date: daysAgo(7), event_time: "14:00", location: "Salão Social", responsible_name: "Maria Santos", status: "concluido" },
    { title: "Culto de Domingo", event_type: "culto", event_date: daysAgo(2), event_time: "09:00", location: "Templo Principal", responsible_name: "Pastor Demo", status: "concluido" },
    { title: "Culto de Domingo", event_type: "culto", event_date: daysFromNow(5), event_time: "09:00", location: "Templo Principal", responsible_name: "Pastor Demo", status: "ativo" },
    { title: "Culto de Quarta", event_type: "culto", event_date: daysFromNow(8), event_time: "19:30", location: "Templo Principal", responsible_name: "Pastor Demo", status: "ativo" },
    { title: "Encontro de Casais", event_type: "encontro", event_date: daysFromNow(12), event_time: "19:00", location: "Salão Social", responsible_name: "Carlos Ferreira", status: "ativo" },
    { title: "Culto de Jovens", event_type: "culto_jovens", event_date: daysFromNow(14), event_time: "19:00", location: "Templo Principal", responsible_name: "Rafael Martins", status: "ativo" },
    { title: "Conferência de Mulheres", event_type: "conferencia", event_date: daysFromNow(20), event_time: "09:00", location: "Salão Social", responsible_name: "Fernanda Alves", status: "ativo" },
    { title: "Retiro Espiritual", event_type: "retiro", event_date: daysFromNow(30), event_time: "08:00", location: "Sítio da Igreja", responsible_name: "Pastor Demo", status: "ativo" },
  ];

  const { data: eventRecords } = await admin
    .from("events")
    .insert(events.map((e) => ({ ...e, tenant_id: tenantId })))
    .select();

  // 7. Criar presenças para eventos concluídos
  if (eventRecords) {
    const completedEvents = eventRecords.filter((e) => e.status === "concluido");
    const activeMembers = members.filter((m) => m.status === "ativo");

    for (const event of completedEvents) {
      // Cada evento tem entre 60-90% dos membros presentes
      const attendanceRate = 0.6 + Math.random() * 0.3;
      const shuffled = [...activeMembers].sort(() => Math.random() - 0.5);
      const attending = shuffled.slice(0, Math.floor(shuffled.length * attendanceRate));

      // Alguns visitantes também
      const visitorCount = Math.floor(Math.random() * 5) + 1;
      const visitors = [
        "Visitante " + event.title.split(" ").pop(),
        "Convidado Especial",
        "Familiar do Membro",
        "Amigo da Comunidade",
        "Novo Convertido",
      ].slice(0, visitorCount);

      const attendanceRecords = [
        ...attending.map((m) => ({
          event_id: event.id,
          tenant_id: tenantId,
          name: m.name,
          status: "membro",
          checked_in_at: new Date(
            new Date(`${event.event_date}T${event.event_time || "09:00"}`).getTime() +
              Math.random() * 30 * 60 * 1000
          ).toISOString(),
        })),
        ...visitors.map((v) => ({
          event_id: event.id,
          tenant_id: tenantId,
          name: v,
          status: "visitante",
          checked_in_at: new Date(
            new Date(`${event.event_date}T${event.event_time || "09:00"}`).getTime() +
              Math.random() * 30 * 60 * 1000
          ).toISOString(),
        })),
      ];

      await admin.from("attendance").insert(attendanceRecords);
    }
  }

  // 8. Criar entradas financeiras (últimos 3 meses)
  const activeMembers = members.filter((m) => m.status === "ativo");
  const entries = [];
  for (let month = 0; month < 3; month++) {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - month);

    // Dízimos (15-20 membros por mês)
    for (let i = 0; i < 18; i++) {
      const member = activeMembers[i % activeMembers.length];
      entries.push({
        tenant_id: tenantId,
        date: `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        category: "dizimo",
        amount: Math.floor(Math.random() * 500) + 100,
        description: "Dízimo mensal",
        person_name: member.name,
      });
    }

    // Ofertas (4 por mês - domingos)
    for (let i = 0; i < 4; i++) {
      entries.push({
        tenant_id: tenantId,
        date: `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        category: "oferta",
        amount: Math.floor(Math.random() * 2000) + 500,
        description: `Oferta do ${i + 1}º Domingo`,
      });
    }

    // Doações (2-3 por mês)
    for (let i = 0; i < 2; i++) {
      entries.push({
        tenant_id: tenantId,
        date: `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        category: "doacao",
        amount: Math.floor(Math.random() * 1000) + 200,
        description: "Doação especial",
        person_name: members[Math.floor(Math.random() * members.length)].name,
      });
    }

    // Campanha (1 por mês)
    entries.push({
      tenant_id: tenantId,
      date: `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}-15`,
      category: "campanha",
      amount: Math.floor(Math.random() * 3000) + 1000,
      description: "Campanha de arrecadação",
    });
  }

  await admin.from("entries").insert(entries);

  // 9. Criar despesas (últimos 3 meses)
  const expenses = [];
  const fixedExpenses = [
    { category: "aluguel", amount: 2500, description: "Aluguel do templo", is_fixed: true, due_day: 10 },
    { category: "energia", amount: 800, description: "Conta de energia", is_fixed: true, due_day: 15 },
    { category: "agua", amount: 300, description: "Conta de água", is_fixed: true, due_day: 15 },
    { category: "internet", amount: 200, description: "Internet fibra", is_fixed: true, due_day: 5 },
    { category: "salarios", amount: 3500, description: "Salário pastoral", is_fixed: true, due_day: 5 },
    { category: "salarios", amount: 1500, description: "Salário secretário(a)", is_fixed: true, due_day: 5 },
    { category: "seguro", amount: 400, description: "Seguro do templo", is_fixed: true, due_day: 20 },
  ];

  for (let month = 0; month < 3; month++) {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - month);

    // Despesas fixas
    for (const expense of fixedExpenses) {
      expenses.push({
        tenant_id: tenantId,
        date: `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}-${String(expense.due_day).padStart(2, "0")}`,
        category: expense.category,
        amount: expense.amount + Math.floor(Math.random() * 100) - 50,
        description: expense.description,
        is_fixed: true,
        due_day: expense.due_day,
        is_recurring: true,
        status: "pago",
      });
    }

    // Despesas variáveis
    const variableExpenses = [
      { category: "manutencao", amount: 500, description: "Manutenção do ar condicionado" },
      { category: "material", amount: 300, description: "Material de escritório" },
      { category: "material", amount: 150, description: "Material de limpeza" },
      { category: "eventos", amount: 800, description: "Despesas com evento especial" },
      { category: "missoes", amount: 500, description: "Apoio missionário" },
      { category: "transporte", amount: 200, description: "Transporte para culto externo" },
    ];

    for (const expense of variableExpenses) {
      if (Math.random() > 0.3) {
        // 70% de chance de ter cada despesa
        expenses.push({
          tenant_id: tenantId,
          date: `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          category: expense.category,
          amount: expense.amount + Math.floor(Math.random() * 200) - 100,
          description: expense.description,
          is_fixed: false,
          status: "pago",
        });
      }
    }
  }

  await admin.from("expenses").insert(expenses);

  return { error: null, success: true };
}

// Login do demo
export async function loginDemo() {
  // Sempre recriar o demo com dados frescos
  const result = await seedDemo();
  if (result.error) {
    return result;
  }

  // Fazer login
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (error) {
    console.error("Erro ao fazer login demo:", error);
    return { error: "Erro ao acessar demo" };
  }

  revalidatePath("/", "layout");
  return { error: null, success: true, redirectTo: "/dashboard" };
}
