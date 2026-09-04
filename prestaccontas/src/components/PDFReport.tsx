"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
  Circle,
} from "@react-pdf/renderer";

const CATEGORY_LABELS: Record<string, string> = {
  dizimo: "Dízimo",
  oferta: "Oferta",
  doacao: "Doação",
  campanha: "Campanha",
  evento: "Evento",
  outros_entradas: "Outros",
  aluguel: "Aluguel",
  energia: "Energia",
  agua: "Água",
  internet: "Internet",
  manutencao: "Manutenção",
  salarios: "Salários",
  missoes: "Missões",
  eventos: "Eventos",
  material: "Material",
  transporte: "Transporte",
  seguro: "Seguro",
  impostos: "Impostos",
  outros_despesas: "Outros",
};

// Mesmas cores usadas nos gráficos do dashboard, para consistência visual
const ENTRY_COLORS: Record<string, string> = {
  dizimo: "#D4A843",
  oferta: "#059669",
  doacao: "#0EA5E9",
  campanha: "#8B5CF6",
  evento: "#F97316",
  outros_entradas: "#6B7280",
};

const EXPENSE_COLORS: Record<string, string> = {
  aluguel: "#F97316",
  energia: "#EAB308",
  agua: "#06B6D4",
  internet: "#8B5CF6",
  manutencao: "#8B5CF6",
  salarios: "#DC2626",
  missoes: "#06B6D4",
  eventos: "#F97316",
  material: "#6B7280",
  transporte: "#6B7280",
  seguro: "#6B7280",
  impostos: "#6B7280",
  outros_despesas: "#6B7280",
};

const FALLBACK_COLOR = "#9CA3AF";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface CategoryTotal {
  category: string;
  total: number;
  count: number;
}

interface ReportData {
  churchName: string;
  logoUrl: string | null;
  month: number;
  year: number;
  entries: {
    date: string;
    category: string;
    amount: number;
    description?: string;
    person_name?: string;
  }[];
  expenses: {
    date: string;
    category: string;
    amount: number;
    description?: string;
    person_name?: string;
  }[];
  entriesByCategory: CategoryTotal[];
  expensesByCategory: CategoryTotal[];
  totalEntries: number;
  totalExpenses: number;
  balance: number;
}

function formatCurrency(value: number): string {
  return value
    .toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    })
    .replace(/[\u00A0\u202F]/g, " ");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ------------------------------
// Gráfico de rosca (donut) desenhado manualmente em SVG,
// já que o react-pdf não tem suporte nativo a bibliotecas de gráfico.
// ------------------------------

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function donutSlicePath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  // Evita path degenerado quando a fatia é o círculo inteiro (100%)
  const clampedEnd = endAngle - startAngle >= 359.99 ? startAngle + 359.99 : endAngle;

  const startOuter = polarToCartesian(cx, cy, outerR, clampedEnd);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, clampedEnd);
  const largeArc = clampedEnd - startAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

function DonutChartPDF({
  data,
  colors,
  size = 100,
}: {
  data: CategoryTotal[];
  colors: Record<string, string>;
  size?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2;
  const innerR = size / 2.6;

  if (total <= 0) {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={cx} cy={cy} r={outerR} fill="#f0f0f0" />
        <Circle cx={cx} cy={cy} r={innerR} fill="#ffffff" />
      </Svg>
    );
  }

  const slices = data
    .filter((d) => d.total > 0)
    .reduce<{ path: string; color: string; key: string; endAngle: number }[]>(
      (acc, d) => {
        const startAngle = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
        const angle = (d.total / total) * 360;
        const endAngle = startAngle + angle;
        const path = donutSlicePath(cx, cy, outerR, innerR, startAngle, endAngle);
        acc.push({ path, color: colors[d.category] || FALLBACK_COLOR, key: d.category, endAngle });
        return acc;
      },
      []
    );

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s) => (
        <Path key={s.key} d={s.path} fill={s.color} />
      ))}
    </Svg>
  );
}

// ------------------------------
// Barra de comparação Entradas x Despesas
// ------------------------------

