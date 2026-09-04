"use client";

const SUPPORT_PHONE = "5571999445787";

export default function WhatsAppFloatButton({
  message = "Olá! Tenho uma dúvida sobre o Maná Sistemas.",
}: {
  message?: string;
}) {
  const href = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        className="w-7 h-7"
      >
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.24 0 4.35.87 5.93 2.46a8.23 8.23 0 0 1 2.42 5.85c0 4.56-3.71 8.27-8.35 8.27h-.01a8.3 8.3 0 0 1-4.24-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.28-4.4c0-4.56 3.72-8.27 8.32-8.31Zm4.76 11.7c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.82 1.02-.15.18-.3.2-.56.07-.26-.13-1.09-.4-2.08-1.28-.77-.68-1.29-1.53-1.44-1.79-.15-.26-.02-.4.11-.53.11-.11.26-.3.39-.44.13-.15.17-.26.26-.43.09-.18.04-.33-.02-.46-.07-.13-.59-1.42-.81-1.94-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.46.07-.7.33-.24.26-.92.9-.92 2.19 0 1.29.94 2.54 1.07 2.72.13.18 1.85 2.83 4.49 3.97.63.27 1.12.44 1.5.56.63.2 1.2.17 1.66.1.51-.08 1.54-.63 1.76-1.24.22-.6.22-1.12.15-1.23-.06-.11-.24-.18-.5-.31Z" />
      </svg>
    </a>
  );
}
