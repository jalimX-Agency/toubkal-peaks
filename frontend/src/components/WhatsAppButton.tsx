import type { Dictionary } from "@/i18n/dictionaries/en";
import { whatsappLink } from "@/lib/site";

/** Floating WhatsApp shortcut, bottom right on every page. Most Moroccan tour enquiries start here. */
export function WhatsAppButton({ dict }: { dict: Dictionary["whatsapp"] }) {
  return (
    <a
      href={whatsappLink(dict.message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={dict.label}
      title={dict.label}
      className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-transform hover:scale-105 md:bottom-6 md:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true" fill="currentColor">
        <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.96 12.96 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.68c-1.97 0-3.9-.53-5.58-1.53l-.4-.24-3.96 1.04 1.06-3.86-.26-.4A10.65 10.65 0 0 1 5.35 16c0-5.9 4.8-10.69 10.7-10.69 5.88 0 10.66 4.8 10.66 10.69 0 5.9-4.79 10.68-10.67 10.68Zm5.86-8c-.32-.16-1.9-.94-2.2-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.58-1.6-.95-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.5.14-.65.15-.15.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.09 1.3 3.3.16.21 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.67.77.24 1.46.21 2.01.13.61-.09 1.9-.78 2.16-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
