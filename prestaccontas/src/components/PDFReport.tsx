"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
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
  entriesByCategory: { category: string; total: number; count: number }[];
  expensesByCategory: { category: string; total: number; count: number }[];
  totalEntries: number;
  totalExpenses: number;
  balance: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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
    marginBottom: 30,
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
    marginBottom: 30,
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  categorySummaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  categorySummaryCard: {
    width: "30%",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  categorySummaryLabel: {
    fontSize: 8,
    color: "#666",
    marginBottom: 4,
  },
  categorySummaryValue: {
    fontSize: 12,
    fontWeight: "semibold",
    color: "#333",
  },
  categorySummaryCount: {
    fontSize: 7,
    color: "#999",
    marginTop: 2,
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
  noData: {
    textAlign: "center",
    color: "#999",
    fontSize: 10,
    paddingVertical: 20,
  },
});

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
            {data.logoUrl && (
              <Image src={data.logoUrl} style={styles.logo} />
            )}
            <View>
              <Text style={styles.churchName}>{data.churchName}</Text>
              <Text style={styles.reportTitle}>
                Relatório Financeiro Mensal
              </Text>
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

        {/* Entradas por Categoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entradas por Categoria</Text>
          <View style={styles.categorySummaryContainer}>
            {data.entriesByCategory.map((cat) => (
              <View key={cat.category} style={styles.categorySummaryCard}>
                <Text style={styles.categorySummaryLabel}>
                  {CATEGORY_LABELS[cat.category] || cat.category}
                </Text>
                <Text style={styles.categorySummaryValue}>
                  {formatCurrency(cat.total)}
                </Text>
                <Text style={styles.categorySummaryCount}>
                  {cat.count} registro(s)
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Detalhamento de Entradas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhamento de Entradas</Text>
          {data.entries.length === 0 ? (
            <Text style={styles.noData}>
              Nenhuma entrada registrada no período
            </Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colDate]}>
                  Data
                </Text>
                <Text style={[styles.tableHeaderText, styles.colName]}>
                  Nome
                </Text>
                <Text style={[styles.tableHeaderText, styles.colDescription]}>
                  Descrição
                </Text>
                <Text
                  style={[
                    styles.tableHeaderText,
                    styles.colAmount,
                    { textAlign: "right" },
                  ]}
                >
                  Valor
                </Text>
              </View>
              {data.entries.map((entry, i) => (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    i % 2 === 0 ? styles.tableRowEven : {},
                  ]}
                >
                  <Text style={[styles.cellText, styles.colDate]}>
                    {formatDate(entry.date)}
                  </Text>
                  <Text style={[styles.cellText, styles.colName]}>
                    {entry.person_name || "—"}
                  </Text>
                  <Text style={[styles.cellText, styles.colDescription]}>
                    {entry.description ||
                      CATEGORY_LABELS[entry.category] ||
                      "—"}
                  </Text>
                  <Text
                    style={[
                      styles.cellAmount,
                      styles.cellAmountEntry,
                      styles.colAmount,
                    ]}
                  >
                    + {formatCurrency(Number(entry.amount))}
                  </Text>
                </View>
              ))}
              <View style={styles.tableFooter}>
                <Text style={styles.tableFooterLabel}>
                  Total de Entradas
                </Text>
                <Text
                  style={[styles.tableFooterValue, styles.cellAmountEntry]}
                >
                  {formatCurrency(data.totalEntries)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Despesas por Categoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
          <View style={styles.categorySummaryContainer}>
            {data.expensesByCategory.map((cat) => (
              <View key={cat.category} style={styles.categorySummaryCard}>
                <Text style={styles.categorySummaryLabel}>
                  {CATEGORY_LABELS[cat.category] || cat.category}
                </Text>
                <Text style={styles.categorySummaryValue}>
                  {formatCurrency(cat.total)}
                </Text>
                <Text style={styles.categorySummaryCount}>
                  {cat.count} registro(s)
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Detalhamento de Despesas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhamento de Despesas</Text>
          {data.expenses.length === 0 ? (
            <Text style={styles.noData}>
              Nenhuma despesa registrada no período
            </Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colDate]}>
                  Data
                </Text>
                <Text style={[styles.tableHeaderText, styles.colName]}>
                  Nome
                </Text>
                <Text style={[styles.tableHeaderText, styles.colDescription]}>
                  Descrição
                </Text>
                <Text
                  style={[
                    styles.tableHeaderText,
                    styles.colAmount,
                    { textAlign: "right" },
                  ]}
                >
                  Valor
                </Text>
              </View>
              {data.expenses.map((expense, i) => (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    i % 2 === 0 ? styles.tableRowEven : {},
                  ]}
                >
                  <Text style={[styles.cellText, styles.colDate]}>
                    {formatDate(expense.date)}
                  </Text>
                  <Text style={[styles.cellText, styles.colName]}>
                    {expense.person_name || "—"}
                  </Text>
                  <Text style={[styles.cellText, styles.colDescription]}>
                    {expense.description ||
                      CATEGORY_LABELS[expense.category] ||
                      "—"}
                  </Text>
                  <Text
                    style={[
                      styles.cellAmount,
                      styles.cellAmountExpense,
                      styles.colAmount,
                    ]}
                  >
                    - {formatCurrency(Number(expense.amount))}
                  </Text>
                </View>
              ))}
              <View style={styles.tableFooter}>
                <Text style={styles.tableFooterLabel}>
                  Total de Despesas
                </Text>
                <Text
                  style={[styles.tableFooterValue, styles.cellAmountExpense]}
                >
                  {formatCurrency(data.totalExpenses)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {data.churchName} - Relatório Financeiro
          </Text>
          <Text style={styles.footerText}>
            PrestaContas - Sistema de Prestação de Contas
          </Text>
        </View>
      </Page>
    </Document>
  );
}
