import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Termos de Uso | Maná Sistemas",
};

export default function TermosPage() {
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

        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Termos de Uso</h1>
        <p className="text-zinc-500 text-sm mb-10">Última atualização: 04 de setembro de 2026</p>

        <div className="prose-legal space-y-8 text-zinc-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">1. Quem somos</h2>
            <p>
              O Maná Sistemas é um serviço de software (SaaS) de gestão administrativa e
              financeira para igrejas, operado por MRS TECNOLOGIA, inscrita no
              CNPJ 26.785.748/0001-30, com sede na Rua Santa Verusa, nº 37, Pernambués,
              Salvador - BA. Para contato, utilize o WhatsApp (71) 99944-5787.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">2. Aceite dos termos</h2>
            <p>
              Ao criar uma conta ou utilizar o Maná Sistemas, você declara ter lido,
              compreendido e concordado integralmente com estes Termos de Uso e com a
              nossa <Link href="/privacidade" className="text-gold hover:underline">Política de Privacidade</Link>.
              Caso não concorde, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">3. Descrição do serviço</h2>
            <p>
              O Maná Sistemas oferece funcionalidades de controle financeiro (entradas,
              despesas e relatórios), gestão de membros, agenda de eventos e check-in
              digital via QR Code, organizadas por igreja (&quot;tenant&quot;), com dados
              isolados entre si.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">4. Cadastro e responsabilidade da conta</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Você é responsável por fornecer informações verdadeiras e mantê-las atualizadas.</li>
              <li>Você é responsável por manter a confidencialidade da sua senha e por toda atividade realizada na sua conta.</li>
              <li>O administrador da conta (perfil &quot;admin&quot;) é responsável por conceder e revogar acessos de outros usuários da mesma igreja.</li>
              <li>Menores de 18 anos não devem criar contas sem supervisão de um responsável.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">5. Assinatura e pagamento</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>O acesso completo ao sistema depende de uma assinatura paga (mensal ou anual), processada por meio do parceiro de pagamentos Asaas.</li>
              <li>Os valores vigentes são exibidos na página de assinatura no momento da contratação.</li>
              <li>A assinatura é renovada automaticamente ao final de cada ciclo, salvo cancelamento prévio.</li>
              <li>Em caso de falha ou atraso no pagamento, o acesso às funcionalidades pode ser suspenso até a regularização.</li>
              <li>Você pode cancelar a assinatura a qualquer momento; o acesso permanece ativo até o fim do período já pago.</li>
              <li>Reembolsos seguem o direito de arrependimento previsto no art. 49 do Código de Defesa do Consumidor: solicitações feitas em até 7 dias corridos após a contratação são reembolsadas integralmente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">6. Uso aceitável</h2>
            <p>Você concorda em não:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Utilizar o serviço para fins ilícitos ou para armazenar dados de terceiros sem base legal para tratá-los;</li>
              <li>Tentar acessar dados de outra igreja (tenant) sem autorização;</li>
              <li>Fazer engenharia reversa, copiar ou revender o software;</li>
              <li>Sobrecarregar a infraestrutura de forma intencional (ex: automações abusivas).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">7. Propriedade dos dados</h2>
            <p>
              Os dados inseridos por você (membros, lançamentos financeiros, eventos)
              pertencem à sua igreja. Você pode exportar relatórios em PDF a qualquer
              momento. Em caso de cancelamento definitivo, os dados serão mantidos por
              30 dias antes da exclusão definitiva, salvo obrigação legal de retenção
              por prazo maior.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">8. Disponibilidade e limitação de responsabilidade</h2>
            <p>
              Empregamos esforços para manter o serviço disponível, mas não garantimos
              operação ininterrupta ou livre de erros. O Maná Sistemas não se
              responsabiliza por decisões financeiras ou administrativas tomadas com base
              nos relatórios gerados, nem por indisponibilidades causadas por terceiros
              (ex: provedores de nuvem, Asaas, internet do usuário).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">9. Alterações destes termos</h2>
            <p>
              Podemos atualizar estes Termos periodicamente. Alterações relevantes serão
              comunicadas por e-mail ou aviso no sistema. O uso continuado após a
              atualização implica aceite dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">10. Foro e legislação aplicável</h2>
            <p>
              Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da
              comarca de Salvador - BA para dirimir eventuais controvérsias, com
              renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">11. Contato</h2>
            <p>Dúvidas sobre estes Termos: WhatsApp (71) 99944-5787.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
