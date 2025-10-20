import { env } from './env';

export const siteConfig = {
  name: 'FikirCreative Prospector',
  description: 'FikirCreative ekibi için sektör bazlı lead keşif platformu.',
};

export const allowedEmails = env.ALLOWED_EMAILS.split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return allowedEmails.includes(email.toLowerCase());
};
