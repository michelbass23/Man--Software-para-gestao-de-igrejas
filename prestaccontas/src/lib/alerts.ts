import Swal from "sweetalert2";

// O tema é resolvido no momento da chamada, lendo o data-theme aplicado no
// <html> pelo ThemeProvider (dashboard). Fora do dashboard não há atributo, o
// que cai no tema escuro padrão.
function getTheme() {
  const isLight =
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "light";

  return isLight
    ? {
        background: "#ffffff",
        color: "#18181b",
        confirmButtonColor: "#B4801F",
        cancelButtonColor: "#71717a",
      }
    : {
        background: "#18181B",
        color: "#FAFAFA",
        confirmButtonColor: "#D4A843",
        cancelButtonColor: "#27272A",
      };
}

export async function confirmDelete(options?: {
  title?: string;
  text?: string;
  confirmButtonText?: string;
}): Promise<boolean> {
  const result = await Swal.fire({
    title: options?.title || "Tem certeza?",
    text: options?.text || "Essa ação não pode ser desfeita.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: options?.confirmButtonText || "Sim, excluir",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    ...getTheme(),
    confirmButtonColor: "#DC2626",
  });

  return result.isConfirmed;
}

export async function confirmAction(options: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  icon?: "warning" | "question" | "info";
}): Promise<boolean> {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon || "question",
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || "Confirmar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    ...getTheme(),
  });

  return result.isConfirmed;
}

export function showSuccess(title: string, text?: string) {
  return Swal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText: "OK",
    ...getTheme(),
    confirmButtonColor: "#059669",
  });
}

export function showError(title: string, text?: string) {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "OK",
    ...getTheme(),
    confirmButtonColor: "#DC2626",
  });
}

export function showToast(title: string, icon: "success" | "error" | "info" = "success") {
  const t = getTheme();
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: t.background,
    color: t.color,
    didOpen: (toastEl) => {
      toastEl.addEventListener("mouseenter", Swal.stopTimer);
      toastEl.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  return Toast.fire({ icon, title });
}
