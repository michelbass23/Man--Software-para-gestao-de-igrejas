"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const EVENT_TYPE_LABELS: Record<string, string> = {
  culto: "Culto",
  show: "Show",
  encontro: "Encontro",
  conferencia: "Conferência",
  workshop: "Workshop",
  retiro: "Retiro",
  batismo: "Batismo",
  ceia: "Ceia",
  culto_jovens: "Culto de Jovens",
  culto_criancas: "Culto de Crianças",
  outro: "Outro",
};

interface AttendanceRecord {
  id: string;
  name: string;
  status: "membro" | "visitante";
  phone: string | null;
  checked_in_at: string;
}

interface EventData {
  title: string;
  event_type: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  responsible_name: string | null;
}

interface EventPDFReportProps {
  churchName: string;
  logoUrl: string | null;
  event: EventData;
  attendance: AttendanceRecord[];
  absentMembers: { id: string; name: string; phone: string | null }[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
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
  generatedAt: {
    fontSize: 8,
    color: "#999",
    marginTop: 4,
  },
  eventCard: {
    padding: 15,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  eventInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  eventInfoItem: {
    fontSize: 9,
    color: "#555",
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#666",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryTotal: { backgroundColor: "#FFF8E7", borderColor: "#D4A843" },
  summaryTotalText: { color: "#D4A843" },
  summaryMembers: { backgroundColor: "#F0FFF4", borderColor: "#059669" },
  summaryMembersText: { color: "#059669" },
  summaryVisitors: { backgroundColor: "#EFF6FF", borderColor: "#0EA5E9" },
  summaryVisitorsText: { color: "#0EA5E9" },
  summaryAbsent: { backgroundColor: "#FFFBEB", borderColor: "#D97706" },
  summaryAbsentText: { color: "#D97706" },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
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
  colIndex: { width: "8%" },
  colName: { width: "40%" },
  colPhone: { width: "27%" },
  colStatus: { width: "25%", textAlign: "right" },
  cellText: {
    fontSize: 9,
    color: "#333",
  },
  cellStatus: {
    fontSize: 9,
    fontWeight: "semibold",
    textAlign: "right",
  },
  statusMembro: { color: "#059669" },
  statusVisitante: { color: "#0EA5E9" },
  statusAusente: { color: "#D97706" },
  noData: {
    textAlign: "center",
    color: "#999",
    fontSize: 10,
    paddingVertical: 20,
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
});

export default function EventPDFReport({
  churchName,
  logoUrl,
  event,
  attendance,
  absentMembers,
}: EventPDFReportProps) {
  const members = attendance.filter((a) => a.status === "membro");
  const visitors = attendance.filter((a) => a.status === "visitante");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
            <View>
              <Text style={styles.churchName}>{churchName}</Text>
              <Text style={styles.reportTitle}>Relatório de Evento</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.generatedAt}>
              Gerado em {new Date().toLocaleDateString("pt-BR")}
            </Text>
          </View>
        </View>

        {/* Info do evento */}
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventInfoRow}>
            <Text style={styles.eventInfoItem}>{formatDate(event.event_date)}</Text>
            {event.event_time && (
              <Text style={styles.eventInfoItem}>{event.event_time.slice(0, 5)}</Text>
            )}
            {event.location && (
              <Text style={styles.eventInfoItem}>{event.location}</Text>
            )}
            {event.responsible_name && (
              <Text style={styles.eventInfoItem}>Responsável: {event.responsible_name}</Text>
            )}
            <Text style={styles.eventInfoItem}>
              {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
            </Text>
          </View>
        </View>

        {/* Resumo */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.summaryTotal]}>
            <Text style={styles.summaryLabel}>Total Presentes</Text>
            <Text style={[styles.summaryValue, styles.summaryTotalText]}>
              {attendance.length}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryMembers]}>
            <Text style={styles.summaryLabel}>Membros</Text>
            <Text style={[styles.summaryValue, styles.summaryMembersText]}>
              {members.length}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryVisitors]}>
            <Text style={styles.summaryLabel}>Visitantes</Text>
            <Text style={[styles.summaryValue, styles.summaryVisitorsText]}>
              {visitors.length}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryAbsent]}>
            <Text style={styles.summaryLabel}>Faltosos</Text>
            <Text style={[styles.summaryValue, styles.summaryAbsentText]}>
              {absentMembers.length}
            </Text>
          </View>
        </View>

        {/* Presentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presentes ({attendance.length})</Text>
          {attendance.length === 0 ? (
            <Text style={styles.noData}>Nenhuma presença registrada</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colIndex]}>#</Text>
                <Text style={[styles.tableHeaderText, styles.colName]}>Nome</Text>
                <Text style={[styles.tableHeaderText, styles.colPhone]}>Telefone</Text>
                <Text style={[styles.tableHeaderText, styles.colStatus]}>Status</Text>
              </View>
              {attendance.map((a, i) => (
                <View key={a.id} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : {}]}>
                  <Text style={[styles.cellText, styles.colIndex]}>{i + 1}</Text>
                  <Text style={[styles.cellText, styles.colName]}>{a.name}</Text>
                  <Text style={[styles.cellText, styles.colPhone]}>{a.phone || "—"}</Text>
                  <Text
                    style={[
                      styles.cellStatus,
                      styles.colStatus,
                      a.status === "membro" ? styles.statusMembro : styles.statusVisitante,
                    ]}
                  >
                    {a.status === "membro" ? "Membro" : "Visitante"} · {formatTime(a.checked_in_at)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Faltosos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faltosos ({absentMembers.length})</Text>
          {absentMembers.length === 0 ? (
            <Text style={styles.noData}>Todos os membros compareceram</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colIndex]}>#</Text>
                <Text style={[styles.tableHeaderText, { width: "67%" }]}>Nome</Text>
                <Text style={[styles.tableHeaderText, styles.colStatus]}>Status</Text>
              </View>
              {absentMembers.map((m, i) => (
                <View key={m.id} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : {}]}>
                  <Text style={[styles.cellText, styles.colIndex]}>{i + 1}</Text>
                  <Text style={[styles.cellText, { width: "67%" }]}>{m.name}</Text>
                  <Text style={[styles.cellStatus, styles.colStatus, styles.statusAusente]}>
                    Ausente
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{churchName} - Relatório de Evento</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
