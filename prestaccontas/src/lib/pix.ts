/**
 * PIX QR Code payload generator (EMV BR Code - Banco Central do Brasil)
 * Spec: https://www.bcb.gov.br/content/estabilidadefinanceira/forumpiram/2023/11/02/manual_do_pix_-_anexo_i_-_padrao_para_qrcode.pdf
 */

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id: string, value: string): string {
  return id + value.length.toString().padStart(2, "0") + value;
}

export interface PixPayloadOptions {
  key: string;
  keyType: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txId?: string;
}

export function generatePixPayload(opts: PixPayloadOptions): string {
  // Format key based on type
  let pixKey = opts.key.trim();
  if (opts.keyType === "phone" && !pixKey.startsWith("+")) {
    pixKey = "+55" + pixKey.replace(/\D/g, "");
  }
  if (opts.keyType === "cpf" || opts.keyType === "cnpj") {
    pixKey = pixKey.replace(/\D/g, "");
  }

  // Merchant Account Info (GUI + key)
  const mai = tlv("00", "br.gov.bcb.pix") + tlv("01", pixKey);

  // Payload Format Indicator
  const pfi = tlv("00", "01");

  // Merchant Account Information (ID 26)
  const maiField = tlv("26", mai);

  // Merchant Category Code
  const mcc = tlv("52", "0000");

  // Transaction Currency (986 = BRL)
  const currency = tlv("53", "986");

  // Transaction Amount (optional)
  const amount = opts.amount
    ? tlv("54", opts.amount.toFixed(2))
    : "";

  // Country Code
  const country = tlv("58", "BR");

  // Merchant Name (max 25 chars)
  const name = tlv("59", opts.merchantName.substring(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase());

  // Merchant City (max 15 chars)
  const city = tlv("60", opts.merchantCity.substring(0, 15).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase());

  // Additional Data (Transaction ID)
  const txId = opts.txId ? tlv("05", opts.txId.substring(0, 25)) : tlv("05", "***");
  const additionalData = tlv("62", txId);

  // Build payload without CRC
  const payloadWithoutCrc =
    pfi + maiField + mcc + currency + amount + country + name + city + additionalData + "6304";

  // Calculate CRC16 and append
  return payloadWithoutCrc + crc16(payloadWithoutCrc);
}

export function pixKeyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    cpf: "CPF",
    cnpj: "CNPJ",
    email: "E-mail",
    phone: "Telefone",
    random: "Chave aleatória",
  };
  return labels[type] || type;
}

export function pixKeyTypeMask(type: string): string {
  switch (type) {
    case "cpf":
      return "000.000.000-00";
    case "cnpj":
      return "00.000.000/0000-00";
    case "phone":
      return "(00) 00000-0000";
    default:
      return "";
  }
}

export function formatPixKey(key: string, type: string): string {
  const digits = key.replace(/\D/g, "");
  switch (type) {
    case "cpf":
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    case "cnpj":
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    case "phone":
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    default:
      return key;
  }
}