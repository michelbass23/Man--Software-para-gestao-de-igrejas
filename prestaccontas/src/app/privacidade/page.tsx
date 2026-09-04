import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade | Maná Sistemas",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Política de Privacidade</h1>
        <p className="text-zinc-500 text-sm mb-10">Última atualização: 04 de setembro de 2026</p>

        <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
          <section>
            <p>
              Esta Política descreve como o Maná Sistemas (MRS TECNOLOGIA,
              CNPJ 26.785.748/0001-30, &quot;controlador&quot;) coleta, usa, armazena e
              protege dados pessoais, em conformidade com a Lei Geral de Proteção de
              Dados (Lei 13.709/2018 — LGPD).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">1. Dados que coletamos</h2>
            <p className="mb-2">Coletamos os seguintes dados, conforme o uso do sistema:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Conta:</strong> nome, e-mail e senha (armazenada de forma criptografada).</li>
              <li><strong>Cobrança:</strong> CPF/CNPJ e telefone, para emissão da cobrança via Asaas.</li>
              <li><strong>Membros da igreja:</strong> nome, telefone, e-mail, data de nascimento, foto e outros dados que você cadastrar sobre membros da sua igreja.</li>
              <li><strong>Uso do sistema:</strong> registros de check-in em eventos, lançamentos financeiros e logs técnicos de acesso.</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador e cookies essenciais de sessão.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">2. Papéis: controlador e operador</h2>
            <p>
              Em relação aos dados da sua conta e de cobrança, o Maná Sistemas atua como
              <strong> controlador</strong>. Em relação aos dados de membros e visitantes
              que você cadastra no sistema, a sua igreja é a <strong>controladora</strong>
              (define a finalidade do tratamento) e o Maná Sistemas atua como
              <strong> operador</strong> (processa os dados em seu nome, seguindo suas
              instruções e esta Política).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">3. Finalidades do tratamento</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Criar e manter sua conta e autenticação;</li>
              <li>Processar pagamentos e emitir cobranças de assinatura;</li>
              <li>Disponibilizar as funcionalidades do sistema (financeiro, membros, eventos, check-in);</li>
              <li>Gerar relatórios e comunicações via WhatsApp/e-mail solicitadas por você;</li>
              <li>Cumprir obrigações legais e regulatórias;</li>
              <li>Prevenir fraudes e garantir a segurança da plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">4. Bases legais</h2>
            <p>
              Tratamos dados com base na <strong>execução de contrato</strong> (prestação
              do serviço contratado), no <strong>cumprimento de obrigação legal</strong>
              (ex: dados fiscais de cobrança) e no <strong>legítimo interesse</strong>
              (segurança e prevenção a fraudes). Dados de membros cadastrados por você são
              tratados com base na relação e finalidade que sua igreja define com esses
              titulares.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">5. Compartilhamento de dados</h2>
            <p className="mb-2">Compartilhamos dados apenas com prestadores essenciais à operação do serviço:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> — hospedagem do banco de dados e autenticação;</li>
              <li><strong>Asaas</strong> — processamento de pagamentos e cobranças (recebe CPF/CNPJ, nome, e-mail e telefone do responsável pela conta);</li>
              <li><strong>Vercel</strong> — hospedagem da aplicação.</li>
            </ul>
            <p className="mt-2">
              Não vendemos dados pessoais a terceiros. Dados podem ser divulgados caso
              exigido por lei ou ordem judicial.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">6. Armazenamento e segurança</h2>
            <p>
              Os dados são armazenados em servidores do Supabase com isolamento por
              igreja (tenant) e controle de acesso por perfil (admin, editor,
              visualizador). Senhas nunca são armazenadas em texto puro. Apesar dos
              esforços de segurança, nenhum sistema é 100% livre de risco; em caso de
              incidente de segurança relevante, notificaremos os titulares e a Autoridade
              Nacional de Proteção de Dados (ANPD) conforme exigido pela LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">7. Retenção e exclusão</h2>
            <p>
              Mantemos os dados enquanto sua conta estiver ativa. Após o cancelamento,
              os dados são retidos por até 30 dias para eventual reativação, e então
              excluídos ou anonimizados, exceto quando a lei exigir retenção por prazo
              maior (ex: dados fiscais).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">8. Seus direitos como titular</h2>
            <p className="mb-2">Nos termos da LGPD, você pode solicitar, a qualquer momento:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Confirmação da existência de tratamento e acesso aos dados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Portabilidade dos dados a outro fornecedor;</li>
              <li>Eliminação dos dados tratados com consentimento;</li>
              <li>Informação sobre com quem seus dados foram compartilhados;</li>
              <li>Revogação do consentimento, quando aplicável.</li>
            </ul>
            <p className="mt-2">
              Para exercer esses direitos, entre em contato pelo WhatsApp
              (71) 99944-5787. Se seus dados foram cadastrados por uma igreja da qual
              você é membro, a solicitação também pode ser direcionada diretamente ao
              administrador daquela conta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">9. Cookies</h2>
            <p>
              Utilizamos apenas cookies essenciais de sessão e autenticação, necessários
              para o funcionamento do login. Não utilizamos cookies de rastreamento
              publicitário.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">10. Encarregado de Dados (DPO)</h2>
            <p>
              Encarregado pelo tratamento de dados pessoais: MRS TECNOLOGIA — contato
              via WhatsApp (71) 99944-5787.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">11. Alterações desta Política</h2>
            <p>
              Esta Política pode ser atualizada periodicamente. A versão vigente estará
              sempre disponível nesta página, com a data da última atualização indicada
              no topo.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
