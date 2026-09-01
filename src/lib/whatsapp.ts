import { CONTACTS } from '@/content/site';

/** Opens WhatsApp with a pre-filled enquiry so the visitor never types from scratch. */
export function whatsappLink(message: string) {
  return `https://wa.me/${CONTACTS.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const telegramLink = `https://t.me/${CONTACTS.telegram}`;
export const instagramLink = `https://instagram.com/${CONTACTS.instagram}`;
export const mailLink = `mailto:${CONTACTS.email}`;