function ComparisonBar({
  totalEntries,
  totalExpenses,
}: {
  totalEntries: number;
  totalExpenses: number;
}) {
  const max = Math.max(totalEntries, totalExpenses, 1);
  const entriesPct = Math.max((totalEntries / max) * 100, totalEntries > 0 ? 2 : 0);
  const expensesPct = Math.max((totalExpenses / max) * 100, totalExpenses > 0 ? 2 : 0);

  return (
    <View style={styles.comparisonBarContainer}>
      <View style={styles.comparisonBarRow}>
        <Text style={styles.comparisonBarLabel}>Entradas</Text>
        <View style={styles.comparisonBarTrack}>
          <View
            style={[
              styles.comparisonBarFill,
              { width: `${entriesPct}%`, backgroundColor: "#D4A843" },
            ]}
          />
        </View>
        <Text style={[styles.comparisonBarValue, { color: "#D4A843" }]}>
          {formatCurrency(totalEntries)}
        </Text>
      </View>
      <View style={styles.comparisonBarRow}>
        <Text style={styles.comparisonBarLabel}>Despesas</Text>
        <View style={styles.comparisonBarTrack}>
          <View
            style={[
              styles.comparisonBarFill,
              { width: `${expensesPct}%`, backgroundColor: "#DC2626" },
            ]}
          />
        </View>
        <Text style={[styles.comparisonBarValue, { color: "#DC2626" }]}>
          {formatCurrency(totalExpenses)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#D4A843",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  churchName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "semibold",
    color: "#666",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  period: {
    fontSize: 12,
    fontWeight: "semibold",
    color: "#333",
  },
  generatedAt: {
    fontSize: 8,
    color: "#999",
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryEntries: {
    backgroundColor: "#FFF8E7",
    borderColor: "#D4A843",
  },
  summaryEntriesText: {
    color: "#D4A843",
  },
  summaryExpenses: {
    backgroundColor: "#FFF0F0",
    borderColor: "#DC2626",
  },
  summaryExpensesText: {
    color: "#DC2626",
  },
  summaryBalance: {
    backgroundColor: "#F0FFF4",
    borderColor: "#059669",
  },
  summaryBalanceText: {
    color: "#059669",
  },
  comparisonBarContainer: {
    marginBottom: 24,
    padding: 15,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 8,
  },
  comparisonBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  comparisonBarLabel: {
    fontSize: 9,
    color: "#666",
    width: 55,
  },
  comparisonBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    overflow: "hidden",
  },
  comparisonBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  comparisonBarValue: {
    fontSize: 9,
    fontWeight: "bold",
    width: 75,
    textAlign: "right",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  categorySection: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 15,
    alignItems: "center",
  },
  legendContainer: {
    flex: 1,
    gap: 6,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendLabel: {
    fontSize: 9,
    color: "#444",
  },
  legendValue: {
    fontSize: 9,
    fontWeight: "semibold",
    color: "#333",
  },
  legendCount: {
    fontSize: 7,
    color: "#999",
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#666",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableRowEven: {
    backgroundColor: "#fafafa",
  },
  colDate: {
    width: "15%",
  },
  colName: {
    width: "25%",
  },
  colDescription: {
    width: "35%",
  },
  colAmount: {
    width: "25%",
    textAlign: "right",
  },
  cellText: {
    fontSize: 9,
    color: "#333",
  },
  cellAmount: {
    fontSize: 9,
    fontWeight: "semibold",
    textAlign: "right",
  },
  cellAmountEntry: {
    color: "#059669",
  },
  cellAmountExpense: {
    color: "#DC2626",
  },
  tableFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  tableFooterLabel: {
    fontSize: 10,
    fontWeight: "semibold",
    color: "#333",
  },
  tableFooterValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#999",
  },
  pageNumber: {
    fontSize: 8,
    color: "#999",
  },
  noData: {
    textAlign: "center",
    color: "#999",
    fontSize: 10,
    paddingVertical: 20,
  },
});

function CategoryBreakdown({
  title,
  data,
  colors,
  accentColor,
}: {
  title: string;
  data: CategoryTotal[];
  colors: Record<string, string>;
  accentColor: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.length === 0 ? (
        <Text style={styles.noData}>Nenhum registro no período</Text>
      ) : (
        <View style={styles.categorySection}>
          <DonutChartPDF data={data} colors={colors} size={100} />
          <View style={styles.legendContainer}>
            {data
              .slice()
              .sort((a, b) => b.total - a.total)
              .map((cat) => (
                <View key={cat.category} style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: colors[cat.category] || FALLBACK_COLOR },
                      ]}
                    />
                    <Text style={styles.legendLabel}>
                      {CATEGORY_LABELS[cat.category] || cat.category}
                    </Text>
                    <Text style={styles.legendCount}>({cat.count})</Text>
                  </View>
                  <Text style={[styles.legendValue, { color: accentColor }]}>
                    {formatCurrency(cat.total)}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      )}
    </View>
  );
}

interface PDFReportProps {
  data: ReportData;
}

export default function PDFReport({ data }: PDFReportProps) {
  const monthName = MONTH_NAMES[data.month - 1];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {data.logoUrl && <Image src={data.logoUrl} style={styles.logo} />}
            <View>
              <Text style={styles.churchName}>{data.churchName}</Text>
              <Text style={styles.reportTitle}>Relatório Financeiro Mensal</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.period}>
              {monthName} de {data.year}
            </Text>
            <Text style={styles.generatedAt}>
              Gerado em {new Date().toLocaleDateString("pt-BR")}
            </Text>
          </View>
        </View>

        {/* Resumo Geral */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.summaryEntries]}>
            <Text style={styles.summaryLabel}>Total de Entradas</Text>
            <Text style={[styles.summaryValue, styles.summaryEntriesText]}>
              {formatCurrency(data.totalEntries)}
            </Text>
            <Text style={[styles.summaryLabel, { marginTop: 4 }]}>
              {data.entries.length} registro(s)
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryExpenses]}>
            <Text style={styles.summaryLabel}>Total de Despesas</Text>
            <Text style={[styles.summaryValue, styles.summaryExpensesText]}>
              {formatCurrency(data.totalExpenses)}
            </Text>
            <Text style={[styles.summaryLabel, { marginTop: 4 }]}>
              {data.expenses.length} registro(s)
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryBalance]}>
            <Text style={styles.summaryLabel}>Saldo do Período</Text>
            <Text style={[styles.summaryValue, styles.summaryBalanceText]}>
              {formatCurrency(data.balance)}
            </Text>
            <Text style={[styles.summaryLabel, { marginTop: 4 }]}>
              {data.balance >= 0 ? "Positivo" : "Negativo"}
            </Text>
          </View>
        </View>

        {/* Comparativo visual Entradas x Despesas */}
        <ComparisonBar totalEntries={data.totalEntries} totalExpenses={data.totalExpenses} />

        {/* Entradas por Categoria (com gráfico) */}
        <CategoryBreakdown
          title="Entradas por Categoria"
          data={data.entriesByCategory}
          colors={ENTRY_COLORS}
          accentColor="#D4A843"
        />

        {/* Despesas por Categoria (com gráfico) */}
        <CategoryBreakdown
          title="Despesas por Categoria"
          data={data.expensesByCategory}
          colors={EXPENSE_COLORS}
          accentColor="#DC2626"
        />

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{data.churchName} - Relatório Financeiro</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>

      {/* Segunda página: detalhamento completo das transações */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {data.logoUrl && <Image src={data.logoUrl} style={styles.logo} />}
            <View>
              <Text style={styles.churchName}>{data.churchName}</Text>
              <Text style={styles.reportTitle}>Detalhamento de Transações</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.period}>
              {monthName} de {data.year}
            </Text>
          </View>
        </View>

        {/* Detalhamento de Entradas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhamento de Entradas</Text>
          {data.entries.length === 0 ? (
            <Text style={styles.noData}>Nenhuma entrada registrada no período</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colDate]}>Data</Text>
                <Text style={[styles.tableHeaderText, styles.colName]}>Nome</Text>
                <Text style={[styles.tableHeaderText, styles.colDescription]}>Descrição</Text>
                <Text style={[styles.tableHeaderText, styles.colAmount, { textAlign: "right" }]}>
                  Valor
                </Text>
              </View>
              {data.entries.map((entry, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : {}]}
                >
                  <Text style={[styles.cellText, styles.colDate]}>{formatDate(entry.date)}</Text>
                  <Text style={[styles.cellText, styles.colName]}>
                    {entry.person_name || "—"}
                  </Text>
                  <Text style={[styles.cellText, styles.colDescription]}>
                    {entry.description || CATEGORY_LABELS[entry.category] || "—"}
                  </Text>
                  <Text style={[styles.cellAmount, styles.cellAmountEntry, styles.colAmount]}>
                    + {formatCurrency(Number(entry.amount))}
                  </Text>
                </View>
              ))}
              <View style={styles.tableFooter}>
                <Text style={styles.tableFooterLabel}>Total de Entradas</Text>
                <Text style={[styles.tableFooterValue, styles.cellAmountEntry]}>
                  {formatCurrency(data.totalEntries)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Detalhamento de Despesas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhamento de Despesas</Text>
          {data.expenses.length === 0 ? (
            <Text style={styles.noData}>Nenhuma despesa registrada no período</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colDate]}>Data</Text>
                <Text style={[styles.tableHeaderText, styles.colName]}>Nome</Text>
                <Text style={[styles.tableHeaderText, styles.colDescription]}>Descrição</Text>
                <Text style={[styles.tableHeaderText, styles.colAmount, { textAlign: "right" }]}>
                  Valor
                </Text>
              </View>
              {data.expenses.map((expense, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : {}]}
                >
                  <Text style={[styles.cellText, styles.colDate]}>
                    {formatDate(expense.date)}
                  </Text>
                  <Text style={[styles.cellText, styles.colName]}>
                    {expense.person_name || "—"}
                  </Text>
                  <Text style={[styles.cellText, styles.colDescription]}>
                    {expense.description || CATEGORY_LABELS[expense.category] || "—"}
                  </Text>
                  <Text style={[styles.cellAmount, styles.cellAmountExpense, styles.colAmount]}>
                    - {formatCurrency(Number(expense.amount))}
                  </Text>
                </View>
              ))}
              <View style={styles.tableFooter}>
                <Text style={styles.tableFooterLabel}>Total de Despesas</Text>
                <Text style={[styles.tableFooterValue, styles.cellAmountExpense]}>
                  {formatCurrency(data.totalExpenses)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{data.churchName} - Relatório Financeiro</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
